const { Pool } = require("pg");

require("dotenv").config();

const databaseUrl = String(process.env.DATABASE_URL || "").trim();

if (!databaseUrl) {
	throw new Error("DATABASE_URL is required. Configure a managed PostgreSQL connection string.");
}

let databaseProtocol;
try {
	databaseProtocol = new URL(databaseUrl).protocol;
} catch (_error) {
	throw new Error("DATABASE_URL must be a valid PostgreSQL connection string.");
}

if (!["postgres:", "postgresql:"].includes(databaseProtocol)) {
	throw new Error("DATABASE_URL must use the postgres:// or postgresql:// protocol.");
}

const poolConfig = {
	connectionString: databaseUrl,
	max: Number(process.env.DB_POOL_MAX) || 10,
	idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS) || 30000,
	connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS) || 10000,
	keepAlive: true,
	ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
};

const pool = new Pool(poolConfig);

pool.on("error", (error) => {
	const logger = require('../shared/utils/logger');
	logger.error({ msg: "Unexpected PostgreSQL client error", error: error.message });
});

module.exports = pool;
