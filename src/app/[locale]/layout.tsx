import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ThemeScript } from "@/components/theme-script";
import { getMessages, getProfile } from "@/lib/content";
import { LOCALES, isLocale, pick } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const profile = getProfile();
  const messages = getMessages(locale);
  const description = pick(profile.summary, locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${profile.name} · ${pick(profile.headline, locale)}`,
      template: `%s · ${profile.name}`,
    },
    description,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: {
      type: "profile",
      locale: locale === "es" ? "es_ES" : "en_US",
      title: `${profile.name} · ${messages.meta.cvTitle}`,
      description,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <html lang={locale} suppressHydrationWarning className="h-full">
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
