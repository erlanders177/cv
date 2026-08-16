import { getMessages, getProfile } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

/**
 * Botón de "solicitar acceso" para repos privados. Es un `mailto:` con el
 * asunto ya escrito: sin backend, sin formulario que mantener y sin spam.
 */
export function RequestAccess({
  projectName,
  locale,
}: {
  projectName: string;
  locale: Locale;
}) {
  const t = getMessages(locale);
  const { contact } = getProfile();

  const href =
    `mailto:${contact.email}` +
    `?subject=${encodeURIComponent(`${t.requestAccess.subject} ${projectName}`)}` +
    `&body=${encodeURIComponent(t.requestAccess.body)}`;

  return (
    <a
      href={href}
      className="inline-flex items-center rounded-md border border-accent px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
    >
      {t.actions.requestAccess}
    </a>
  );
}
