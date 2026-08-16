import { getProfile } from "@/lib/content";

export function SiteFooter() {
  const profile = getProfile();
  const year = new Date().getFullYear();

  return (
    <footer
      data-print="hide"
      className="border-t border-border py-8 text-sm text-text-subtle"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-3 px-5">
        <p>
          © {year} {profile.name}
        </p>
        <a
          href={`https://github.com/${profile.contact.github}`}
          className="transition-colors hover:text-accent"
          rel="me noreferrer"
          target="_blank"
        >
          github.com/{profile.contact.github}
        </a>
      </div>
    </footer>
  );
}
