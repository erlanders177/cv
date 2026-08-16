import Image from "next/image";
import { notFound } from "next/navigation";

import {
  getFeaturedProjects,
  getMessages,
  getProfile,
  getProjects,
} from "@/lib/content";
import { ageFrom, formatPeriod } from "@/lib/format";
import { LOCALES, isLocale, pick, type Locale } from "@/lib/i18n";
import { attachEvidence } from "@/lib/skills";

/**
 * Versión imprimible: la que Playwright convierte en `public/cv-{locale}.pdf`.
 *
 * Restricciones deliberadas, porque los ATS son literales:
 *  · una sola columna, sin tablas ni cajas flotantes;
 *  · encabezados con los nombres convencionales de cada sección;
 *  · texto real seleccionable, nada de imágenes con texto dentro;
 *  · el teléfono aparece aquí y solo aquí, nunca en la web pública.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata = { robots: { index: false, follow: false } };

export default async function CvPrintPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const profile = getProfile();
  const t = getMessages(locale);
  const skills = attachEvidence(profile.skills, getProjects());
  const featured = getFeaturedProjects();
  const { contact } = profile;

  const contactLine = [
    contact.email,
    contact.phone,
    pick(contact.location, locale),
    profile.birthDate ? `${ageFrom(profile.birthDate)} ${t.labels.yearsOld}` : null,
  ].filter(Boolean);

  const linkLine = [
    `github.com/${contact.github}`,
    contact.linkedin?.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    ...contact.otherLinks.map((link) =>
      link.url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    ),
  ].filter(Boolean);

  return (
    <div className="cv-print">
      <header className="print-header">
        <div>
          <h1>{profile.name}</h1>
          <p className="headline">{pick(profile.headline, locale)}</p>
          <p className="contact">{contactLine.join(" · ")}</p>
          <p className="contact">{linkLine.join(" · ")}</p>
        </div>
        {profile.photo && (
          <Image
            src={profile.photo}
            alt={profile.name}
            width={90}
            height={110}
            className="print-photo"
          />
        )}
      </header>

      <section>
        <h2>{t.sections.summaryTitle}</h2>
        <p>{pick(profile.summary, locale)}</p>
      </section>

      {featured.length > 0 && (
        <section>
          <h2>{t.sections.featuredTitle}</h2>
          {featured.map((project) => (
            <article key={project.slug} className="entry">
              <div className="entry-head">
                <h3>
                  {pick(project.title, locale)}
                  {project.visibility === "private" && (
                    <span className="tag"> ({t.labels.private})</span>
                  )}
                </h3>
                <span className="meta">
                  {project.languages
                    .slice(0, 3)
                    .map((language) => language.name)
                    .join(", ")}
                </span>
              </div>
              <p>{pick(project.summary, locale)}</p>
              {project.highlights.length > 0 && (
                <ul>
                  {project.highlights.slice(0, 2).map((highlight) => (
                    <li key={pick(highlight, locale)}>{pick(highlight, locale)}</li>
                  ))}
                </ul>
              )}
              {(project.url || project.homepage) && (
                <p className="url">{project.url ?? project.homepage}</p>
              )}
            </article>
          ))}
        </section>
      )}

      {profile.experience.length > 0 && (
        <section>
          <h2>{t.sections.experienceTitle}</h2>
          {profile.experience.map((job) => (
            <article key={job.id} className="entry">
              <div className="entry-head">
                <h3>
                  {pick(job.role, locale)} · {job.company}
                </h3>
                <span className="meta">
                  {formatPeriod(job.start, job.end, t.labels.present)}
                </span>
              </div>
              <p className="kind">
                {[t.labels.kind[job.kind], pick(job.location, locale)]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              {job.achievements.length > 0 && (
                <ul>
                  {job.achievements.map((achievement) => (
                    <li key={pick(achievement, locale)}>{pick(achievement, locale)}</li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </section>
      )}

      <section>
        <h2>{t.sections.skillsTitle}</h2>
        {skills.map((category) => (
          <p key={category.id} className="skill-row">
            <strong>{pick(category.label, locale)}:</strong>{" "}
            {category.items
              .map((skill) =>
                skill.level ? `${skill.name} (${t.levels[skill.level]})` : skill.name,
              )
              .join(", ")}
          </p>
        ))}
      </section>

      {profile.education.length > 0 && (
        <section>
          <h2>{t.sections.educationTitle}</h2>
          {profile.education.map((item) => (
            <article key={item.id} className="entry">
              <div className="entry-head">
                <h3>{pick(item.degree, locale)}</h3>
                <span className="meta">
                  {formatPeriod(item.start, item.end, t.labels.present)}
                </span>
              </div>
              {item.notes && <p>{pick(item.notes, locale)}</p>}
            </article>
          ))}
        </section>
      )}

      <section>
        <h2>{t.sections.languagesTitle}</h2>
        <p>
          {profile.spokenLanguages
            .map(
              (language) =>
                `${pick(language.name, locale)}: ${pick(language.level, locale)}`,
            )
            .join(" · ")}
        </p>
      </section>

      {profile.awards.length > 0 && (
        <section>
          <h2>{t.sections.awardsTitle}</h2>
          {profile.awards.map((award) => (
            <p key={pick(award.title, locale)} className="award">
              {pick(award.title, locale)} · {award.issuer} ·{" "}
              {award.date.split("-").reverse().join("/")}
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
