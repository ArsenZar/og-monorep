import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed finished (no business data)');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());