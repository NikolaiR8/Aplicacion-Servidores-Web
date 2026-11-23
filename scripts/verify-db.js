import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Client } = pg;

async function check() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'coursehub',
  });

  try {
    await client.connect();
    console.log('=== CONEXIÓN A BASE DE DATOS LOCAL EXITOSA ===\n');

    console.log('1. Estructura de la tabla "users":');
    const columns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);
    console.table(columns.rows);

    console.log('2. Registros en la tabla "users" (comprobación de hash sin revelar credenciales):');
    const users = await client.query('SELECT id, email, password_hash, created_at FROM users ORDER BY id ASC;');
    
    if (users.rows.length === 0) {
      console.log('No hay usuarios registrados actualmente.');
    } else {
      const safeDisplay = users.rows.map(u => ({
        id: u.id,
        email: u.email,
        hash_format: u.password_hash.startsWith('$2') ? 'bcrypt ($2...)' : 'Desconocido',
        hash_preview: u.password_hash.substring(0, 10) + '...' + u.password_hash.substring(u.password_hash.length - 6),
        hash_length: u.password_hash.length,
        created_at: u.created_at,
      }));
      console.table(safeDisplay);
    }
  } catch (error) {
    console.error('Error conectando a la base de datos:', error.message);
  } finally {
    await client.end();
  }
}

check();
