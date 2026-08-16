/**
 * Aplica el tema guardado antes de la primera pintura. Sin esto la página
 * parpadea en claro durante un frame para quien tiene el tema oscuro.
 */
const SCRIPT = `
(function () {
  try {
    var saved = localStorage.getItem("theme");
    if (saved === "dark" || saved === "light") {
      document.documentElement.setAttribute("data-theme", saved);
    }
  } catch (e) {}
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
