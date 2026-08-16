"use client";

import { useEffect, useState } from "react";

/**
 * Correo con botón de copiar.
 *
 * Existe porque `mailto:` no hace nada en un equipo sin cliente de correo
 * configurado —el caso de mucha gente que usa webmail— y falla en silencio.
 * Aquí la dirección siempre está visible y siempre se puede copiar.
 */
export function CopyEmail({
  email,
  copyLabel,
  copiedLabel,
}: {
  email: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Sin permiso de portapapeles: la dirección sigue visible y
      // seleccionable, que es lo que de verdad importa.
    }
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <a
        href={`mailto:${email}`}
        className="font-medium text-accent underline underline-offset-4"
      >
        {email}
      </a>
      <button
        type="button"
        onClick={copy}
        data-print="hide"
        className="rounded border border-border px-2 py-0.5 text-xs text-text-muted transition-colors hover:border-accent hover:text-accent"
      >
        {copied ? copiedLabel : copyLabel}
      </button>
    </span>
  );
}
