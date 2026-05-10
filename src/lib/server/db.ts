import Database from "better-sqlite3";
import { env } from '$env/dynamic/private';

const db = new Database(env.DATABASE_URL);

export default db;
