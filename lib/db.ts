import { Pool } from "pg"; 

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "us_to_tc",
  password: "admin",
  port: 5432, // Default PostgreSQL port
});


export default pool;
