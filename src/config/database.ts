import { Pool } from "pg";
import "dotenv/config";

const requiredDatabaseVariables = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_NAME",
  "DB_PASSWORD",
] as const;

for (const variable of requiredDatabaseVariables) {
  if (!process.env[variable]) {
    throw new Error(`${variable} must be configured`);
  }
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

try {
  pool
    .query("SELECT NOW()")
    .then((res) =>
      console.log("PostgreSQL connected succesfully", res.rows[0].now),
    );
  pool
    .query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema')AND table_type ='BASE TABLE';",
    )
    .then((res) => {
      console.log("Tables in the database:");
      res.rows.forEach((row) => console.log(row.table_name));
    });
} catch (error) {
  console.log("An error occurred:", error);
}
