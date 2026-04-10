const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');


// Middlewares
app.use(cors());
app.use(express.json());
app.use('/api', userRoutes);

// Ruta de prueba inicial
app.get('/', (req, res) => {
    res.json({ message: "Bienvenido a la API de AlkeWallet" });
});

// Función para iniciar el servidor tras conectar a la DB
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("No se pudo iniciar el servidor debido a un error en la DB");
    }
};

startServer();