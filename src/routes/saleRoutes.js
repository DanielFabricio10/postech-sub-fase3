const express = require('express');
const router = express.Router();
const saleController = require('../controllers/SaleController');
const authMiddleware = require('../middlewares/AuthMiddleware');

router.post('/', authMiddleware, async (req, res) => {
    const saleData = req.body;

    try {
        const sales = await saleController.addSale(saleData);
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao gerar nova venda' });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const sales = await saleController.getAllSales();
        res.status(200).json(sales);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar vendas' });
    }
});

router.patch('/update-status/:saleId/:status', authMiddleware, async (req, res) => {
    const { saleId, status } = req.params;

    try {
        const result = await saleController.updateSaleStatus(saleId, status);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
 