const multer = require('multer');
const path = require('path');
const { sql } = require('../config/db');

// 1. Configurar dónde y con qué nombre se guardan los archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Se guardarán en la carpeta uploads
    },
    filename: (req, file, cb) => {
        // Le damos un nombre único para que no se sobreescriban
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// 2. Filtro de seguridad: solo aceptar imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Formato no válido. Solo se permiten imágenes.'), false);
    }
};

const upload = multer({ storage, fileFilter });

// 3. Función para guardar la foto en la base de datos
const uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No se subió ningún archivo' });
        }

        const fileName = req.file.filename;
        const userId = req.user.id; // Extraemos el ID del usuario desde el JWT

        // Guardamos el nombre del archivo en el usuario
        const request = new sql.Request();
        request.input('foto', sql.VarChar, fileName);
        request.input('id', sql.Int, userId);
        
        await request.query('UPDATE usuarios SET foto_perfil = @foto WHERE id = @id');

        res.status(200).json({
            status: 'success',
            message: 'Archivo subido y asociado correctamente',
            data: {
                archivo: fileName,
                ruta: `/uploads/${fileName}`
            }
        });
    } catch (error) {
        console.error('Error al procesar archivo:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

module.exports = { upload, uploadProfilePicture };