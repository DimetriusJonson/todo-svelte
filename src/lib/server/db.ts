import { env } from '$env/dynamic/private';
import postgres from 'postgres'

async function create_tables(sql: any) {
  await sql`CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(64) NOT NULL UNIQUE,
  password    VARCHAR(64) NOT NULL,
  deleted_at  TIMESTAMPTZ DEFAULT NULL,
  token       TEXT DEFAULT NULL
);`;

  await sql`CREATE TABLE IF NOT EXISTS tasks (
  id            SERIAL PRIMARY KEY,
  priority      VARCHAR(4) DEFAULT NULL,
  title         VARCHAR(255) NOT NULL,
  completed_at  TIMESTAMPTZ DEFAULT NULL,
  description   TEXT DEFAULT NULL,
  deleted_at    TIMESTAMPTZ DEFAULT NULL,
  user_id       INTEGER DEFAULT NULL, 
  is_default    BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id)
);`
}

async function createNeonDb() {
  const sql = postgres(env.DATABASE_URL);

  await create_tables(sql);
  return sql;
}

const sql = await createNeonDb();

export default sql;

