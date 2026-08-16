import type { MetadataRoute } from "next";

import { getProjects } from "@/lib/content";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getProjects();

  return LOCALES.flatMap((locale) => [
    {
      url: `${SITE_URL}/${locale}`,
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${SITE_URL}/${locale}/proyectos`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...projects.map((project) => ({
      url: `${SITE_URL}/${locale}/proyectos/${project.slug}`,
      lastModified: new Date(project.pushedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]);
}
