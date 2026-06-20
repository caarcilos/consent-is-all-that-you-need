"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { orgs as fixtureOrgs, participants as fixtureParticipants } from "@/lib/syntheticData";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabaseClient";
import type { Org, Participant } from "@/lib/types";

type DirectoryParticipant = Pick<Participant, "id" | "handle" | "initials" | "tone"> & {
  name: string;
};

type DemoContextValue = {
  configured: boolean;
  status: "connecting" | "ready" | "fixture" | "error";
  error: string | null;
  client: SupabaseClient | null;
  workspaceId: string | null;
  orgs: Org[];
  participants: DirectoryParticipant[];
  revision: number;
  refreshDirectory: () => Promise<void>;
  resetDemo: () => Promise<void>;
};

const fixtureDirectory = fixtureParticipants.map((participant) => ({
  id: participant.id,
  handle: participant.handle,
  initials: participant.initials,
  tone: participant.tone,
  name: participant.attributes.find((attribute) => attribute.key === "name")?.value
    ?? participant.handle,
}));

const DemoContext = createContext<DemoContextValue | null>(null);

type DirectoryResponse = {
  workspace_id: string;
  orgs: Org[];
  participants: DirectoryParticipant[];
};

let initializationPromise: Promise<{
  client: SupabaseClient;
  workspaceId: string;
  directory: DirectoryResponse;
}> | null = null;

function initializeDemo() {
  if (initializationPromise) return initializationPromise;
  initializationPromise = (async () => {
    const supabase = getSupabaseBrowserClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) {
      const { error: signInError } = await supabase.auth.signInAnonymously();
      if (signInError) throw signInError;
    }

    const { data: ensuredWorkspace, error: ensureError } =
      await supabase.rpc("ensure_demo_workspace");
    if (ensureError) throw ensureError;
    const { data: directoryData, error: directoryError } =
      await supabase.rpc("demo_directory");
    if (directoryError) throw directoryError;
    const directory = directoryData as DirectoryResponse;
    return {
      client: supabase,
      workspaceId: (ensuredWorkspace as string) ?? directory.workspace_id,
      directory,
    };
  })().catch((caught) => {
    initializationPromise = null;
    throw caught;
  });
  return initializationPromise;
}

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const configured = isSupabaseConfigured();
  const [status, setStatus] = useState<DemoContextValue["status"]>(
    configured ? "connecting" : "fixture",
  );
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [orgs, setOrgs] = useState<Org[]>(fixtureOrgs);
  const [participants, setParticipants] =
    useState<DirectoryParticipant[]>(fixtureDirectory);
  const [revision, setRevision] = useState(0);

  const refreshDirectory = useCallback(async () => {
    if (!client) return;
    const { data, error: directoryError } = await client.rpc("demo_directory");
    if (directoryError) throw directoryError;
    const directory = data as {
      workspace_id: string;
      orgs: Org[];
      participants: DirectoryParticipant[];
    };
    setWorkspaceId(directory.workspace_id);
    setOrgs(directory.orgs);
    setParticipants(directory.participants);
  }, [client]);

  useEffect(() => {
    if (!configured) return;

    let active = true;
    const connect = async () => {
      try {
        const initialized = await initializeDemo();
        if (!active) return;
        setClient(initialized.client);
        setWorkspaceId(initialized.workspaceId);
        setOrgs(initialized.directory.orgs);
        setParticipants(initialized.directory.participants);
        setStatus("ready");
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Could not start the demo workspace.");
        setStatus("error");
      }
    };

    void connect();
    return () => {
      active = false;
    };
  }, [configured]);

  const resetDemo = useCallback(async () => {
    if (!client) return;
    const { error: resetError } = await client.rpc("reset_demo_workspace");
    if (resetError) throw resetError;
    const { data, error: directoryError } = await client.rpc("demo_directory");
    if (directoryError) throw directoryError;
    const directory = data as {
      workspace_id: string;
      orgs: Org[];
      participants: DirectoryParticipant[];
    };
    setWorkspaceId(directory.workspace_id);
    setOrgs(directory.orgs);
    setParticipants(directory.participants);
    setRevision((value) => value + 1);
  }, [client]);

  const value = useMemo<DemoContextValue>(() => ({
    configured,
    status,
    error,
    client,
    workspaceId,
    orgs,
    participants,
    revision,
    refreshDirectory,
    resetDemo,
  }), [
    configured,
    status,
    error,
    client,
    workspaceId,
    orgs,
    participants,
    revision,
    refreshDirectory,
    resetDemo,
  ]);

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo must be used inside DemoProvider.");
  return context;
}
