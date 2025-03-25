import express, { type Express } from "express";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger, type ViteDevServer } from "vite";
import { type Server } from "http";
import { nanoid } from "nanoid";

// Resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import Vite config safely
import viteConfig from "../vite.config.js"; // Ensure this file exports defineConfig

const viteLogger = createLogger();

// Custom logging function
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Setup Vite server middleware
export async function setupVite(app: Express, server: Server): Promise<ViteDevServer> {
  try {
    const vite = await createViteServer({
      ...viteConfig,
      configFile: false, // Prevent reloading the config file
      customLogger: {
        ...viteLogger,
        error: (msg, options) => {
          viteLogger.error(msg, options);
          if (process.env.NODE_ENV !== "production") {
            process.exit(1);
          }
        },
      },
      server: {
        middlewareMode: true,
        hmr: { server },
        allowedHosts: "all",
        mode: process.env.NODE_ENV || "production",
      },
      appType: "custom",
    });

    app.use(vite.middlewares);

    // Handle HTML requests
    app.use("*", async (req, res, next) => {
      const url = req.originalUrl;

      try {
        const clientTemplate = path.resolve(__dirname, "..", "client", "index.html");

        // Reload index.html dynamically in development
        let template = await fs.promises.readFile(clientTemplate, "utf-8");
        template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
        const page = await vite.transformIndexHtml(url, template);
        res.status(200).set({ "Content-Type": "text/html" }).end(page);
      } catch (e) {
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });

    return vite;
  } catch (error) {
    console.error("Error setting up Vite:", error);
    throw error;
  }
}

// Serve static files after building the project
export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Build directory not found: ${distPath}. Run 'npm run build' first.`);
  }

  app.use(express.static(distPath));

  // Serve index.html for non-existing routes
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
