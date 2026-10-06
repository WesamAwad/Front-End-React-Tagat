import { useEffect } from "react";
import { Link } from "react-router-dom";

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  items?: string[];
};

type LegalDocumentProps = {
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
  related: { to: string; label: string };
};

export function LegalDocument({ title, description, updatedAt, sections, related }: LegalDocumentProps) {
  useEffect(() => {
    document.title = `${title} | SwiftFix`;
    return () => {
      document.title = "SwiftFix";
    };
  }, [title]);

  return (
    <div className="bg-[#f7f8fb]">
      <nav aria-label="مسار الصفحة" className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <ol className="flex items-center gap-2 text-xs">
          <li>
            <Link to="/" className="text-[#888] transition hover:text-primary">
              الرئيسية
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#ccc]">
            /
          </li>
          <li className="font-medium text-primary" aria-current="page">
            {title}
          </li>
        </ol>
      </nav>

      <header className="mx-auto mt-4 max-w-3xl px-4 sm:px-6">
        <div className="rounded-2xl bg-primary px-6 py-8 text-white sm:px-8">
          <p className="text-xs font-medium text-white/70">آخر تحديث: {updatedAt}</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/85">{description}</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-4 px-4 py-8 sm:px-6">
        {sections.map((section, index) => (
          <article key={section.title} className="rounded-2xl border border-[#efefef] bg-white px-5 py-5 sm:px-6">
            <h2 className="flex items-start gap-3 text-base font-bold text-primary sm:text-lg">
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#fff2e9] text-xs font-bold text-secondary">{index + 1}</span>
              {section.title}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="mt-3 text-sm leading-7 text-[#404040]">
                {paragraph}
              </p>
            ))}
            {section.items ? (
              <ul className="mt-3 space-y-2 text-sm leading-7 text-[#404040]">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-secondary" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}

        <p className="px-1 pt-2 text-sm text-[#525252]">
          اقرأ أيضاً{" "}
          <Link to={related.to} className="font-semibold text-secondary hover:text-secondary-hover">
            {related.label}
          </Link>
          .
        </p>
      </main>
    </div>
  );
}
