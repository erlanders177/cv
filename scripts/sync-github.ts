/**
 * Sincroniza los proyectos desde GitHub.
 *
 * Se ejecuta en GitHub Actions (y en local con un token propio), nunca en el
 * navegador: el token da acceso a repos privados y jamás debe llegar al
 * cliente. La salida es `data/projects.generated.json`, que sí se commitea a
 * propósito — así cada actualización deja un diff revisable de exactamente
 * qué información se está publicando.
 *
 *   GH_PAT=github_pat_… npm run sync
 */

import { writeFileSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { Octokit } from "@octokit/rest";
import { load } from "js-yaml";

import {
  PORTFOLIO_TOPIC,
  curateAll,
  isOptedIn,
  type RepoInput,
} from "../src/lib/curate";
import { projectsFileSchema, type ProjectOverride } from "../src/lib/types";

const OUTPUT_PATH = join(process.cwd(), "data", "projects.generated.json");
const OVERRIDES_PATH = join(process.cwd(), "content", "projects.yaml");

// En local el token vive en .env.local (ignorado por git). En Actions llega
// como variable de entorno y este archivo no existe.
try {
  process.loadEnvFile(join(process.cwd(), ".env.local"));
} catch {
  // No hay .env.local: seguimos con las variables del entorno.
}

function readOverrides(): ProjectOverride[] {
  const parsed = projectsFileSchema.safeParse(
    load(readFileSync(OVERRIDES_PATH, "utf8")),
  );
  if (!parsed.success) {
    throw new Error(
      `content/projects.yaml no es válido:\n${parsed.error.issues
        .map((issue) => `  · ${issue.path.join(".")}: ${issue.message}`)
        .join("\n")}`,
    );
  }
  return parsed.data.projects;
}

async function fetchReadme(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    return Buffer.from(data.content, "base64").toString("utf8");
  } catch (error) {
    // 404 = el repo no tiene README. Cualquier otra cosa sí es un problema.
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

async function main() {
  const token = process.env.GH_PAT ?? process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error(
      "Falta el token. Define GH_PAT con un token de acceso personal " +
        "(permisos: Metadata read, Contents read-only).",
    );
  }

  const octokit = new Octokit({ auth: token });

  const { data: user } = await octokit.users.getAuthenticated();
  console.log(`Cuenta: ${user.login}`);

  // `listForAuthenticatedUser` es la única que devuelve también los privados.
  const repos = await octokit.paginate(octokit.repos.listForAuthenticatedUser, {
    affiliation: "owner",
    per_page: 100,
    sort: "pushed",
  });

  const optedIn = repos.filter((repo) => isOptedIn({ topics: repo.topics ?? [] }));

  console.log(
    `${repos.length} repos en la cuenta, ${optedIn.length} con el topic "${PORTFOLIO_TOPIC}".`,
  );

  if (optedIn.length === 0) {
    console.warn(
      `\n  Ningún repositorio lleva el topic "${PORTFOLIO_TOPIC}".\n` +
        `  Añádelo desde la página del repo en GitHub (⚙ junto a "About")\n` +
        `  para que aparezca en el sitio.\n`,
    );
  }

  const inputs: RepoInput[] = [];

  for (const repo of optedIn) {
    const { data: languages } = await octokit.repos.listLanguages({
      owner: repo.owner.login,
      repo: repo.name,
    });

    // El README solo se pide para repos públicos: lo que no se descarga no
    // se puede filtrar por accidente más adelante.
    const readme = repo.private
      ? null
      : await fetchReadme(octokit, repo.owner.login, repo.name);

    inputs.push({
      name: repo.name,
      description: repo.description,
      private: Boolean(repo.private),
      fork: Boolean(repo.fork),
      archived: Boolean(repo.archived),
      html_url: repo.html_url,
      homepage: repo.homepage ?? null,
      topics: repo.topics ?? [],
      stargazers_count: repo.stargazers_count ?? 0,
      created_at: repo.created_at ?? new Date().toISOString(),
      pushed_at: repo.pushed_at ?? new Date().toISOString(),
      languages,
      readme,
    });
  }

  const projects = curateAll(inputs, readOverrides());

  writeFileSync(OUTPUT_PATH, `${JSON.stringify(projects, null, 2)}\n`, "utf8");

  console.log(`\nPublicando ${projects.length} proyectos:\n`);
  for (const project of projects) {
    const flags = [
      project.visibility === "private" ? "privado" : "público",
      project.featured ? "destacado" : null,
    ].filter(Boolean);
    console.log(`  · ${project.slug} (${flags.join(", ")})`);
  }

  const privateCount = projects.filter((p) => p.visibility === "private").length;
  if (privateCount > 0) {
    console.log(
      `\n  ${privateCount} privado(s) publicados solo con metadata: sin URL, ` +
        `sin homepage y sin README.\n  Revisa el diff de data/projects.generated.json ` +
        `antes de hacer push.`,
    );
  }

  console.log(`\nEscrito en ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}\n`);
  process.exit(1);
});
