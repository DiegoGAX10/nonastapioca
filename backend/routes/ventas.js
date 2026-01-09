import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Generar folio único
function generarFolio() {
  const fecha = new Date();
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, '0');
  const day = String(fecha.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `NT-${year}${month}${day}-${random}`;
}

// Crear nueva venta
router.post('/', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { items, total, metodo_pago, empleado, cliente_uuid, notas } = req.body;
    
    // Validaciones
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'La venta debe tener al menos un producto' });
    }
    
    if (!total || total <= 0) {
      return res.status(400).json({ error: 'El total debe ser mayor a 0' });
    }
    
    if (!metodo_pago) {
      return res.status(400).json({ error: 'Método de pago requerido' });
    }
    
    // Buscar cliente por UUID si se proporcionó
    let clienteId = null;
    if (cliente_uuid) {
      const [clientes] = await connection.query(
        'SELECT id FROM clientes WHERE uuid = ? AND activo = TRUE',
        [cliente_uuid]
      );
      if (clientes.length > 0) {
        clienteId = clientes[0].id;
      }
    }
    
    // Generar folio único
    const folio = generarFolio();
    
    // Insertar venta
    const [ventaResult] = await connection.query(
      `INSERT INTO ventas (folio, cliente_id, subtotal, total, metodo_pago, empleado, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [folio, clienteId, total, total, metodo_pago, empleado || 'Cajero', notas || null]
    );
    
    const ventaId = ventaResult.insertId;
    
    // Insertar detalle de venta
    for (const item of items) {
      const subtotal = item.precio * item.cantidad;
      
      const [detalleResult] = await connection.query(
        `INSERT INTO ventas_detalle 
         (venta_id, producto_id, producto_nombre, tamano, precio_unitario, cantidad, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          ventaId,
          item.producto_id || item.id,
          item.nombre,
          item.tamano || 'unico',
          item.precio,
          item.cantidad || 1,
          subtotal
        ]
      );
      
      const detalleId = detalleResult.insertId;
      
      // Insertar extras si existen
      if (item.extras && item.extras.length > 0) {
        for (const extra of item.extras) {
          await connection.query(
            `INSERT INTO ventas_detalle_extras 
             (venta_detalle_id, extra_id, extra_nombre, precio)
             VALUES (?, ?, ?, ?)`,
            [detalleId, extra.id, extra.nombre, extra.precio]
          );
        }
      }
    }
    
    // Actualizar datos del cliente si existe
    if (clienteId) {
      const puntos = Math.floor(total / 10); // 1 punto por cada $10
      
      await connection.query(
        `UPDATE clientes 
         SET total_compras = total_compras + ?,
             puntos = puntos + ?,
             ultima_compra = NOW()
         WHERE id = ?`,
        [total, puntos, clienteId]
      );
    }
    
    await connection.commit();
    
    res.status(201).json({
      success: true,
      venta_id: ventaId,
      folio: folio,
      total: total,
      message: 'Venta creada exitosamente'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al crear venta', details: error.message });
  } finally {
    connection.release();
  }
});

// Obtener ventas del día
router.get('/hoy', async (req, res) => {
  try {
    const [ventas] = await pool.query(`
      SELECT 
        v.id,
        v.folio,
        v.total,
        v.metodo_pago,
        v.estado,
        v.empleado,
        v.creado_en,
        c.nombre AS cliente,
        (SELECT COUNT(*) FROM ventas_detalle WHERE venta_id = v.id) AS items
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE DATE(v.creado_en) = CURDATE()
      ORDER BY v.creado_en DESC
    `);
    
    // Calcular totales del día
    const totalVentas = ventas.reduce((sum, v) => sum + parseFloat(v.total), 0);
    const cantidadVentas = ventas.length;
    
    res.json({
      ventas,
      resumen: {
        total_ventas: totalVentas,
        cantidad_ventas: cantidadVentas,
        promedio: cantidadVentas > 0 ? (totalVentas / cantidadVentas).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error al obtener ventas del día:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// Obtener detalle de una venta por folio
router.get('/:folio', async (req, res) => {
  try {
    const { folio } = req.params;
    
    // Obtener información de la venta
    const [ventas] = await pool.query(`
      SELECT 
        v.*,
        c.nombre AS cliente_nombre,
        c.telefono AS cliente_telefono
      FROM ventas v
      LEFT JOIN clientes c ON v.cliente_id = c.id
      WHERE v.folio = ?
    `, [folio]);
    
    if (ventas.length === 0) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    
    const venta = ventas[0];
    
    // Obtener items de la venta
    const [items] = await pool.query(`
      SELECT 
        vd.*,
        (SELECT GROUP_CONCAT(
          CONCAT(vde.extra_nombre, ' (+$', vde.precio, ')')
          SEPARATOR ', '
        )
        FROM ventas_detalle_extras vde
        WHERE vde.venta_detalle_id = vd.id) AS extras
      FROM ventas_detalle vd
      WHERE vd.venta_id = ?
    `, [venta.id]);
    
    venta.items = items;
    
    res.json(venta);
  } catch (error) {
    console.error('Error al obtener detalle de venta:', error);
    res.status(500).json({ error: 'Error al obtener venta' });
  }
});

// Obtener reporte de ventas por rango de fechas
router.get('/reporte/fechas', async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (!fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Se requieren fecha_inicio y fecha_fin' });
    }
    
    const [ventas] = await pool.query(`
      SELECT 
        DATE(v.creado_en) AS fecha,
        COUNT(*) AS cantidad_ventas,
        SUM(v.total) AS total_ventas,
        AVG(v.total) AS promedio_venta,
        v.metodo_pago,
        COUNT(DISTINCT v.cliente_id) AS clientes_unicos
      FROM ventas v
      WHERE DATE(v.creado_en) BETWEEN ? AND ?
        AND v.estado = 'completada'
      GROUP BY DATE(v.creado_en), v.metodo_pago
      ORDER BY fecha DESC
    `, [fecha_inicio, fecha_fin]);
    
    res.json(ventas);
  } catch (error) {
    console.error('Error al generar reporte:', error);
    res.status(500).json({ error: 'Error al generar reporte' });
  }
});

export default router;
