/**
 * Contadores da landing (telas.md › 15, DESIGN §2 "Descoberta"): só números reais,
 * sem contas demo. Contador zerado some; se todos forem zero, a faixa some.
 */

export type LandingStats = {
  pomodorosWeek: number;
  focusSecWeek: number;
  gardeners: number;
};

export type Counter = {
  key: "pomodoros" | "horas" | "pessoas";
  value: string;
  label: string;
};

const nf = new Intl.NumberFormat("pt-BR");
const nf1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 });

/** Horas com 1 casa abaixo de 10 h ("2,5 h"); depois, inteiras ("12 h"). */
export function formatHours(sec: number): string | null {
  const hours = sec / 3600;
  if (hours < 0.05) return null;
  return hours < 10 ? `${nf1.format(hours)} h` : `${nf.format(Math.floor(hours))} h`;
}

export function landingCounters(stats: LandingStats | null): Counter[] {
  if (!stats) return [];
  const list: Counter[] = [];
  if (stats.pomodorosWeek > 0) {
    list.push({
      key: "pomodoros",
      value: nf.format(stats.pomodorosWeek),
      label:
        stats.pomodorosWeek === 1
          ? "pomodoro colhido esta semana"
          : "pomodoros colhidos esta semana",
    });
  }
  const hours = formatHours(stats.focusSecWeek);
  if (hours) list.push({ key: "horas", value: hours, label: "de foco esta semana" });
  if (stats.gardeners > 0) {
    list.push({
      key: "pessoas",
      value: nf.format(stats.gardeners),
      label: stats.gardeners === 1 ? "pessoa cultivando um pomar" : "pessoas cultivando um pomar",
    });
  }
  return list;
}
