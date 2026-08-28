import { pool } from "../config/database.ts";
import path from "path";
import { readFileSync, readdirSync } from "fs";

const setupDatabase = async () => {
  try {
    const sqlFiles = readdirSync(path.join(__dirname, "../database"));
    for (const sqlFile of sqlFiles) {
      const sql = readFileSync(
        path.join(__dirname, "../database", sqlFile),
      ).toString();
      await pool.query(sql);
    }
    await pool.end();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

setupDatabase();
