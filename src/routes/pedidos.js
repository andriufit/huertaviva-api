const express = require('express');
const { pool } = require('../db');

const router = express.Router();

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validarPedido(datos) {
  const nombre = typeof datos.nombre === 'string' ? datos.nombre.trim() : '';
  const email = typeof datos.email === 'string' ? datos.email.trim() : '';
  const comentario = typeof datos.comentario === 'string' ? datos.comentario.trim() : '';
  const productoId = Number(datos.producto_id);
  const cantidad = Number(datos.cantidad);

  if (nombre.length < 2 || nombre.length > 100) return { error: 'El nombre debe tener entre 2 y 100 caracteres' };
  if (!EMAIL.test(email) || email.length > 150) return { error: 'El email no es válido' };
  if (!Number.isInteger(productoId) || productoId <= 0) return { error: 'Producto no válido' };
  if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) return { error: 'La cantidad debe estar entre 1 y 50' };
  if (comentario.length > 500) return { error: 'El comentario no puede superar los 500 caracteres' };

  return { pedido: { nombre, email, comentario, productoId, cantidad } };
}

router.post('/', async (req, res, next) => {
  const { error, pedido } = validarPedido(req.body || {});
  if (error) {
    return res.status(400).json({ error });
  }

  try {
    const [productos] = await pool.execute(
      'SELECT id FROM productos WHERE id = ? AND activo = 1',
      [pedido.productoId]
    );
    if (productos.length === 0) {
      return res.status(400).json({ error: 'El producto no existe o no está disponible' });
    }

    const [resultado] = await pool.execute(
      'INSERT INTO pedidos (producto_id, cantidad, nombre_cliente, email_cliente, comentario) VALUES (?, ?, ?, ?, ?)',
      [pedido.productoId, pedido.cantidad, pedido.nombre, pedido.email, pedido.comentario]
    );
    res.status(201).json({ id: resultado.insertId, mensaje: 'Pedido registrado' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
