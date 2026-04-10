const { sql } = require('../config/db');

// --- LECCIÓN 2: OBTENCIÓN (GET) ---
const getUsers = async (req, res) => {
    try {
        const request = new sql.Request();
        // Consultamos solo los campos seguros, omitiendo el password
        const result = await request.query('SELECT id, nombre, email, saldo FROM usuarios');
        
        res.status(200).json({
            status: 'success',
            message: 'Usuarios obtenidos correctamente',
            data: result.recordset // En mssql, los datos vienen en "recordset"
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error.message);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};

// --- LECCIÓN 3: ACTUALIZACIÓN (PUT) ---
const updateUser = async (req, res) => {
    const { id } = req.params;
    const { nombre, email } = req.body;

    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        // Validación 1: Verificar que el usuario exista
        const checkUser = await request.query('SELECT id FROM usuarios WHERE id = @id');
        if (checkUser.recordset.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        // Ejecutar actualización (solo nombre y email por seguridad financiera)
        request.input('nombre', sql.VarChar, nombre);
        request.input('email', sql.VarChar, email);
        
        await request.query('UPDATE usuarios SET nombre = @nombre, email = @email WHERE id = @id');

        res.status(200).json({ 
            status: 'success', 
            message: `Usuario ${id} actualizado correctamente` 
        });
    } catch (error) {
        console.error('Error al actualizar:', error.message);
        res.status(500).json({ status: 'error', message: 'Error al actualizar el usuario' });
    }
};

// --- LECCIÓN 3: ELIMINACIÓN (DELETE) ---
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const request = new sql.Request();
        request.input('id', sql.Int, id);

        // Validación 1: Verificar que el usuario exista antes de borrar
        const checkUser = await request.query('SELECT id FROM usuarios WHERE id = @id');
        if (checkUser.recordset.length === 0) {
            return res.status(404).json({ status: 'error', message: 'Usuario no encontrado' });
        }

        await request.query('DELETE FROM usuarios WHERE id = @id');
        
        res.status(200).json({ status: 'success', message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar:', error.message);
        res.status(500).json({ status: 'error', message: 'Error al eliminar el usuario' });
    }
};

// --- LECCIÓN 4: TRANSACCIONALIDAD (TRANSFERENCIA CON ROLLBACK) ---
const transferirSaldo = async (req, res) => {
    const { idRemitente, idDestinatario, monto } = req.body;

    // Validación básica de datos
    if (!idRemitente || !idDestinatario || !monto || monto <= 0) {
        return res.status(400).json({ status: 'error', message: 'Datos inválidos para la transferencia' });
    }

    // Iniciamos la transacción
    const transaction = new sql.Transaction();

    try {
        await transaction.begin();
        
        // El Request ahora debe estar atado a la transacción
        const request = new sql.Request(transaction);

        // 1. Verificar que el remitente exista y tenga saldo suficiente
        request.input('idRemitente', sql.Int, idRemitente);
        const remitenteRes = await request.query('SELECT saldo FROM usuarios WHERE id = @idRemitente');
        
        if (remitenteRes.recordset.length === 0) throw new Error('Remitente no encontrado');
        if (remitenteRes.recordset[0].saldo < monto) throw new Error('Saldo insuficiente');

        // 2. Verificar que el destinatario exista
        request.input('idDestinatario', sql.Int, idDestinatario);
        const destinatarioRes = await request.query('SELECT id FROM usuarios WHERE id = @idDestinatario');
        
        if (destinatarioRes.recordset.length === 0) throw new Error('Destinatario no encontrado');

        // 3. Descontar saldo al remitente
        request.input('monto', sql.Decimal(10, 2), monto);
        await request.query('UPDATE usuarios SET saldo = saldo - @monto WHERE id = @idRemitente');

        // --- SIMULACIÓN DE ERROR (Descomenta la siguiente línea para probar el Rollback) ---
        // if (monto === 999) throw new Error('Error de conexión simulado antes de acreditar el dinero');

        // 4. Sumar saldo al destinatario
        await request.query('UPDATE usuarios SET saldo = saldo + @monto WHERE id = @idDestinatario');

        // 5. Si todo salió bien, guardamos los cambios definitivamente (Commit)
        await transaction.commit();

        console.log('✅ Transacción completada con éxito');
        res.status(200).json({ 
            status: 'success', 
            message: `Transferencia de $${monto} realizada correctamente` 
        });

    } catch (error) {
        // Si CUALQUIER paso falla, revertimos TODO a su estado original (Rollback)
        console.error('❌ Error en la transacción, aplicando ROLLBACK:', error.message);
        await transaction.rollback();
        
        res.status(500).json({ 
            status: 'error', 
            message: 'La transferencia falló. Los fondos han sido devueltos.',
            detalle: error.message
        });
    }
};

module.exports = { getUsers, updateUser, deleteUser, transferirSaldo };