"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LOCALES, type Locale } from "@/lib/i18n";

/**
 * Cambia de idioma conservando la ruta actual: /es/proyectos/x -> /en/proyectos/x.
 */
export function LocaleToggle({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const other = LOCALES.find((l) => l !== locale) ?? locale;
  const target = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${other}`);

  return (
    <Link
      href={target}
      hrefLang={other}
      className="rounded-md border border-border px-2.5 py-1.5 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:text-accent"
    >
      {label}
    </Link>
  );
}
