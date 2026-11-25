"use client";

import { Suspense, useMemo, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { activePeople, getVideo, personFromQuery, personHome, type Person } from "@/data/catalogue";
import { portraits } from "@/data/portraits";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "cn";

export function PersonRail() {
  return (
    <Suspense fallback={null}>
      <PersonRailBody />
    </Suspense>
  );
}

function PersonRailBody() {
  const pathname = usePathname();
  const search = useSearchParams();
  const router = useRouter();
  const { lang, t } = useI18n();
  const videoId = pathname.startsWith("/v/") ? pathname.split("/")[2] : undefined;
  const record = videoId ? getVideo(videoId) : undefined;
  const requested = search.get("person");
  const slug = record
    ? requested && record.people.includes(requested)
      ? requested
      : record.person
    : requested;
  const current = personFromQuery(slug);
  const people = activePeople();
  const [pinned, setPinned] = useState<string | null | undefined>(undefined);

  const groups = useMemo(() => {
    const map = new Map<string, Person[]>();
    for (const person of people) {
      const letter = (lang === "zh" ? person.letter.zh : person.letter.en).toUpperCase();
      const list = map.get(letter) ?? [];
      list.push(person);
      map.set(letter, list);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [lang, people]);

  const currentLetter = (lang === "zh" ? current.letter.zh : current.letter.en).toUpperCase();
  const shownLetter =
    pinned && groups.some(([letter]) => letter === pinned) ? pinned : pinned === null ? null : currentLetter;
  const shownPeople = groups.find(([letter]) => letter === shownLetter)?.[1] ?? [];

  return (
    <aside aria-label={t.personSwitch} className="sticky top-0 z-20 flex max-h-[40vh] shrink-0 flex-col border-b border-border bg-background md:h-screen md:max-h-screen md:w-[4.25rem] md:border-r md:border-b-0 data-[open=true]:md:w-64" data-open={shownLetter ? "true" : "false"}>
      <div className="flex gap-1 overflow-x-auto px-2 py-2 md:flex-1 md:flex-col md:overflow-y-auto md:px-2 md:py-4">
        {groups.map(([letter]) => {
          const selected = letter === currentLetter;
          const open = letter === shownLetter;
          return (
            <button
              key={letter}
              type="button"
              aria-expanded={open}
              aria-current={selected ? "true" : undefined}
              onClick={() =>
                setPinned((value) => {
                  const active = value && groups.some(([item]) => item === value) ? value : value === null ? null : currentLetter;
                  return active === letter ? null : letter;
                })
              }
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-full text-sm font-black tracking-tight",
                open || selected ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {letter}
            </button>
          );
        })}
      </div>
      {shownPeople.length > 0 ? (
        <ul className="flex gap-2 overflow-x-auto border-t border-border px-2 py-2 md:flex-col md:overflow-visible md:border-t-0 md:px-3 md:pt-0 md:pb-4">
          {shownPeople.map((person) => {
            const selected = person.slug === current.slug;
            const label = lang === "zh" ? person.nameZh : person.name;
            const mark = avatarMark(person, lang);
            const portrait = portraits[person.slug];
            return (
              <li key={person.slug}>
                <button
                  type="button"
                  onClick={() => router.push(personHome(person.slug))}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-full py-1 pr-3 text-left",
                    selected ? "bg-muted" : "hover:bg-muted",
                  )}
                  aria-current={selected ? "page" : undefined}
                >
                  {portrait ? (
                    <Image
                      src={portrait}
                      alt=""
                      width={40}
                      height={40}
                      className={cn(
                        "size-10 shrink-0 rounded-full object-cover",
                        selected ? "ring-2 ring-foreground" : "ring-1 ring-border",
                      )}
                    />
                  ) : (
                    <span
                      className={cn(
                        "grid size-10 shrink-0 place-items-center rounded-full text-[11px] font-black tracking-tight",
                        selected ? "bg-foreground text-background" : "border border-border bg-background",
                      )}
                      aria-hidden
                    >
                      {mark}
                    </span>
                  )}
                  <span className="truncate text-sm font-semibold">{label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </aside>
  );
}

function avatarMark(person: Person, lang: Lang) {
  if (lang === "zh") return [...person.nameZh.replace(/·/g, "")].slice(0, 2).join("");
  const parts = person.name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
  return `${first}${last}`.toUpperCase();
}
