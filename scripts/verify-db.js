import pg from 'pg';
const { Client } = pg;

async function check() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'coursehub',
  });
  await client.connect();

  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public'
    ORDER BY table_name;
  `);
  console.log('Tables in database:');
  console.log(res.rows.map(r => r.table_name));

  const columns = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = 'users'
    ORDER BY ordinal_position;
  `);
  console.log('Columns in users table:');
  console.table(columns.rows);

  const usersRes = await client.query('SELECT id, email, password_hash, created_at FROM users WHERE email = $1', ['ana@example.com']);
  if (usersRes.rows.length > 0) {
    const row = usersRes.rows[0];
    console.log('User Ana check:');
    console.log({
      id: row.id,
      email: row.email,
      created_at: row.created_at,
      startsWithDollarTwo: row.password_hash.startsWith('$2'),
      hashPrefix: row.password_hash.substring(0, 4) + '...',
      hashLength: row.password_hash.length,
    });
  }

  await client.end();
}

check().catch(console.error);
