import { describe, expect, it } from "vitest";

import { getProfile, getProjectOverrides } from "./content";

/**
 * Comprueba el contenido real, no casos inventados. Editar el CV es editar
 * YAML a mano, y estos tests convierten un despiste en un fallo de CI en vez
 * de en un currículum publicado con huecos.
 */

/** Recorre el objeto buscando pares { es, en } para revisarlos. */
function localizedValues(
  value: unknown,
  path: string[] = [],
): { path: string; es: string; en: string }[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      localizedValues(item, [...path, String(index)]),
    );
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);

    if (
      keys.length === 2 &&
      keys.includes("es") &&
      keys.includes("en") &&
      typeof record.es === "string"
    ) {
      return [
        { path: path.join("."), es: record.es, en: record.en as string },
      ];
    }

    return Object.entries(record).flatMap(([key, child]) =>
      localizedValues(child, [...path, key]),
    );
  }

  return [];
}

describe("profile.yaml", () => {
  const profile = getProfile();

  it("valida contra el esquema", () => {
    expect(profile.name).not.toBe("");
    expect(profile.contact.email).toContain("@");
  });

  it("no conserva marcadores TODO sin rellenar", () => {
    const pending = localizedValues(profile).filter(
      (entry) => entry.es.includes("TODO") || entry.en.includes("TODO"),
    );

    expect(pending.map((entry) => entry.path)).toEqual([]);
  });

  it("tiene los dos idiomas rellenos en todos los textos", () => {
    const incomplete = localizedValues(profile).filter(
      (entry) => !entry.es.trim() || !entry.en.trim(),
    );

    expect(incomplete.map((entry) => entry.path)).toEqual([]);
  });

  it("no deja periodos con fecha de fin anterior a la de inicio", () => {
    for (const job of [...profile.experience, ...profile.education]) {
      if (job.end) expect(job.end >= job.start).toBe(true);
    }
  });
});

describe("projects.yaml", () => {
  const overrides = getProjectOverrides();

  it("valida y no repite slugs", () => {
    const slugs = overrides.map((override) => override.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("tiene los dos idiomas rellenos", () => {
    const incomplete = localizedValues(overrides).filter(
      (entry) => !entry.es.trim() || !entry.en.trim(),
    );

    expect(incomplete.map((entry) => entry.path)).toEqual([]);
  });
});
