import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const cwd = process.cwd();
  const possiblePaths = [
    path.resolve(cwd, "dist", "public"),
    path.resolve(cwd, "client", "dist"),
    path.resolve(import.meta.dirname, "..", "..", "dist", "public"),
    path.resolve(import.meta.dirname, "..", "..", "client", "dist"),
  ];

  console.log(`[serveStatic] CWD: ${cwd}`);
  console.log(`[serveStatic] Checking paths: ${JSON.stringify(possiblePaths)}`);

  const distPath = possiblePaths.find(p => fs.existsSync(p));

  if (!distPath) {
    console.error(`[serveStatic] ERROR: No build directory found!`);
    return;
  }

  console.log(`[serveStatic] Serving static files from: ${distPath}`);
  app.use(express.static(distPath));

  // Pour une SPA : toutes les routes non-API renvoient index.html
  app.use("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/trpc")) {
      return next();
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}