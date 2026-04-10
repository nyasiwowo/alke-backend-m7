const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser } = require('../controllers/userController');
const { getUsers, updateUser, deleteUser, transferirSaldo } = require('../controllers/userController');

// Definición de los endpoints
router.get('/usuarios', getUsers);
router.put('/usuarios/:id', updateUser);
router.delete('/usuarios/:id', deleteUser);
router.post('/transferir', transferirSaldo);

module.exports = router;