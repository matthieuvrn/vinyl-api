import { Hono } from "hono";
import { prisma } from "../lib/prisma.js";
import { auth, requireRole } from "../middlewares/auth.middleware.js";
import {
  createGroupSchema,
  updateGroupSchema,
} from "../schemas/group.schema.js";

const groupRoutes = new Hono();

groupRoutes.use(auth);

groupRoutes.get("/", async (c) => {
  const groups = await prisma.group.findMany({
    orderBy: { name: "asc" },
  });

  return c.json(groups);
});

groupRoutes.get("/:id", async (c) => {
  const group = await prisma.group.findUnique({
    where: { id: c.req.param("id") },
    include: { vinyls: true },
  });

  if (!group) {
    return c.json({ error: "Groupe non trouvé" }, 404);
  }

  return c.json(group);
});

groupRoutes.post("/", requireRole("gerant"), async (c) => {
  const body = await c.req.json();
  const parsed = createGroupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Données invalides", details: parsed.error.issues }, 400);
  }

  const group = await prisma.group.create({ data: parsed.data });

  return c.json(group, 201);
});

groupRoutes.put("/:id", async (c) => {
  const body = await c.req.json();
  const parsed = updateGroupSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Données invalides", details: parsed.error.issues }, 400);
  }

  const group = await prisma.group.findUnique({
    where: { id: c.req.param("id") },
  });

  if (!group) {
    return c.json({ error: "Groupe non trouvé" }, 404);
  }

  const updated = await prisma.group.update({
    where: { id: c.req.param("id") },
    data: parsed.data,
  });

  return c.json(updated);
});

groupRoutes.delete("/:id", requireRole("gerant"), async (c) => {
  const group = await prisma.group.findUnique({
    where: { id: c.req.param("id") },
  });

  if (!group) {
    return c.json({ error: "Groupe non trouvé" }, 404);
  }

  await prisma.group.delete({ where: { id: c.req.param("id") } });

  return c.json({ message: "Groupe supprimé" });
});

export { groupRoutes };
