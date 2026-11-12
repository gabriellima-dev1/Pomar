import { describe, expect, it } from "vitest";
import {
  importSummary,
  parseIsoDuration,
  parsePlaylistId,
  speedLabel,
  totalLabel,
  videoMinutes,
} from "./parse.ts";

const LIST = "PLoYCgNOIyGABDU532eesybur5HPBVfC1G";

describe("link da playlist", () => {
  it("aceita link de playlist, de vídeo com list= e o próprio id", () => {
    expect(parsePlaylistId(`https://www.youtube.com/playlist?list=${LIST}`)).toBe(LIST);
    expect(parsePlaylistId(`youtube.com/watch?v=dQw4w9WgXcQ&list=${LIST}&index=3`)).toBe(LIST);
    expect(parsePlaylistId(`https://youtu.be/dQw4w9WgXcQ?list=${LIST}`)).toBe(LIST);
    expect(parsePlaylistId(`https://m.youtube.com/playlist?list=${LIST}`)).toBe(LIST);
    expect(parsePlaylistId(`  ${LIST} `)).toBe(LIST);
  });

  it("recusa links sem playlist ou de outros sites", () => {
    expect(parsePlaylistId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBeNull();
    expect(parsePlaylistId(`https://example.com/playlist?list=${LIST}`)).toBeNull();
    expect(parsePlaylistId("youtube.com/playlist?list=<script>")).toBeNull();
    expect(parsePlaylistId("")).toBeNull();
    expect(parsePlaylistId("não é link")).toBeNull();
  });
});

describe("durações", () => {
  it("lê ISO 8601", () => {
    expect(parseIsoDuration("PT22M")).toBe(1320);
    expect(parseIsoDuration("PT1H2M3S")).toBe(3723);
    expect(parseIsoDuration("PT45S")).toBe(45);
    expect(parseIsoDuration("P1DT1M")).toBe(86460);
    expect(parseIsoDuration("P0D")).toBe(0);
    expect(parseIsoDuration("lixo")).toBe(0);
  });

  it("formata para a tela", () => {
    expect(videoMinutes(1320)).toBe("22 min");
    expect(videoMinutes(20)).toBe("1 min");
    expect(videoMinutes(3900)).toBe("1h 05min");
    expect(totalLabel(34800)).toBe("9h 40min");
    expect(totalLabel(7200)).toBe("2h");
    expect(speedLabel(1.25)).toBe("1,25×");
  });
});

describe("resumo do rodapé", () => {
  it("total, duração na velocidade e pomodoros por vídeo", () => {
    const s = importSummary([1320, 1860, 1620], 1.25, 25);
    expect(s.line1).toBe("3 vídeos · 1h 20min");
    // 17,6 + 24,8 + 21,6 min → 1 + 1 + 1 pomodoros
    expect(s.line2).toBe("≈ 1h 4min em 1,25× · cerca de 3 pomodoros");
    expect(importSummary([3000], 1, 25).line2).toBe("≈ 50min em 1× · cerca de 2 pomodoros");
    expect(importSummary([60], 1, 25).line1).toBe("1 vídeo · 1min");
  });
});
