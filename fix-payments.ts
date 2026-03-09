import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPayments() {
  const result = await prisma.payment.updateMany({
    where: {
      bookingId: {
        in: ['8bf9ea33-f486-4964-a17b-8bccc5a6672b', 'af663b84-a426-4730-9123-7d3a2e9de575']
      }
    },
    data: {
      status: 'PENDING'
    }
  });

  console.log(`Updated ${result.count} payments to PENDING`);
  await prisma.$disconnect();
}

fixPayments();
