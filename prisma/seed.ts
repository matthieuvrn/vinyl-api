import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // users
  const passwordHash = await bcrypt.hash("password123", 10);

  const gerant = await prisma.user.upsert({
    where: { email: "gerant@vinyl.fr" },
    update: {},
    create: {
      email: "gerant@vinyl.fr",
      password: passwordHash,
      role: "gerant",
    },
  });

  const disquaire = await prisma.user.upsert({
    where: { email: "disquaire@vinyl.fr" },
    update: {},
    create: {
      email: "disquaire@vinyl.fr",
      password: passwordHash,
      role: "disquaire",
    },
  });

  console.log("Users created:", gerant.email, disquaire.email);

  // group
  const pinkFloyd = await prisma.group.upsert({
    where: { name: "Pink Floyd" },
    update: {},
    create: { name: "Pink Floyd", genre: "Rock progressif" },
  });

  const daftPunk = await prisma.group.upsert({
    where: { name: "Daft Punk" },
    update: {},
    create: { name: "Daft Punk", genre: "Electro" },
  });

  const nirvana = await prisma.group.upsert({
    where: { name: "Nirvana" },
    update: {},
    create: { name: "Nirvana", genre: "Grunge" },
  });

  console.log("Groups created:", pinkFloyd.name, daftPunk.name, nirvana.name);

  // vinyle
  const vinyls = await Promise.all([
    prisma.vinyl.create({
      data: {
        title: "The Dark Side of the Moon",
        releaseDate: new Date("1973-03-01"),
        condition: "bon",
        price: 29.99,
        stock: 5,
        groupId: pinkFloyd.id,
      },
    }),
    prisma.vinyl.create({
      data: {
        title: "Wish You Were Here",
        releaseDate: new Date("1975-09-12"),
        condition: "neuf",
        price: 34.99,
        stock: 3,
        groupId: pinkFloyd.id,
      },
    }),
    prisma.vinyl.create({
      data: {
        title: "Discovery",
        releaseDate: new Date("2001-03-12"),
        condition: "neuf",
        price: 24.99,
        stock: 8,
        groupId: daftPunk.id,
      },
    }),
    prisma.vinyl.create({
      data: {
        title: "Random Access Memories",
        releaseDate: new Date("2013-05-17"),
        condition: "neuf",
        price: 39.99,
        stock: 10,
        groupId: daftPunk.id,
      },
    }),
    prisma.vinyl.create({
      data: {
        title: "Nevermind",
        releaseDate: new Date("1991-09-24"),
        condition: "use",
        price: 19.99,
        stock: 2,
        groupId: nirvana.id,
      },
    }),
  ]);

  console.log(`${vinyls.length} vinyls created`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
