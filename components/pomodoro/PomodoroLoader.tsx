"use client";

import dynamic from "next/dynamic";
import type { PomodoroProps } from "./PomodoroScreen";

/** O estado do cronômetro mora no navegador (localStorage): sem renderização no servidor. */
const PomodoroScreen = dynamic(() => import("./PomodoroScreen").then((m) => m.PomodoroScreen), {
  ssr: false,
  loading: () => (
    <div
      data-theme="classico"
      className="fixed inset-0 z-40 bg-[var(--scene-sky-bottom)]"
      aria-busy="true"
      aria-label="Carregando o pomodoro"
    />
  ),
});

export function PomodoroLoader(props: PomodoroProps) {
  return <PomodoroScreen {...props} />;
}
