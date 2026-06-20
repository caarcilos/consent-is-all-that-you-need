"use client";

import Link from "next/link";
import { useState } from "react";
import { useDemo } from "./DemoProvider";

export function AppHeader() {
  const { configured, status, resetDemo } = useDemo();
  const [confirming, setConfirming] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setResetting(true);
    setMessage(null);
    try {
      await resetDemo();
      setConfirming(false);
      setMessage("Demo restored");
      window.setTimeout(() => setMessage(null), 2400);
    } catch {
      setMessage("Reset failed");
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand-mark" aria-hidden="true">◎</span>
        <span>consent-lens</span>
      </Link>
      <nav aria-label="Primary navigation">
        <Link href="/org-search">Org view</Link>
        <Link href="/participant">Participant view</Link>
        {configured && status === "ready" && (
          confirming
            ? <span className="reset-confirm">
                <span>Restore your private demo?</span>
                <button onClick={() => void handleReset()} disabled={resetting}>
                  {resetting ? "Resetting…" : "Yes, reset"}
                </button>
                <button onClick={() => setConfirming(false)} disabled={resetting}>Cancel</button>
              </span>
            : <button className="reset-button" onClick={() => setConfirming(true)}>↺ Reset demo</button>
        )}
        {message && <span className="reset-message" role="status">{message}</span>}
        <a href="https://github.com/caarcilos/consent-is-all-that-you-need" target="_blank" rel="noreferrer" aria-label="Project source">↗ Source</a>
      </nav>
    </header>
  );
}
