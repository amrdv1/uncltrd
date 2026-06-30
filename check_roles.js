const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
  console.log(users);
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
