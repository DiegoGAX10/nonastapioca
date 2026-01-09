import express from 'express';
import { pool } from '../db.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Registrar nuevo cliente
router.post('/', async (req, res) => {
  try {
    const { nombre, telefono, email } = req.body;
    
    // Validaciones
    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }
    
    // Generar UUID único para el QR
    const uuid = uuidv4();
    
    const [result] = await pool.query(
      `INSERT INTO clientes (uuid, nombre, telefono, email)
       VALUES (?, ?, ?, ?)`,
      [uuid, nombre, telefono || null, email || null]
    );
    
    res.status(201).json({
      success: true,
      cliente_id: result.insertId,
      uuid: uuid,
      qr_code: `NONAS-CLIENTE-${uuid}`,
      message: 'Cliente registrado exitosamente'
    });
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    
    // Verificar si es error de duplicado
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'El cliente ya existe' });
    }
    
    res.status(500).json({ error: 'Error al registrar cliente' });
  }
});

// Buscar cliente por UUID (QR)
router.get('/qr/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    // Limpiar el UUID si viene con prefijo
    const cleanUuid = uuid.replace('NONAS-CLIENTE-', '');
    
    const [clientes] = await pool.query(
      `SELECT 
        id,
        uuid,
        nombre,
        telefono,
        email,
        puntos,
        total_compras,
        fecha_registro,
        ultima_compra
       FROM clientes
       WHERE uuid = ? AND activo = TRUE`,
      [cleanUuid]
    );
    
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(clientes[0]);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
});

// Buscar cliente por teléfono
router.get('/telefono/:telefono', async (req, res) => {
  try {
    const { telefono } = req.params;
    
    const [clientes] = await pool.query(
      `SELECT 
        id,
        uuid,
        nombre,
        telefono,
        email,
        puntos,
        total_compras,
        fecha_registro,
        ultima_compra
       FROM clientes
       WHERE telefono = ? AND activo = TRUE`,
      [telefono]
    );
    
    if (clientes.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(clientes[0]);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error al buscar cliente' });
  }
});

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const { limite = 50, pagina = 1 } = req.query;
    const offset = (pagina - 1) * limite;
    
    const [clientes] = await pool.query(
      `SELECT 
        id,
        uuid,
        nombre,
        telefono,
        email,
        puntos,
        total_compras,
        fecha_registro,
        ultima_compra
       FROM clientes
       WHERE activo = TRUE
       ORDER BY total_compras DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limite), parseInt(offset)]
    );
    
    // Contar total de clientes
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM clientes WHERE activo = TRUE'
    );
    
    res.json({
      clientes,
      total: countResult[0].total,
      pagina: parseInt(pagina),
      limite: parseInt(limite)
    });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// Obtener historial de compras de un cliente
router.get('/:id/historial', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [ventas] = await pool.query(
      `SELECT 
        v.id,
        v.folio,
        v.total,
        v.metodo_pago,
        v.creado_en,
        (SELECT COUNT(*) FROM ventas_detalle WHERE venta_id = v.id) AS items
       FROM ventas v
       WHERE v.cliente_id = ?
       ORDER BY v.creado_en DESC
       LIMIT 20`,
      [id]
    );
    
    res.json(ventas);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener historial' });
  }
});

// Actualizar información del cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, telefono, email } = req.body;
    
    const updates = [];
    const values = [];
    
    if (nombre) {
      updates.push('nombre = ?');
      values.push(nombre);
    }
    
    if (telefono) {
      updates.push('telefono = ?');
      values.push(telefono);
    }
    
    if (email !== undefined) {
      updates.push('email = ?');
      values.push(email);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay datos para actualizar' });
    }
    
    values.push(id);
    
    const [result] = await pool.query(
      `UPDATE clientes SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({ success: true, message: 'Cliente actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// Top clientes por compras
router.get('/top/compradores', async (req, res) => {
  try {
    const { limite = 10 } = req.query;
    
    const [clientes] = await pool.query(
      `SELECT 
        c.id,
        c.nombre,
        c.telefono,
        c.puntos,
        c.total_compras,
        COUNT(v.id) AS cantidad_compras,
        c.ultima_compra
       FROM clientes c
       LEFT JOIN ventas v ON c.id = v.cliente_id
       WHERE c.activo = TRUE
       GROUP BY c.id
       ORDER BY c.total_compras DESC
       LIMIT ?`,
      [parseInt(limite)]
    );
    
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener top clientes:', error);
    res.status(500).json({ error: 'Error al obtener top clientes' });
  }
});

export default router;
