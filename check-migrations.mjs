import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const migrations = await prisma.$queryRaw`
    SELECT migration_name, checksum, finished_at, rolled_back_at
    FROM "_prisma_migrations"
    ORDER BY started_at
  `;

  console.log(JSON.stringify(migrations, (_, value) =>
    value instanceof Date ? value.toISOString() : value, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
