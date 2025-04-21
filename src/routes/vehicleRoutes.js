const express = require('express');
const vehicleController = require('../controllers/VehicleController');
const authMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.post('/', async (req, res) => {
    const vehicleData = req.body;

    try {
        const result = await vehicleController.addVehicle(vehicleData);
        res.status(201).json({ message: 'Veículo cadastrado com sucesso!', result });
    } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
        res.status(400).json({ error: error.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    const { status, order } = req.query;
    
    try {
        const vehicles = await vehicleController.getVehicles(status, order);
        res.status(200).json(vehicles);
    } catch (error) {
        console.error('Erro ao buscar veículos:', error.message);
        res.status(500).json({ error: 'Erro ao buscar veículos' });
    }
});

router.get('/:renavam', async (req, res) => {
    const renavam = req.params.renavam;

    try {
        const vehicle = await vehicleController.getVehicleRenavam(renavam);
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao busca veiculo' });
    }
});

router.put('/:renavam', async (req, res) => {
    const renavam = req.params.renavam;
    const updatedData = req.body;

    try {
        const result = await vehicleController.updateVehicle(renavam, updatedData);
        res.status(200).json({ message: 'Veículo atualizado com sucesso!', result });
    } catch (error) {
        console.error('Erro ao editar veículo:', error);
        res.status(400).json({ error: error.message });
    }
});

router.delete('/', async (req, res) => {
    try {
        await vehicleController.deleteAllVehicles({});
        res.status(200).json({ message: 'Todos os veículos foram deletados com sucesso!' });
    } catch (error) {
        console.error('Erro ao deletar veículos:', error);
        res.status(500).json({ error: 'Erro ao deletar veículos' });
    }
});

module.exports = router;