import { Hono } from "hono";
import bcrypt from "bcryptjs";
import { sign } from "hono/jwt";
import { prisma } from "../lib/prisma.js";
import { loginSchema } from "../schemas/auth.schema.js";
import { auth } from "../middlewares/auth.middleware.js";
import { addToBlacklist } from "../lib/token-blacklist.js";

const authRoutes = new Hono();

authRoutes.post("/login", async (c) => {
  const body = await c.req.json();
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return c.json({ error: "Données invalides", details: parsed.error.issues }, 400);
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return c.json({ error: "Email ou mot de passe incorrect" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return c.json({ error: "Email ou mot de passe incorrect" }, 401);
  }

  const token = await sign(
    { sub: user.id, role: user.role, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 },
    process.env.JWT_SECRET!,
  );

  return c.json({ token });
});

authRoutes.post("/logout", auth, async (c) => {
  const token = c.req.header("Authorization")!.slice(7);
  addToBlacklist(token);
  return c.json({ message: "Déconnexion réussie" });
});

export { authRoutes };
