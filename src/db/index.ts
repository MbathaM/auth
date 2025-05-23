import 'dotenv/config';
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from './schema';

/**
 * PostgreSQL connection pool using connection string from environment variables.
 * @type {Pool}
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
});

/**
 * Drizzle ORM database instance configured with PostgreSQL pool and schema.
 * Logs queries for debugging.
 * @type {ReturnType<typeof drizzle>}
 */
const db = drizzle({ client: pool, schema, logger: true });

export { db, schema };
