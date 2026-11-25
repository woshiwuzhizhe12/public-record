import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { PersonRail } from "@/components/person-rail";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "不破不立",
    template: "%s — 不破不立",
  },
  description:
    "An unofficial index of public appearances. Videos play from the channels that published them.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className={`${inter.variable} flex min-h-full flex-col bg-background font-sans text-foreground antialiased`}>
        <Script id="theme-class" strategy="beforeInteractive">
          {`try{if(localStorage.getItem("pr-theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`}
        </Script>
        <Providers>
          <div className="h-[3px] w-full bg-coral" />
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <PersonRail />
            <div className="flex min-w-0 flex-1 flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
