#!/usr/bin/env node
/**
 * Run the local Next.js dev server against a chosen backend.
 *
 *   npm run dev:local     -> your local Go API (http://localhost:8080)
 *   npm run dev:staging   -> the staging Go API (STAGING_CORE_BACKEND_URL)
 *
 * The browser only ever calls same-origin /api/*; next.config.ts rewrites those
 * requests server-side to CORE_BACKEND_URL. So switching backends needs no CORS
 * changes — this script just sets CORE_BACKEND_URL before starting `next dev`.
 *
 * Backend URLs come from frontend-web/.env.local (see .env.example).
 * Pointing local dev at PRODUCTION is blocked unless ALLOW_PRODUCTION_BACKEND=1,
 * because anything you click locally would then change real escrow data.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import process from "node:process";

const require = createRequire(import.meta.url);
const { loadEnvConfig } = require("@next/env");

const projectDir = process.cwd();
loadEnvConfig(projectDir, true, { info: () => {}, error: console.error });

const TARGETS = {
  local: {
    url: process.env.LOCAL_CORE_BACKEND_URL || "http://localhost:8080",
    hint: "Start the Go API first (docker compose up -d, or `go run ./cmd/api` in core-backend).",
  },
  staging: {
    url: process.env.STAGING_CORE_BACKEND_URL,
    hint: "Set STAGING_CORE_BACKEND_URL in frontend-web/.env.local (see .env.example).",
  },
};

// Hosts that serve real users and real money. Never the default for local dev.
const PRODUCTION_HOSTS = new Set(["api.scrowpoint.com", "scrowpoint.com", "www.scrowpoint.com"]);

const [, , target = "local", ...nextArgs] = process.argv;
const config = TARGETS[target];

if (!config) {
  console.error(`Unknown backend target "${target}". Use one of: ${Object.keys(TARGETS).join(", ")}.`);
  process.exit(1);
}
if (!config.url) {
  console.error(`No backend URL configured for "${target}". ${config.hint}`);
  process.exit(1);
}

let backend;
try {
  backend = new URL(config.url);
} catch {
  console.error(`"${config.url}" is not a valid URL (target "${target}").`);
  process.exit(1);
}

if (PRODUCTION_HOSTS.has(backend.hostname) && process.env.ALLOW_PRODUCTION_BACKEND !== "1") {
  console.error(
    `Refusing to point local dev at the production API (${backend.hostname}).\n` +
      `Use a staging backend instead. If you really mean it, set ALLOW_PRODUCTION_BACKEND=1.`
  );
  process.exit(1);
}

const backendUrl = backend.toString().replace(/\/+$/, "");

async function checkHealth() {
  try {
    const res = await fetch(`${backendUrl}/health`, { signal: AbortSignal.timeout(8000) });
    return res.ok ? "healthy" : `responded ${res.status}`;
  } catch (err) {
    return `unreachable (${err.cause?.code || err.name})`;
  }
}

const health = await checkHealth();
console.log(`\n  Backend target : ${target}`);
console.log(`  CORE_BACKEND_URL: ${backendUrl}`);
console.log(`  /health        : ${health}`);
if (health !== "healthy") console.log(`  ⚠ ${config.hint}`);
console.log("");

const nextBin = require.resolve("next/dist/bin/next");
const child = spawn(process.execPath, [nextBin, "dev", ...nextArgs], {
  stdio: "inherit",
  env: { ...process.env, CORE_BACKEND_URL: backendUrl, SCROWPOINT_BACKEND_TARGET: target },
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}
child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 0);
});
