"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getVideo, scopeFromLocation, scopeHome, scopeTimeline } from "@/data/catalogue";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/components/providers";
import { cn } from "cn";

export function Header() {
  return (
    <Suspense fallback={null}>
      <HeaderBar />
    </Suspense>
  );
}

function HeaderBar() {
  const pathname = usePathname();
  const search = useSearchParams();
  const { lang, setLang, t } = useI18n();
  const { theme, setTheme } = useTheme();
  const videoId = pathname.startsWith("/v/") ? pathname.split("/")[2] : undefined;
  const record = videoId ? getVideo(videoId) : undefined;
  const scope = scopeFromLocation({
    person: search.get("person"),
    company: search.get("company"),
    video: record,
  });
  const onVideos = pathname === "/" || pathname.startsWith("/v/");
  const onTimeline = pathname.startsWith("/timeline");
  const onAbout = pathname.startsWith("/about");

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1120px] flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3 sm:px-8">
        <Link href={scopeHome(scope)} className="flex items-center gap-2.5 text-foreground">
          <Mark />
          <span className="leading-none">
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t.unofficial}
            </span>
            <span className="mt-1 block text-[15px] font-black tracking-[-0.03em]">{t.wordmark}</span>
          </span>
        </Link>
        <nav className="order-3 flex w-full flex-wrap gap-x-5 gap-y-1 text-sm lg:order-none lg:w-auto">
          <NavLink href={scopeHome(scope)} active={onVideos}>
            {t.videos}
          </NavLink>
          <NavLink href={scopeTimeline(scope)} active={onTimeline}>
            {t.timeline}
          </NavLink>
          <NavLink href="/about" active={onAbout}>
            {t.about}
          </NavLink>
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            className="h-9 rounded-full px-3 text-sm"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? t.light : t.dark}
          >
            {theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            {theme === "dark" ? t.light : t.dark}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-9 items-center gap-1 rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={t.languageName}
            >
              {lang === "zh" ? "中文" : "EN"}
              <ChevronDown className="size-3.5 opacity-70" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-36">
              <LanguageItem current={lang} value="en" onSelect={setLang}>
                English
              </LanguageItem>
              <LanguageItem current={lang} value="zh" onSelect={setLang}>
                简体中文
              </LanguageItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("text-muted-foreground hover:text-foreground", active && "font-semibold text-foreground")}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </Link>
  );
}

function LanguageItem({
  current,
  value,
  onSelect,
  children,
}: {
  current: Lang;
  value: Lang;
  onSelect: (lang: Lang) => void;
  children: ReactNode;
}) {
  return (
    <DropdownMenuItem onClick={() => onSelect(value)} className={cn(current === value && "font-semibold")}>
      {children}
    </DropdownMenuItem>
  );
}

function Mark() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" className="text-foreground">
      <rect x="1.25" y="1.25" width="25.5" height="25.5" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="7" width="3.5" height="14" rx="1.2" fill="#ff5c6c" />
      <rect x="13" y="12.25" width="8" height="3.5" rx="1.2" fill="currentColor" />
    </svg>
  );
}
