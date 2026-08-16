import { describe, expect, it } from "vitest";

import {
  CurationError,
  FEATURED_TOPIC,
  PORTFOLIO_TOPIC,
  curateAll,
  curateRepo,
  type RepoInput,
} from "./curate";
import type { ProjectOverride } from "./types";

/**
 * Estos tests son la red de seguridad del proyecto. Si alguno se pone en rojo,
 * la consecuencia no es una página fea: es información privada publicada en
 * internet. No los relajes para que pase un caso nuevo.
 */

const SECRET_URL = "https://github.com/erlanders177/repo-secreto";
const SECRET_README = "# Cliente Acme\nCredenciales internas y notas privadas.";

function repo(overrides: Partial<RepoInput> = {}): RepoInput {
  return {
    name: "proyecto",
    description: "Descripción pública",
    private: false,
    fork: false,
    archived: false,
    html_url: "https://github.com/erlanders177/proyecto",
    homepage: "https://ejemplo.com",
    topics: [PORTFOLIO_TOPIC],
    stargazers_count: 3,
    created_at: "2026-01-01T00:00:00Z",
    pushed_at: "2026-06-01T00:00:00Z",
    languages: { Python: 5000, C: 1200 },
    readme: "# Proyecto\nContenido del readme.",
    ...overrides,
  };
}

function privateRepo(overrides: Partial<RepoInput> = {}): RepoInput {
  return repo({
    name: "repo-secreto",
    private: true,
    html_url: SECRET_URL,
    homepage: "https://interno.example.com",
    readme: SECRET_README,
    description: "Web del cliente Acme con sus datos internos",
    ...overrides,
  });
}

const privateOverride: ProjectOverride = {
  slug: "repo-secreto",
  title: { es: "Proyecto privado", en: "Private project" },
  summary: { es: "Resumen escrito a mano.", en: "Hand-written summary." },
  highlights: [],
  hidden: false,
  images: [],
  links: [],
  stack: [],
};

describe("opt-in: nada se publica sin el topic", () => {
  it("excluye un repo público que no lleva el topic", () => {
    const result = curateAll([repo({ topics: [] })], []);
    expect(result).toHaveLength(0);
  });

  it("excluye un repo privado que no lleva el topic", () => {
    const result = curateAll([privateRepo({ topics: [] })], [privateOverride]);
    expect(result).toHaveLength(0);
  });

  it("no confunde un topic parecido con el de opt-in", () => {
    const result = curateAll([repo({ topics: ["portfolio-wip", "portfolios"] })], []);
    expect(result).toHaveLength(0);
  });

  it("respeta `hidden` aunque el repo lleve el topic", () => {
    const result = curateAll(
      [repo()],
      [{ ...privateOverride, slug: "proyecto", hidden: true }],
    );
    expect(result).toHaveLength(0);
  });
});

describe("repos privados: solo metadata de la lista blanca", () => {
  it("nunca expone URL, homepage ni README", () => {
    const project = curateRepo(privateRepo(), privateOverride);

    expect(project.visibility).toBe("private");
    expect(project.url).toBeNull();
    expect(project.homepage).toBeNull();
    expect(project.readme).toBeNull();
  });

  it("usa el texto escrito a mano, no la descripción de GitHub", () => {
    const project = curateRepo(privateRepo(), privateOverride);

    expect(project.summary.es).toBe("Resumen escrito a mano.");
    expect(JSON.stringify(project)).not.toContain("Acme");
  });

  it("falla en vez de publicar un privado sin título ni resumen", () => {
    expect(() => curateRepo(privateRepo(), undefined)).toThrow(CurationError);
    expect(() =>
      curateRepo(privateRepo(), { ...privateOverride, summary: undefined }),
    ).toThrow(CurationError);
  });

  it("no deja rastro del repositorio en la salida serializada", () => {
    const serialized = JSON.stringify(
      curateAll([privateRepo()], [privateOverride]),
    );

    expect(serialized).not.toContain(SECRET_URL);
    expect(serialized).not.toContain(SECRET_README);
    expect(serialized).not.toContain("interno.example.com");
  });

  it("conserva la metadata técnica, que sí es publicable", () => {
    const project = curateRepo(privateRepo(), privateOverride);

    expect(project.languages).toEqual([
      { name: "Python", bytes: 5000 },
      { name: "C", bytes: 1200 },
    ]);
    expect(project.createdAt).toBe("2026-01-01T00:00:00Z");
  });
});

describe("repos públicos", () => {
  it("conserva enlaces y README", () => {
    const project = curateRepo(repo());

    expect(project.visibility).toBe("public");
    expect(project.url).toBe("https://github.com/erlanders177/proyecto");
    expect(project.homepage).toBe("https://ejemplo.com");
    expect(project.readme).toContain("Contenido del readme");
  });

  it("cae a la descripción de GitHub cuando no hay override", () => {
    const project = curateRepo(repo());
    expect(project.summary.es).toBe("Descripción pública");
  });

  it("convierte una homepage vacía en null", () => {
    expect(curateRepo(repo({ homepage: "" })).homepage).toBeNull();
  });
});

describe("topics de control", () => {
  it("no los muestra como si fueran temática del proyecto", () => {
    const project = curateRepo(
      repo({ topics: [PORTFOLIO_TOPIC, FEATURED_TOPIC, "python"] }),
    );

    expect(project.topics).toEqual(["python"]);
    expect(project.featured).toBe(true);
  });
});

describe("slugs", () => {
  it("pasa el nombre del repo a minúsculas para la URL", () => {
    const project = curateRepo(repo({ name: "Axioma" }));

    expect(project.slug).toBe("axioma");
    expect(project.name).toBe("Axioma"); // el nombre real se conserva
  });

  it("empareja el override sin importar las mayúsculas", () => {
    const [project] = curateAll(
      [repo({ name: "Axioma" })],
      [{ ...privateOverride, slug: "AXIOMA", order: 5 }],
    );

    expect(project.order).toBe(5);
  });
});

describe("orden", () => {
  it("pone los destacados primero, luego `order`, luego actividad", () => {
    const result = curateAll(
      [
        repo({ name: "viejo", pushed_at: "2026-01-01T00:00:00Z" }),
        repo({ name: "reciente", pushed_at: "2026-08-01T00:00:00Z" }),
        repo({ name: "destacado", topics: [PORTFOLIO_TOPIC, FEATURED_TOPIC] }),
      ],
      [],
    );

    expect(result.map((project) => project.slug)).toEqual([
      "destacado",
      "reciente",
      "viejo",
    ]);
  });

  it("respeta el `order` manual entre destacados", () => {
    const featuredRepo = (name: string) =>
      repo({ name, topics: [PORTFOLIO_TOPIC, FEATURED_TOPIC] });

    const result = curateAll(
      [featuredRepo("b"), featuredRepo("a")],
      [
        { ...privateOverride, slug: "a", order: 1 },
        { ...privateOverride, slug: "b", order: 2 },
      ],
    );

    expect(result.map((project) => project.slug)).toEqual(["a", "b"]);
  });
});
