import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { auth, requireRole } from "../middlewares/auth.middleware.js";
import {
  createVinylSchema,
  updateVinylSchema,
  updateStockSchema,
} from "../schemas/vinyl.schema.js";

const vinylRoutes = new Hono();

vinylRoutes.use(auth);

vinylRoutes.get("/", async (c) => {
  const { condition, genre, groupId, minPrice, maxPrice, groupName } =
    c.req.query();

  const vinyls = await prisma.vinyl.findMany({
    where: {
      ...(condition && { condition: condition as "neuf" | "bon" | "use" }),
      ...(groupId && { groupId }),
      ...(groupName && {
        group: { name: { contains: groupName, mode: "insensitive" } },
      }),
      ...(genre && {
        group: { genre: { contains: genre, mode: "insensitive" } },
      }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { gte: Number(minPrice) }),
          ...(maxPrice && { lte: Number(maxPrice) }),
        },
      }),
    },
    include: { group: true },
    orderBy: { title: "asc" },
  });

  return c.json(vinyls);
});

vinylRoutes.get("/:id", async (c) => {
  const vinyl = await prisma.vinyl.findUnique({
    where: { id: c.req.param("id") },
    include: { group: true },
  });

  if (!vinyl) {
    return c.json({ error: "Vinyl non trouvé" }, 404);
  }

  return c.json(vinyl);
});

vinylRoutes.post("/", requireRole("gerant"), async (c) => {
  const body = await c.req.json();
  const parsed = createVinylSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Données invalides", details: parsed.error.issues }, 400);
  }

  const groupExists = await prisma.group.findUnique({
    where: { id: parsed.data.groupId },
  });

  if (!groupExists) {
    return c.json({ error: "Groupe non trouvé" }, 404);
  }

  const vinyl = await prisma.vinyl.create({
    data: parsed.data,
    include: { group: true },
  });

  return c.json(vinyl, 201);
});

vinylRoutes.put("/:id", async (c) => {
  const body = await c.req.json();
  const parsed = updateVinylSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Données invalides", details: parsed.error.issues }, 400);
  }

  const vinyl = await prisma.vinyl.findUnique({
    where: { id: c.req.param("id") },
  });

  if (!vinyl) {
    return c.json({ error: "Vinyl non trouvé" }, 404);
  }

  if (parsed.data.groupId) {
    const groupExists = await prisma.group.findUnique({
      where: { id: parsed.data.groupId },
    });

    if (!groupExists) {
      return c.json({ error: "Groupe non trouvé" }, 404);
    }
  }

  const updated = await prisma.vinyl.update({
    where: { id: c.req.param("id") },
    data: parsed.data,
    include: { group: true },
  });

  return c.json(updated);
});


vinylRoutes.patch("/:id/stock", async (c) => {
  const body = await c.req.json();
  const parsed = updateStockSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Données invalides", details: parsed.error.issues }, 400);
  }

  const vinyl = await prisma.vinyl.findUnique({
    where: { id: c.req.param("id") },
  });

  if (!vinyl) {
    return c.json({ error: "Vinyl non trouvé" }, 404);
  }

  const updated = await prisma.vinyl.update({
    where: { id: c.req.param("id") },
    data: { stock: parsed.data.stock },
  });

  return c.json(updated);
});

vinylRoutes.delete("/:id", requireRole("gerant"), async (c) => {
  const vinyl = await prisma.vinyl.findUnique({
    where: { id: c.req.param("id") },
  });

  if (!vinyl) {
    return c.json({ error: "Vinyl non trouvé" }, 404);
  }

  await prisma.vinyl.delete({ where: { id: c.req.param("id") } });

  return c.json({ message: "Vinyl supprimé" });
});

export { vinylRoutes };
