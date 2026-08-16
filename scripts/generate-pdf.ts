/**
 * Genera `public/cv-{locale}.pdf` imprimiendo la ruta /[locale]/cv-print.
 *
 * Imprimir la propia página web, en vez de maquetar el PDF por separado, es
 * lo que garantiza que el documento y el sitio nunca se contradigan. Y como
 * Chromium imprime texto real, el resultado es seleccionable y legible para
 * un ATS.
 *
 *   npm run build && npm run pdf
 */

import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { chromium } from "playwright";

import { LOCALES } from "../src/lib/i18n";

const PORT = Number(process.env.PDF_PORT ?? 3210);
const BASE_URL = `http://127.0.0.1:${PORT}`;
const OUTPUT_DIR = join(process.cwd(), "public");

function startServer(): ChildProcess {
  const server = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "start", "--port", String(PORT)],
    { stdio: "ignore", shell: process.platform === "win32" },
  );
  return server;
}

async function waitForServer(timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE_URL}/es/cv-print`);
      if (response.ok) return;
    } catch {
      // Todavía no escucha; reintentamos.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  throw new Error(
    `El servidor no respondió en ${BASE_URL}. ¿Has ejecutado "npm run build" antes?`,
  );
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const server = startServer();

  try {
    await waitForServer();

    const browser = await chromium.launch();
    const page = await browser.newPage();

    for (const locale of LOCALES) {
      await page.goto(`${BASE_URL}/${locale}/cv-print`, {
        waitUntil: "networkidle",
      });

      // El PDF va siempre en claro: el tema oscuro del visitante no debe
      // acabar imprimiéndose en papel.
      await page.emulateMedia({ media: "print", colorScheme: "light" });

      const output = join(OUTPUT_DIR, `cv-${locale}.pdf`);
      await page.pdf({
        path: output,
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
      });

      console.log(`  · ${output}`);
    }

    await browser.close();
  } finally {
    server.kill();
  }
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
