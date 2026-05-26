import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes, seedAdmin } from "../server/routes.js";

const app = express();

app.use(
  express.json({
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

const server = createServer(app);

let initError: Error | null = null;

const ready = (async () => {
  try {
    await registerRoutes(server, app);
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      res.status(status).json({ message: err.message || "Internal Server Error" });
    });
    // Seed admin from env vars — fire-and-forget, never blocks startup
    seedAdmin().catch((e) => console.error("[seedAdmin] unexpected error:", e?.message));
  } catch (e: any) {
    initError = e;
    console.error("[emaraa] init failed:", e?.message, e?.stack);
  }
})();

export default async (req: Request, res: Response) => {
  await ready;
  if (initError) {
    res.status(500).json({ error: "Server init failed", detail: initError.message });
    return;
  }
  return app(req, res);
};
