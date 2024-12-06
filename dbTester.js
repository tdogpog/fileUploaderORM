const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const dbTester = async () => {
  try {
    const users = await prisma.user.findMany();
    console.log("users:", users);

    const folder = await prisma.folder.findMany();
    console.log("folder:", folder);

    const file = await prisma.file.findMany();
    console.log("file:", file);

    const session = await prisma.session.findMany();
    console.log("session:", session);
  } finally {
    //disconnect on query scripts
    await prisma.$disconnect();
  }
};

dbTester();
