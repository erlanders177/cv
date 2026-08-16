import { getProfile, getProjects } from "@/lib/content";
import { pick, type Locale } from "@/lib/i18n";

/**
 * Datos estructurados de tipo Person. Es lo que permite que un buscador
 * entienda que esta página describe a una persona concreta —con su puesto,
 * sus perfiles y lo que sabe hacer— en vez de tratarla como texto suelto.
 */
export function PersonJsonLd({ locale }: { locale: Locale }) {
  const profile = getProfile();
  const projects = getProjects();

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: pick(profile.headline, locale),
    description: pick(profile.summary, locale),
    email: `mailto:${profile.contact.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: pick(profile.contact.location, locale),
    },
    sameAs: [
      `https://github.com/${profile.contact.github}`,
      profile.contact.linkedin,
      ...profile.contact.otherLinks.map((link) => link.url),
    ].filter(Boolean),
    knowsAbout: profile.skills.flatMap((category) =>
      category.items.map((skill) => skill.name),
    ),
    knowsLanguage: profile.spokenLanguages.map((language) => ({
      "@type": "Language",
      name: pick(language.name, locale),
    })),
    // Los proyectos publicados como obra propia: refuerzan la autoría.
    subjectOf: projects
      .filter((project) => project.url)
      .map((project) => ({
        "@type": "SoftwareSourceCode",
        name: pick(project.title, locale),
        description: pick(project.summary, locale),
        codeRepository: project.url,
        programmingLanguage: project.languages.map((language) => language.name),
      })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
