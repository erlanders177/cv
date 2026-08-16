import Link from "next/link";

import { LocaleToggle } from "./locale-toggle";
import { ThemeToggle } from "./theme-toggle";
import { getMessages, getProfile } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

const SECTIONS = ["experience", "skills", "projects", "education", "contact"] as const;

export function SiteHeader({ locale }: { locale: Locale }) {
  const profile = getProfile();
  const t = getMessages(locale);

  return (
    <header
      data-print="hide"
      className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-4xl items-center gap-4 px-5 py-3">
        <Link
          href={`/${locale}`}
          className="font-mono text-sm font-semibold tracking-tight text-text hover:text-accent"
        >
          {profile.name}
        </Link>

        <nav
          aria-label={t.meta.cvTitle}
          className="ml-auto hidden items-center gap-5 md:flex"
        >
          {SECTIONS.map((section) => (
            <a
              key={section}
              href={`/${locale}#${section}`}
              className="text-sm text-text-muted transition-colors hover:text-accent"
            >
              {t.nav[section]}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <LocaleToggle locale={locale} label={t.actions.toggleLanguage} />
          <ThemeToggle label={t.actions.toggleTheme} />
        </div>
      </div>
    </header>
  );
}
