"use client";

import { useEffect } from "react";
import { track, type EventName, type EventProps } from "@/lib/telemetry";

type Props = {
  event: EventName;
  props?: EventProps;
  /** "session": no máximo 1× por aba (sessionStorage). "mount": a cada montagem. */
  once?: "session" | "mount";
};

/** Registra um evento de telemetria quando o componente aparece na tela. */
export function TrackOnMount({ event, props, once = "mount" }: Props) {
  useEffect(() => {
    if (once === "session") {
      const key = `pomar_tracked_${event}`;
      try {
        if (window.sessionStorage.getItem(key)) return;
        window.sessionStorage.setItem(key, "1");
      } catch {
        // sessionStorage bloqueado: registra mesmo assim.
      }
    }
    void track(event, props);
    // Registrar só na montagem; props não devem disparar de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event, once]);

  return null;
}
