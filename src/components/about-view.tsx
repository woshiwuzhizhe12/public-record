"use client";

import { verifiedOn } from "@/data/catalogue";
import { formatDate } from "@/lib/format";
import { useI18n } from "@/lib/i18n";

export function AboutView() {
  const { lang, t } = useI18n();
  const date = formatDate(verifiedOn, lang);
  return (
    <article className="mx-auto max-w-[680px] px-5 py-12 sm:px-8 sm:py-16">
      <h1 className="text-5xl font-black tracking-[-0.04em]">{t.aboutTitle}</h1>
      <p className="mt-6 text-[15.5px] leading-7 text-muted-foreground">{t.aboutIntro}</p>
      {t.aboutSections.map((section) => (
        <section key={section.title} className="mt-10">
          <h2 className="text-2xl font-black tracking-[-0.03em]">{section.title}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 24)} className="mt-3 text-[15.5px] leading-7 text-muted-foreground">
              {paragraph.replace("{date}", date)}
            </p>
          ))}
        </section>
      ))}
    </article>
  );
}
