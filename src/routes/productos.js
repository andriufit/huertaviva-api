const express = require('express');
const { pool } = require('../db');

const router = express.Router();

// Catálogo: solo productos activos
router.get('/', async (req, res, next) => {
  try {
    const [productos] = await pool.query(
      'SELECT id, nombre, descripcion, precio, unidad, stock FROM productos WHERE activo = 1 ORDER BY nombre'
    );
    res.json(productos);
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Identificador de producto no válido' });
  }

  try {
    const [filas] = await pool.execute(
      'SELECT id, nombre, descripcion, precio, unidad, stock FROM productos WHERE id = ? AND activo = 1',
      [id]
    );
    if (filas.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(filas[0]);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
