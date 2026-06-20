import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "consent-lens",
  description: "A consent-first lens on a shared talent pool.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            <span className="brand-mark" aria-hidden="true">◎</span>
            <span>consent-lens</span>
          </Link>
          <nav aria-label="Primary navigation">
            <Link href="/org-search">Org view</Link>
            <Link href="/participant">Participant view</Link>
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Project source">↗ Source</a>
          </nav>
        </header>
        {children}
        <footer>
          <span>Built with synthetic people and fictional organizations.</span>
          <span>RLS is the gate. The UI is only the glass.</span>
        </footer>
      </body>
    </html>
  );
}
