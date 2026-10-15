
import { prisma } from "../src/app/lib/prisma";

async function main() {
  await prisma.$connect();

  const result = await prisma.$queryRaw<
    { current_database: string; current_schema: string }[]
  >`
    SELECT
      current_database() AS current_database,
      current_schema() AS current_schema
  `;

  console.log("Database connection successful!");
  console.log(result);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
