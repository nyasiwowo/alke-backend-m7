const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/authMiddlewares');
const { upload, uploadProfilePicture } = require('../controllers/uploadController');

// Ruta protegida para subir la imagen de perfil
router.post('/upload', verifyToken, upload.single('imagen'), uploadProfilePicture);

module.exports = router;