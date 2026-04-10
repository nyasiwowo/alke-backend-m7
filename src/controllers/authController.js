const { sql } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    const { email, password } = req.body;

    // Validación básica de campos
    if (!email || !password) {
        return res.status(400).json({ status: 'error', message: 'Email y password son requeridos' });
    }

    try {
        const request = new sql.Request();
        request.input('email', sql.VarChar, email);
        
        // Buscamos al usuario por su email
        const result = await request.query('SELECT * FROM usuarios WHERE email = @email');

        // Si no existe el usuario, devolvemos error 401 (No Autorizado)
        if (result.recordset.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];

        // Validamos la contraseña. 
        // Primero intenta validación directa (para nuestros datos de prueba del módulo 7),
        // luego intenta validación con bcrypt (el estándar para contraseñas reales).
        const validPassword = (password === user.password) || await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ status: 'error', message: 'Credenciales inválidas' });
        }

        //generamos el JWT
        const token = jwt.sign(
            { id: user.id, email: user.email }, // Datos guardados dentro del token (Payload)
            process.env.JWT_SECRET,             // La firma secreta de tu .env
            { expiresIn: '1h' }                 // Tiempo de expiración [cite: 358]
        );

        res.status(200).json({
            status: 'success',
            message: 'Autenticación exitosa',
            token: token
        });

    } catch (error) {
        console.error('Error en el login:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

module.exports = { login };