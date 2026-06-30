const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.article.findMany({orderBy: {createdAt: 'desc'}, take: 5}).then(res => console.log(res.map(a => ({title: a.title, url: a.imageUrl})))).finally(() => prisma.$disconnect());
