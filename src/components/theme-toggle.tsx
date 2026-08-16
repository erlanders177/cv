"use client";

/**
 * Cambia entre claro y oscuro.
 *
 * El icono lo decide el CSS a partir de `data-theme` y de la preferencia del
 * sistema, no el estado de React: así aparece correcto ya en el primer
 * render, sin efectos ni parpadeo tras la hidratación.
 */
export function ThemeToggle({ label }: { label: string }) {
  function toggle() {
    const root = document.documentElement;
    const attr = root.getAttribute("data-theme");
    const current =
      attr === "light" || attr === "dark"
        ? attr
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    const next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);

    try {
      localStorage.setItem("theme", next);
    } catch {
      // Almacenamiento bloqueado: el cambio dura lo que dure la sesión.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="grid h-9 w-9 place-items-center rounded-md border border-border text-text-muted transition-colors hover:border-accent hover:text-accent"
    >
      <span aria-hidden="true" className="text-base leading-none">
        <span className="theme-icon-light">☾</span>
        <span className="theme-icon-dark">☀</span>
      </span>
    </button>
  );
}
