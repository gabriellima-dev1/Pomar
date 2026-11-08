"use client";

import { useSyncExternalStore } from "react";
import { getAnonId } from "@/lib/telemetry/anon-id";

const noopSubscribe = () => () => {};

function browserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

/** Fuso do navegador e id anônimo, só no cliente (vazios na renderização do servidor). */
export function useBrowserContext() {
  const timezone = useSyncExternalStore(noopSubscribe, browserTimezone, () => "");
  const anonId = useSyncExternalStore(
    noopSubscribe,
    () => getAnonId() ?? "",
    () => "",
  );
  return { timezone, anonId };
}
