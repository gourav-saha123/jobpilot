const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// 1. Create a Postgres Connection Pool
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Create the Prisma Adapter
const adapter = new PrismaPg(pool);

// 3. Instantiate Prisma with the Adapter
// We stick to the singleton pattern for development safety
let prisma;

prisma = new PrismaClient({ adapter });

module.exports = prisma;