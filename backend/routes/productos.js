import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Obtener todos los productos activos con su categoría
router.get('/', async (req, res) => {
  try {
    const [productos] = await pool.query(`
      SELECT
        p.id,
        p.codigo,
        p.nombre,
        c.nombre AS categoria,
        p.precio_chico,
        p.precio_grande,
        p.precio_unico,
        p.tiene_tamanos,
        p.descripcion,
        p.imagen_url
      FROM productos p
             INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
      ORDER BY c.orden, p.nombre
    `);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener productos por categoría
router.get('/categoria/:categoriaId', async (req, res) => {
  try {
    const { categoriaId } = req.params;

    const [productos] = await pool.query(`
      SELECT
        p.id,
        p.codigo,
        p.nombre,
        p.precio_chico,
        p.precio_grande,
        p.precio_unico,
        p.tiene_tamanos,
        p.descripcion,
        p.imagen_url
      FROM productos p
      WHERE p.categoria_id = ? AND p.activo = TRUE
      ORDER BY p.nombre
    `, [categoriaId]);

    res.json(productos);
  } catch (error) {
    console.error('Error al obtener productos por categoría:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Obtener un producto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [productos] = await pool.query(`
      SELECT
        p.*,
        c.nombre AS categoria
      FROM productos p
             INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [id]);

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(productos[0]);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// Buscar productos por nombre
router.get('/buscar/:termino', async (req, res) => {
  try {
    const { termino } = req.params;

    const [productos] = await pool.query(`
      SELECT
        p.id,
        p.codigo,
        p.nombre,
        c.nombre AS categoria,
        p.precio_chico,
        p.precio_grande,
        p.precio_unico,
        p.tiene_tamanos
      FROM productos p
             INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.activo = TRUE
        AND (p.nombre LIKE ? OR p.descripcion LIKE ?)
      ORDER BY p.nombre
    `, [`%${termino}%`, `%${termino}%`]);

    res.json(productos);
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});

// Obtener todas las categorías
router.get('/categorias/todas', async (req, res) => {
  try {
    const [categorias] = await pool.query(`
      SELECT id, nombre, orden
      FROM categorias
      WHERE activo = TRUE
      ORDER BY orden
    `);

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// Obtener todos los extras disponibles (ÚNICO ENDPOINT)
router.get('/extras/todos', async (req, res) => {
  try {
    const [extras] = await pool.query(`
      SELECT id, nombre, precio, tipo, categoria_aplicable, subcategoria
      FROM extras
      WHERE activo = TRUE
      ORDER BY categoria_aplicable, subcategoria, nombre
    `);

    res.json(extras);
  } catch (error) {
    console.error('Error al obtener extras:', error);
    res.status(500).json({ error: 'Error al obtener extras' });
  }
});

// Obtener extras por producto específico
router.get('/extras/producto/:productoId', async (req, res) => {
  try {
    const { productoId } = req.params;

    // Obtener producto y su categoría
    const [productos] = await pool.query(`
      SELECT p.*, c.nombre AS categoria
      FROM productos p
      INNER JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = ?
    `, [productoId]);

    if (productos.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const producto = productos[0];
    const categoria = producto.categoria;

    // Obtener extras aplicables
    const [extras] = await pool.query(`
      SELECT id, nombre, precio, tipo, subcategoria
      FROM extras
      WHERE activo = TRUE
        AND (categoria_aplicable LIKE ? OR categoria_aplicable IS NULL)
      ORDER BY subcategoria, nombre
    `, [`%${categoria}%`]);

    res.json(extras);
  } catch (error) {
    console.error('Error al obtener extras:', error);
    res.status(500).json({ error: 'Error al obtener extras' });
  }
});

export default router;