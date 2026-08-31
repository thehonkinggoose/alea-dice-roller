#!/usr/bin/env node
import { createServer } from "vite";

const server = await createServer({
  root: process.cwd(),
  logLevel: "error",
  server: { middlewareMode: true, hmr: false },
  appType: "custom",
});

try {
  const mod = await server.ssrLoadModule("/src/lib/test/cli.ts");
  const code = await mod.runCli();
  await server.close();
  process.exit(code);
} catch (err) {
  console.error(err);
  try {
    await server.close();
  } catch {
    /* ignore */
  }
  process.exit(1);
}
