import Database from "better-sqlite3";
import { env } from '$env/dynamic/private';

console.log("env.DATABASE_URL=" + env.DATABASE_URL);
const db = new Database(env.DATABASE_URL);

export default db;

const CREATE_USERS_SQL = `CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY,
  username    VARCHAR(64) NOT NULL UNIQUE,
  password    VARCHAR(64) NOT NULL,
  deleted_at  TIMESTAMPTZ DEFAULT NULL,
  token       TEXT DEFAULT NULL
);`;

const CREATE_TASKS_SQL = `CREATE TABLE IF NOT EXISTS tasks (
  id            INTEGER PRIMARY KEY,
  priority      VARCHAR(4) DEFAULT NULL,
  title         VARCHAR(255) NOT NULL,
  completed_at  TIMESTAMPTZ DEFAULT NULL,
  description   TEXT DEFAULT NULL,
  deleted_at    TIMESTAMPTZ DEFAULT NULL,
  user_id       INTEGER DEFAULT NULL, 
  is_default    BOOLEAN DEFAULT FALSE,
  CONSTRAINT fk_users FOREIGN KEY (user_id) REFERENCES users(id)
);`;

db.exec(CREATE_USERS_SQL);
db.exec(CREATE_TASKS_SQL);
