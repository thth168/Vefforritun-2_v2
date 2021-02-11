import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_URL: connectionString,
  NODE_ENV: nodeEnv = 'development',
} = process.env;

console.log('process.env :>> ', process.env.DATABASE_URL);

if (!connectionString) {
  console.error('Vantar DATABASE_URL!');
  process.exit(1);
}

// Notum SSL tengingu við gagnagrunn ef við erum *ekki* í development mode, þ.e.a.s. á local vél
const ssl = nodeEnv !== 'development' ? { rejectUnauthorized: false } : false;

const pool = new pg.Pool({ connectionString, ssl });

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function select() {
  const client = await pool.connect();
  let result;
  try {
    result = await client.query('SELECT * FROM signatures;');
  } catch(e) {
    console.error('Error selecting :>>', e);
  } finally {
    client.release();
    return result.rows;
  }
}

async function insert(name, soc_id, comment = '', anonymous = false) {
  const client = await pool.connect();

  const query = 'INSERT INTO signatures(name, nationalId, comment, anonymous) VALUES($1,$2,$3,$4) RETURNING *';
  const values = [name, soc_id, comment, anonymous];
  let success = true;
  try {
    await client.query(query, values);
  } catch (e) {
    console.error('Error inserting :>>', e)
    success = false;
  } finally {
    client.release();
  }
  return success;
}

export { select, insert };
