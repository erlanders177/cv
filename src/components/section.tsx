/**
 * Sección del currículum. Usa <section> con encabezado real para que tanto
 * los lectores de pantalla como los ATS reconozcan la estructura.
 */
export function Section({
  id,
  title,
  children,
  action,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-20 py-9">
      <div className="mb-5 flex items-baseline justify-between gap-4 border-b border-border pb-2">
        <h2
          id={`${id}-title`}
          className="text-xs font-semibold uppercase tracking-[0.14em] text-text-subtle"
        >
          {title}
        </h2>
        {action}
      </div>
      {children}
    </section>
  );
}
