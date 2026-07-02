const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables.');
}

const dbUrl = new URL(connectionString);
if (['require', 'prefer', 'verify-ca'].includes(dbUrl.searchParams.get('sslmode'))) {
  dbUrl.searchParams.set('sslmode', 'verify-full');
}

const pool = new Pool({ connectionString: dbUrl.toString() });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = { prisma };