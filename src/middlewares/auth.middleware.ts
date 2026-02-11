import type { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { isBlacklisted } from "../lib/token-blacklist.js";

export const auth = async (c: Context, next: Next) => {
  const header = c.req.header("Authorization");

  if (!header?.startsWith("Bearer ")) {
    return c.json({ error: "Token manquant" }, 401);
  }

  const token = header.slice(7);

  if (isBlacklisted(token)) {
    return c.json({ error: "Token révoqué" }, 401);
  }

  try {
    const payload = await verify(token, process.env.JWT_SECRET!, "HS256");
    c.set("userId", payload.sub);
    c.set("userRole", payload.role);
    await next();
  } catch {
    return c.json({ error: "Token invalide" }, 401);
  }
};

export const requireRole = (...roles: string[]) => {
  return async (c: Context, next: Next) => {
    const userRole = c.get("userRole");

    if (!roles.includes(userRole)) {
      return c.json({ error: "Accès interdit" }, 403);
    }

    await next();
  };
};
