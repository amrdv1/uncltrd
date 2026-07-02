const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const article = await prisma.article.findFirst({
    where: { slug: 'datboyjeezo-packlord---love-2-fuck' },
    include: { media: true }
  });
  if (article) {
    console.log("Media:", article.media);
    console.log("Content:", article.content);
  } else {
    console.log("Not found");
  }
}
main();
