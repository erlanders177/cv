import { describe, expect, it } from "vitest";

import { attachEvidence } from "./skills";
import type { Project, SkillCategory } from "./types";

function project(overrides: Partial<Project> = {}): Project {
  return {
    slug: "proyecto",
    name: "proyecto",
    title: { es: "Proyecto", en: "Project" },
    summary: { es: "", en: "" },
    highlights: [],
    visibility: "public",
    featured: false,
    url: null,
    homepage: null,
    readme: null,
    topics: [],
    languages: [],
    stack: [],
    stars: 0,
    createdAt: "2026-01-01T00:00:00Z",
    pushedAt: "2026-06-01T00:00:00Z",
    role: null,
    teamSize: null,
    status: null,
    images: [],
    links: [],
    order: null,
    ...overrides,
  };
}

const categories: SkillCategory[] = [
  {
    id: "lenguajes",
    label: { es: "Lenguajes", en: "Languages" },
    items: [
      { name: "Python", aliases: ["python"], level: "intermedio" },
      { name: "Pyodide y WebAssembly", aliases: ["pyodide", "webassembly"] },
      { name: "Rust", aliases: ["rust"] },
    ],
  },
];

describe("evidencia de habilidades", () => {
  const projects = [
    project({
      slug: "bioforge",
      languages: [{ name: "Python", bytes: 40000 }],
      pushedAt: "2026-08-01T00:00:00Z",
    }),
    project({
      slug: "axioma",
      languages: [{ name: "Python", bytes: 10000 }],
      topics: ["pyodide", "webassembly"],
      pushedAt: "2026-05-01T00:00:00Z",
    }),
  ];

  const [category] = attachEvidence(categories, projects);
  const [python, pyodide, rust] = category.items;

  it("cuenta los repos que respaldan cada skill", () => {
    expect(python.repoCount).toBe(2);
    expect(python.projects).toEqual(["bioforge", "axioma"]);
  });

  it("suma los bytes de todos los repos", () => {
    expect(python.bytes).toBe(50000);
  });

  it("toma la actividad más reciente como último uso", () => {
    expect(python.lastUsed).toBe("2026-08-01T00:00:00Z");
  });

  it("encuentra la skill por cualquiera de sus alias, no solo por el nombre", () => {
    expect(pyodide.repoCount).toBe(1);
    expect(pyodide.projects).toEqual(["axioma"]);
  });

  it("marca como no respaldada la skill que ningún repo usa", () => {
    expect(rust.unsupported).toBe(true);
    expect(rust.repoCount).toBe(0);
    expect(rust.lastUsed).toBeNull();
  });

  it("cuenta un repo una sola vez aunque coincidan varios alias", () => {
    const [onlyCategory] = attachEvidence(categories, [
      project({ slug: "dual", topics: ["pyodide", "webassembly"] }),
    ]);
    expect(onlyCategory.items[1].repoCount).toBe(1);
  });

  it("reconoce el stack manual, que GitHub no puede detectar", () => {
    const [onlyCategory] = attachEvidence(categories, [
      project({ slug: "manual", stack: ["Rust"] }),
    ]);
    expect(onlyCategory.items[2].unsupported).toBe(false);
  });
});
