require('dotenv').config();

const express = require('express');
const { pool } = require('./db');
const productos = require('./routes/productos');
const pedidos = require('./routes/pedidos');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));

// CORS solo si se ha configurado un origen permitido
if (process.env.CORS_ORIGIN) {
  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
    res.set('Access-Control-Allow-Methods', 'GET, POST');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
  });
}

app.get('/api/salud', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ estado: 'ok', bd: 'ok' });
  } catch (err) {
    res.status(503).json({ estado: 'error', bd: 'sin conexión' });
  }
});

app.use('/api/productos', productos);
app.use('/api/pedidos', pedidos);

app.use((req, res) => {
  res.status(404).json({ error: 'No encontrado' });
});

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON no válido' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno' });
});

const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, HOST, () => {
  console.log(`API de Huerta Viva escuchando en http://${HOST}:${PORT}`);
});
