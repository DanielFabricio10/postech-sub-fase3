const SaleController    = require('../src/controllers/SaleController');
const VehicleController = require('../src/controllers/VehicleController');

const generateRenavam = () => Array.from({ length: 11 }, () => Math.floor(Math.random() * 10)).join('');
const generatePlaca   = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randomLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
    const randomNumbers = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return randomLetters + randomNumbers;
};

describe('Venda de veículos', () => {
    let vehicleData;
    let renavam;

    beforeEach(async () => {
        vehicleData = {
            marca: 'Marca A',
            modelo: 'Modelo X',
            ano: 2015,
            cor: 'Branco',
            preco: 15000,
            renavam: generateRenavam(),
            placa: generatePlaca()
        };

        const vehicle = await VehicleController.addVehicle(vehicleData);
        expect(vehicle.insertedId).toBeDefined();
        renavam = vehicleData.renavam;
    });

    afterEach(async () => {
        await VehicleController.deleteAllVehicles({});
        await SaleController.deleteAllSales({});
    });

    afterAll(async () => {
        await VehicleController.deleteAllVehicles({});
        await SaleController.deleteAllSales({});
    });

    it('deve registrar uma venda e aprovar corretamente', async () => {
        const saleData = {
            cpfCnpj: '55566677788',
            nomeCliente: "João",
            renavam
        };

        const sale = await SaleController.addSale(saleData);
        expect(sale.idPagamento).toBeDefined();

        const vehicle = await VehicleController.getVehicleRenavam(renavam);
        expect(vehicle.status).toBe('vendido');

        const salePaid = await SaleController.updateSaleStatus(sale.idPagamento, 'aprovada');
        expect(salePaid.message).toBe('Status da venda atualizado para aprovada.');
    });

    it('deve registrar uma venda e cancelar corretamente', async () => {
        const saleData = {
            cpfCnpj: '55566677788',
            nomeCliente: "João",
            renavam
        };

        const sale = await SaleController.addSale(saleData);
        expect(sale.idPagamento).toBeDefined();

        const vehicle = await VehicleController.getVehicleRenavam(renavam);
        expect(vehicle.status).toBe('vendido');

        const salePaid = await SaleController.updateSaleStatus(sale.idPagamento, 'cancelada');
        expect(salePaid.message).toBe('Status da venda atualizado para cancelada.');
    });

    it('não deve permitir cancelar e aprovar uma venda já aprovada', async () => {
        const saleData = {
            cpfCnpj: '55566677788',
            nomeCliente: "João",
            renavam
        };
    
        const sale = await SaleController.addSale(saleData);
        expect(sale.idPagamento).toBeDefined();
    
        const saleApproved = await SaleController.updateSaleStatus(sale.idPagamento, 'aprovada');
        expect(saleApproved.message).toBe('Status da venda atualizado para aprovada.');
    
        await expect(SaleController.updateSaleStatus(sale.idPagamento, 'cancelada')).rejects.toThrow(
            'Venda já está aprovada ou cancelada.'
        );

        await expect(SaleController.updateSaleStatus(sale.idPagamento, 'aprovada')).rejects.toThrow(
            'Venda já está aprovada ou cancelada.'
        );
    });

    it('não deve permitir cancelar e aprovar uma venda já cancelada', async () => {
        const saleData = {
            cpfCnpj: '55566677788',
            nomeCliente: "João",
            renavam
        };
    
        const sale = await SaleController.addSale(saleData);
        expect(sale.idPagamento).toBeDefined();
    
        const saleApproved = await SaleController.updateSaleStatus(sale.idPagamento, 'cancelada');
        expect(saleApproved.message).toBe('Status da venda atualizado para cancelada.');
    
        await expect(SaleController.updateSaleStatus(sale.idPagamento, 'aprovada')).rejects.toThrow(
            'Venda já está aprovada ou cancelada.'
        );

        await expect(SaleController.updateSaleStatus(sale.idPagamento, 'cancelada')).rejects.toThrow(
            'Venda já está aprovada ou cancelada.'
        );
    });

    it('não deve permitir realizar a compra de um carro não cadastrado', async () => {
        const saleData = {
            cpfCnpj: '55566677788',
            nomeCliente: 'João',
            renavam: '23232323232'
        };
    
        await expect(SaleController.addSale(saleData)).rejects.toThrow(
            'Veículo não encontrado ou não disponível.'
        );
    });
    
    it('não deve permitir realizar a compra de um carro com status de vendido', async () => {
        const saleData = {
            cpfCnpj: '55566677788',
            nomeCliente: 'João',
            renavam
        };
    
        const sale = await SaleController.addSale(saleData);
        expect(sale.idPagamento).toBeDefined();

        await expect(SaleController.addSale(saleData)).rejects.toThrow(
            'Veículo não encontrado ou não disponível.'
        );
    });
});
