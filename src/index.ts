import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { authRoutes } from "./routes/auth.routes.js";
import { groupRoutes } from "./routes/group.routes.js";
import { vinylRoutes } from "./routes/vinyl.routes.js";

const app = new Hono();
const v1 = new Hono();

v1.route("/auth", authRoutes);
v1.route("/groups", groupRoutes);
v1.route("/vinyls", vinylRoutes);

app.route("/v1", v1);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);
