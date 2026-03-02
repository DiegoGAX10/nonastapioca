import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Obtener información de cuenta para transferencias
router.get('/info-cuenta', async (req, res) => {
    try {
        // Esta información debería estar en una tabla de configuración
        // Por ahora la retornamos hardcodeada
        res.json({
            banco: 'BBVA',
            nombre_titular: 'NONAS TAPIOCA',
            clabe: '012180001234567890',
            numero_cuenta: '1234567890',
            referencia: 'NONAS'
        });
    } catch (error) {
        console.error('Error al obtener info de cuenta:', error);
        res.status(500).json({ error: 'Error al obtener información' });
    }
});

// Registrar comprobante de transferencia
router.post('/comprobante', async (req, res) => {
    try {
        const { venta_id, folio, numero_referencia, monto, fecha_transferencia } = req.body;

        // Validaciones
        if (!venta_id && !folio) {
            return res.status(400).json({ error: 'Se requiere venta_id o folio' });
        }

        if (!numero_referencia || !monto) {
            return res.status(400).json({ error: 'Datos de transferencia incompletos' });
        }

        // Aquí podrías guardar el comprobante en una tabla
        // Por ahora solo confirmamos
        res.json({
            success: true,
            message: 'Comprobante registrado',
            referencia: numero_referencia
        });

    } catch (error) {
        console.error('Error al registrar comprobante:', error);
        res.status(500).json({ error: 'Error al registrar comprobante' });
    }
});

// Verificar estado de transferencia pendiente
router.get('/pendientes', async (req, res) => {
    try {
        // Aquí consultarías las transferencias pendientes de confirmación
        // Por ahora retornamos array vacío
        res.json([]);
    } catch (error) {
        console.error('Error al obtener pendientes:', error);
        res.status(500).json({ error: 'Error al obtener pendientes' });
    }
});

export default router;