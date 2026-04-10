const express = require('express');
const router = express.Router();
const { getUsers, updateUser, deleteUser, transferirSaldo } = require('../controllers/userController');
const verifyToken = require('../middlewares/authMiddlewares');

// Definición de los endpoints
router.get('/usuarios', getUsers);
router.put('/usuarios/:id', updateUser);
router.delete('/usuarios/:id', deleteUser);
router.post('/transferir', transferirSaldo);

module.exports = router;