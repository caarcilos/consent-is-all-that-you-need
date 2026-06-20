import type { Metadata } from "next";
import { AppHeader } from "@/components/AppHeader";
import { DemoProvider } from "@/components/DemoProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "consent-lens",
  description: "A consent-first lens on a shared talent pool.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <DemoProvider>
          <AppHeader />
          {children}
          <footer>
            <span>Built with synthetic people and fictional organizations.</span>
            <span>RLS is the gate. The UI is only the glass.</span>
          </footer>
        </DemoProvider>
      </body>
    </html>
  );
}
