const { Pool } = require('pg');

const pool = new Pool({
	host: 'localhost',
	port: 5432,
	database: 'postgres',
	user: 'postgres',
	password: '61019745',
	idleTimeoutMillis: 30000, 
	connectionTimeoutMillis: 2000
  });

module.exports = pool;