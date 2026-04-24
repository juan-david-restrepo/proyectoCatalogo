const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  methods: ['GET'],
}));
app.use(express.json());

// ─── Pool de conexiones MySQL ─────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'catalogo_muebles',
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── Rutas ─────────────────────────────────────────────────────────────────────

// GET /api/categorias
app.get('/api/categorias', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categorias ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// GET /api/productos  (todos)
app.get('/api/productos', async (req, res) => {
  try {
    const { ids } = req.query;
    
    if (ids) {
      const idArray = ids.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));
      if (idArray.length === 0) return res.status(400).json({ error: 'IDs inválidos' });
      
      const placeholders = idArray.map(() => '?').join(',');
      const [rows] = await pool.query(`SELECT * FROM productos WHERE id IN (${placeholders})`, idArray);
      return res.json(rows);
    }
    
    const [rows] = await pool.query('SELECT * FROM productos ORDER BY id');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// GET /api/productos/:id
app.get('/api/productos/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

// GET /api/categorias/:categoriaId/productos
app.get('/api/categorias/:categoriaId/productos', async (req, res) => {
  const categoriaId = parseInt(req.params.categoriaId, 10);
  if (isNaN(categoriaId)) return res.status(400).json({ error: 'ID de categoría inválido' });

  const { subcategoria } = req.query;

  try {
    let sql = 'SELECT * FROM productos WHERE categoria_id = ?';
    const params = [categoriaId];

    if (subcategoria) {
      sql += ' AND subcategoria = ?';
      params.push(subcategoria);
    }

    sql += ' ORDER BY id';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos de la categoría' });
  }
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// ─── Arranque ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
