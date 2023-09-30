// db.ts
import { Pool } from "pg";

// Create a new Pool instance with your PostgreSQL connection details
const pool = new Pool({
  user: "postgres",
  host: "localhost", // Change to your PostgreSQL server's host
  database: "todooo",
  password: "1234",
  port: 5432, // Default PostgreSQL port
});

export default pool;
