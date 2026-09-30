import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import "dotenv/config";
const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
// Never return password hashes, including through nested includes.
// Queries that need it must opt back in with `omit: { password: false }`.
const prisma = new PrismaClient({
    adapter,
    omit: {
        user: { password: true },
    },
})

export { prisma }