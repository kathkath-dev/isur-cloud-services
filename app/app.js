const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
app.use(express.urlencoded({ extended: false }));

// Conexión leída desde variables de entorno (definidas en docker-compose.yml)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'isur',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'isurcloud',
  waitForConnections: true,
  connectionLimit: 5
});

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

// Página principal: lista los clientes guardados en MySQL
app.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, nombre, creado_en FROM clientes ORDER BY id');
    const filas = rows
      .map((r) => `<tr><td>${r.id}</td><td>${escapeHtml(r.nombre)}</td><td>${new Date(r.creado_en).toLocaleString('es-PE')}</td></tr>`)
      .join('');
    res.send(`<!doctype html>
<html lang="es"><head><meta charset="UTF-8"><title>ISUR Cloud Services</title>
<style>
  body { font-family: Arial, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; color: #1f2933; }
  h1 { margin-bottom: 4px; } .ok { color: #0e7a3a; font-weight: bold; }
  table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  th, td { border: 1px solid #cbd2d9; padding: 8px; text-align: left; } th { background: #f0f4f8; }
  input { padding: 8px; width: 60%; } button { padding: 8px 14px; }
</style></head>
<body>
  <h1>ISUR Cloud Services</h1>
  <p class="ok">Conectado a MySQL &mdash; ${rows.length} cliente(s) registrado(s)</p>
  <table><tr><th>ID</th><th>Nombre</th><th>Registrado</th></tr>${filas}</table>
  <form method="post" action="/clientes">
    <input name="nombre" placeholder="Nombre del cliente" required maxlength="100">
    <button type="submit">Registrar</button>
  </form>
</body></html>`);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error de conexión con la base de datos');
  }
});

// Registrar un cliente desde el formulario
app.post('/clientes', async (req, res) => {
  const nombre = (req.body.nombre || '').trim();
  if (!nombre) return res.redirect('/');
  try {
    await pool.query('INSERT INTO clientes (nombre) VALUES (?)', [nombre]);
    res.redirect('/');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('No se pudo registrar el cliente');
  }
});

// Health check: confirma que la app responde y que MySQL está disponible
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'up' });
  } catch (err) {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

app.listen(3000, () => {
  console.log('ISUR Cloud Services escuchando en puerto 3000');
});
