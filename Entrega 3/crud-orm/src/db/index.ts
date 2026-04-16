import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

const sqlite = new Database("banco.db");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS uf (
    id    TEXT PRIMARY KEY,
    nome  TEXT NOT NULL,
    sigla TEXT NOT NULL UNIQUE
  );

  CREATE TABLE IF NOT EXISTS cidade (
    id    TEXT PRIMARY KEY,
    nome  TEXT NOT NULL,
    uf_id TEXT NOT NULL REFERENCES uf(id)
  );

  CREATE TABLE IF NOT EXISTS regiao (
    id         TEXT PRIMARY KEY,
    nome       TEXT NOT NULL,
    cidade_id  TEXT NOT NULL REFERENCES cidade(id)
  );
`);

export const db = drizzle(sqlite, { schema });
