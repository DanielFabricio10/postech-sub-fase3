const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');

router.post('/', async (req, res) => {
    const clientData = req.body;

    try {
        const client = await userController.validUser(clientData);
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ error: error.message ?? 'Erro ao processar requisição' });
    }
});

router.get('/', async (req, res) => {
    try {
        const users = await userController.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuarios' });
    }
});

module.exports = router;
 