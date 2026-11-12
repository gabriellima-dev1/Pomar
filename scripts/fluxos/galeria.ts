/**
 * Monta a galeria dos fluxos de telas (.fluxos/galeria.html) a partir do roteiro gerado
 * por `npm run fluxos:capturar`. A página é publicada como Artifact privado, com as
 * capturas como arquivos ao lado (capturas/<persona>/...), escolhas por tela no `db`
 * (manter / mudar / dúvida) e o botão "Comentar" ligado aos comentários do Artifact.
 *
 * Uso: npm run fluxos:galeria
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PASTA } from "./comum.ts";

type Passo = {
  persona: "carla" | "diego" | "elisa";
  id: string;
  n: number;
  titulo: string;
  acao: string;
  regra: string;
  decisoes?: string[];
  semLogin?: boolean;
  visivel?: boolean;
  caminho: string;
  imagens: { celular: string; computador: string };
};

const roteiro = JSON.parse(readFileSync(join(PASTA, "roteiro.json"), "utf8")) as {
  geradoEm: string;
  passos: Passo[];
};

const PERSONAS = [
  {
    id: "carla",
    nome: "Carla",
    papel: "Estuda um livro",
    resumo:
      "Estuda Algoritmos (Cormen) há três semanas, com prova marcada para daqui a 24 dias e meta de 2 pomodoros por dia. Perfil Conquistador, coorte A.",
  },
  {
    id: "diego",
    nome: "Diego",
    papel: "Competidor na Feira",
    resumo:
      "Está na Feira de Prata, num grupo de 13 contas de demonstração. Estudou cedo, três dias desta semana. Perfil Competidor.",
  },
  {
    id: "elisa",
    nome: "Elisa",
    papel: "Socializadora",
    resumo:
      "Ainda não escolheu apelido. Concluiu um capítulo e recebeu parabéns da Carla e do Diego. Perfil Socializador.",
  },
];

const gerado = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "America/Maceio",
}).format(new Date(roteiro.geradoEm));

const dados = JSON.stringify({ personas: PERSONAS, passos: roteiro.passos, gerado }).replace(
  /</g,
  "\\u003c",
);
const decisoes = roteiro.passos.filter((p) => p.decisoes?.length).length;

const html = `<title>Fluxos do Pomar</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600&family=Nunito:wght@400;600;800&display=swap">
<style>
/* Layout: cabeçalho fixo com as personas; cada tela é uma linha com o texto à esquerda e as capturas à direita. */
:root {
  --bg: #fbf6ec; --card: #ffffff; --soft: #f2eadb; --ink: #2a2118; --muted: #6b5c4c; --line: #e6dccb;
  --green: #2e7a47; --green-strong: #1f5a33; --green-soft: #e8f4e4; --on-green: #ffffff;
  --fruit: #c8402a; --fruit-soft: #fbe2d9; --gold: #f2b632; --gold-soft: #fdf1d3;
  --display: "Fredoka", "Nunito", system-ui, sans-serif;
  --body: "Nunito", system-ui, -apple-system, "Segoe UI", sans-serif;
  --frame-h: 560px;
}
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) {
  --bg: #131a26; --card: #1c2433; --soft: #263043; --ink: #f3eee4; --muted: #a8b1c2; --line: #2e394d;
  --green: #6cc58a; --green-strong: #9ad9ae; --green-soft: #1d3628; --on-green: #0e1b13;
  --fruit: #ff7f61; --fruit-soft: #3a221c; --gold: #f5c85c; --gold-soft: #3a3020; color-scheme: dark; } }
:root[data-theme="dark"] {
  --bg: #131a26; --card: #1c2433; --soft: #263043; --ink: #f3eee4; --muted: #a8b1c2; --line: #2e394d;
  --green: #6cc58a; --green-strong: #9ad9ae; --green-soft: #1d3628; --on-green: #0e1b13;
  --fruit: #ff7f61; --fruit-soft: #3a221c; --gold: #f5c85c; --gold-soft: #3a3020; color-scheme: dark; }
* { box-sizing: border-box; }
body { background: var(--bg); color: var(--ink); font: 400 16px/1.55 var(--body); }
body::before { content: ""; position: fixed; inset: 0 0 auto; height: env(safe-area-inset-top, 0px); z-index: 10; background: var(--bg); }
.wrap { max-width: 1240px; margin: 0 auto; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
header.top { padding-block: 28px 8px; display: grid; gap: 10px; }
h1 { font: 600 clamp(28px, 4vw, 40px)/1.1 var(--display); margin: 0; text-wrap: balance; }
.lede { margin: 0; color: var(--muted); max-width: 70ch; }
.meta { display: flex; flex-wrap: wrap; gap: 8px; font-size: 13px; font-weight: 800; color: var(--muted); }
.meta span { background: var(--soft); border-radius: 999px; padding: 4px 12px; }
.how { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin: 8px 0 0; padding: 0; list-style: none; }
.how li { background: var(--card); border: 2px solid var(--line); border-radius: 16px; padding: 12px 14px; font-size: 14px; }
.how b { display: block; font-family: var(--display); font-weight: 600; font-size: 16px; }
nav.bar { position: sticky; top: env(safe-area-inset-top, 0px); z-index: 5; background: var(--bg); border-bottom: 2px solid var(--line); }
nav.bar .wrap { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; justify-content: space-between; padding-block: 12px; }
.tabs, .seg { display: flex; gap: 4px; background: var(--soft); border-radius: 16px; padding: 4px; flex-wrap: wrap; }
.tabs a, .seg button { border: 0; background: none; color: var(--muted); font: 800 14px/1 var(--body); padding: 10px 14px; border-radius: 12px; text-decoration: none; cursor: pointer; min-height: 40px; display: inline-flex; align-items: center; gap: 6px; }
.tabs a[aria-current="page"], .seg button[aria-pressed="true"] { background: var(--card); color: var(--ink); box-shadow: 0 2px 0 var(--line); }
.tabs small { font-weight: 600; color: var(--muted); }
:focus-visible { outline: 3px solid var(--green); outline-offset: 2px; }
.persona { padding-block: 24px 8px; display: grid; gap: 6px; }
.persona h2 { font: 600 28px/1.15 var(--display); margin: 0; }
.persona p { margin: 0; color: var(--muted); max-width: 72ch; }
ol.steps { list-style: none; margin: 0; padding: 0 0 64px; display: grid; gap: 20px; }
.step { background: var(--card); border: 2px solid var(--line); border-radius: 22px; padding: 18px; display: grid; grid-template-columns: minmax(0, 330px) minmax(0, 1fr); gap: 20px; }
.step.has-decision { border-color: color-mix(in srgb, var(--gold) 60%, var(--line)); }
.text { display: grid; gap: 12px; align-content: start; min-width: 0; }
.num { font: 600 13px/1 var(--display); color: var(--muted); letter-spacing: .06em; text-transform: uppercase; }
.step h3 { font: 600 22px/1.2 var(--display); margin: 0; text-wrap: balance; }
.did { margin: 0; font-weight: 600; }
.did::before { content: "O que fez: "; color: var(--muted); font-weight: 800; }
.rule { margin: 0; font-size: 14px; color: var(--muted); border-left: 3px solid var(--green-soft); padding-left: 10px; }
.path { font: 600 12px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; color: var(--muted); overflow-wrap: anywhere; }
.decide { background: var(--gold-soft); border-radius: 14px; padding: 10px 12px; display: grid; gap: 6px; }
.decide strong { font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: var(--ink); }
.decide ul { margin: 0; padding-left: 18px; font-size: 14px; }
.vote { display: grid; gap: 8px; }
.vote-buttons { display: flex; flex-wrap: wrap; gap: 6px; }
.vote-buttons button, .comment { font: 800 14px/1 var(--body); border-radius: 12px; padding: 10px 12px; min-height: 40px; cursor: pointer; border: 2px solid var(--line); background: var(--card); color: var(--ink); display: inline-flex; align-items: center; gap: 6px; }
.vote-buttons button[aria-pressed="true"][data-v="manter"] { background: var(--green-soft); border-color: var(--green); color: var(--green-strong); }
.vote-buttons button[aria-pressed="true"][data-v="mudar"] { background: var(--fruit-soft); border-color: var(--fruit); color: var(--ink); }
.vote-buttons button[aria-pressed="true"][data-v="duvida"] { background: var(--gold-soft); border-color: var(--gold); color: var(--ink); }
.vote-buttons button:disabled { opacity: .55; cursor: not-allowed; }
.tally { font-size: 13px; color: var(--muted); margin: 0; min-height: 1.2em; }
.comment { justify-self: start; color: var(--green-strong); }
.shots { display: flex; gap: 16px; align-items: flex-start; min-width: 0; }
figure { margin: 0; display: grid; gap: 6px; min-width: 0; }
figure.celular { flex: 0 0 auto; width: 250px; max-width: 100%; }
figure.computador { flex: 1 1 0; }
figcaption { font-size: 12px; font-weight: 800; color: var(--muted); letter-spacing: .05em; text-transform: uppercase; display: flex; justify-content: space-between; }
.frame { border: 2px solid var(--line); border-radius: 14px; overflow: auto; max-height: var(--frame-h); background: var(--soft); cursor: zoom-in; display: block; padding: 0; width: 100%; }
.frame img { display: block; width: 100%; height: auto; }
body[data-view="celular"] figure.computador, body[data-view="computador"] figure.celular { display: none; }
body[data-view="celular"] figure.celular { width: 340px; }
body[data-view="computador"] .step { grid-template-columns: minmax(0, 280px) minmax(0, 1fr); }
.status { font-size: 13px; color: var(--muted); }
dialog.zoom { border: 0; padding: 0; background: var(--bg); color: var(--ink); width: min(96vw, 1500px); max-height: 94vh; border-radius: 18px; }
dialog.zoom::backdrop { background: rgb(0 0 0 / .6); }
dialog.zoom .zbar { position: sticky; top: 0; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 14px; background: var(--card); border-bottom: 2px solid var(--line); font-weight: 800; }
dialog.zoom img { display: block; margin: 0 auto; max-width: 100%; height: auto; }
dialog.zoom button { font: 800 14px var(--body); border: 2px solid var(--line); border-radius: 12px; background: var(--card); color: var(--ink); padding: 8px 12px; cursor: pointer; }
@media (max-width: 860px) {
  .step { grid-template-columns: minmax(0, 1fr); }
  .shots { flex-direction: column; }
  figure.celular, body[data-view="celular"] figure.celular { width: min(100%, 300px); }
  figure.computador { width: 100%; }
}
@media (prefers-reduced-motion: no-preference) { .frame { scroll-behavior: smooth; } }
</style>

<header class="top wrap">
  <h1>Fluxos do Pomar</h1>
  <p class="lede">As telas reais do app, na ordem em que cada pessoa passa por elas. Use para decidir como as telas devem funcionar: marque cada tela e comente o que mudar.</p>
  <div class="meta"><span>${roteiro.passos.length} telas</span><span>3 casos</span><span>celular 390 × 844 e computador 1440 × 900</span><span>${decisoes} pontos para decidir</span><span>capturado em ${gerado}</span></div>
  <ul class="how">
    <li><b>Percorra um caso por vez</b>Comece pela Carla, depois o Diego e a Elisa: é o caminho da apresentação.</li>
    <li><b>Marque cada tela</b>Manter, mudar ou dúvida. Sua escolha fica salva e a outra pessoa da dupla vê.</li>
    <li><b>Comente o que mudar</b>O botão Comentar abre um comentário preso àquela tela. Eu leio, ajusto o app e capturo de novo.</li>
  </ul>
</header>

<nav class="bar" aria-label="Casos e telas">
  <div class="wrap">
    <div class="tabs" id="tabs" role="list"></div>
    <div class="seg" role="group" aria-label="Quais capturas mostrar">
      <button type="button" data-view="ambos" aria-pressed="true">Os dois</button>
      <button type="button" data-view="celular" aria-pressed="false">Celular</button>
      <button type="button" data-view="computador" aria-pressed="false">Computador</button>
    </div>
  </div>
</nav>

<main class="wrap">
  <section class="persona" id="persona" aria-live="polite"></section>
  <p class="status" id="status"></p>
  <ol class="steps" id="steps"></ol>
</main>

<dialog class="zoom" id="zoom" aria-labelledby="zoom-title">
  <div class="zbar"><span id="zoom-title"></span><button type="button" id="zoom-close">Fechar</button></div>
  <img id="zoom-img" alt="">
</dialog>

<script type="application/json" id="dados">${dados}</script>
<script>
(() => {
  const DATA = JSON.parse(document.getElementById("dados").textContent);
  const VOTES = [["manter", "Manter"], ["mudar", "Mudar"], ["duvida", "Dúvida"]];
  const state = { persona: "carla", votes: {}, me: null, canWrite: false, db: null, user: null, comments: null, names: {} };
  const $ = (s, el = document) => el.querySelector(s);

  function keyOf(p) { return p.persona + "/" + p.id; }
  function personaFromHash() {
    const h = location.hash.replace("#", "");
    return DATA.personas.some((p) => p.id === h) ? h : "carla";
  }

  function renderTabs() {
    const tabs = $("#tabs");
    tabs.textContent = "";
    for (const p of DATA.personas) {
      const a = document.createElement("a");
      a.href = "#" + p.id;
      a.setAttribute("role", "listitem");
      if (p.id === state.persona) a.setAttribute("aria-current", "page");
      const count = DATA.passos.filter((s) => s.persona === p.id).length;
      a.append(p.nome + " ");
      const small = document.createElement("small");
      small.textContent = p.papel + " · " + count;
      a.append(small);
      tabs.append(a);
    }
  }

  function tallyText(key) {
    const counts = { manter: [], mudar: [], duvida: [] };
    for (const [uid, choices] of Object.entries(state.votes)) {
      const v = choices && choices[key];
      if (counts[v]) counts[v].push(uid === state.me ? "você" : (state.names[uid] || "alguém"));
    }
    const parts = VOTES.filter(([v]) => counts[v].length).map(([v, label]) => label + ": " + counts[v].join(", "));
    return parts.length ? parts.join(" · ") : "Ninguém marcou ainda.";
  }

  function renderSteps() {
    const persona = DATA.personas.find((p) => p.id === state.persona);
    const sec = $("#persona");
    sec.textContent = "";
    const h2 = document.createElement("h2");
    h2.textContent = persona.nome + " · " + persona.papel;
    const p = document.createElement("p");
    p.textContent = persona.resumo;
    sec.append(h2, p);

    const list = $("#steps");
    list.textContent = "";
    for (const step of DATA.passos.filter((s) => s.persona === state.persona)) {
      const key = keyOf(step);
      const li = document.createElement("li");
      li.className = "step" + (step.decisoes && step.decisoes.length ? " has-decision" : "");
      li.id = "tela-" + step.persona + "-" + step.id;

      const text = document.createElement("div");
      text.className = "text";
      const num = document.createElement("span");
      num.className = "num";
      num.textContent = "Tela " + String(step.n).padStart(2, "0") + (step.semLogin ? " · sem login" : "");
      const h3 = document.createElement("h3");
      h3.textContent = step.titulo;
      const did = document.createElement("p");
      did.className = "did";
      did.textContent = step.acao;
      const rule = document.createElement("p");
      rule.className = "rule";
      rule.textContent = step.regra;
      const path = document.createElement("span");
      path.className = "path";
      path.textContent = step.caminho;
      text.append(num, h3, did, rule);

      if (step.decisoes && step.decisoes.length) {
        const box = document.createElement("div");
        box.className = "decide";
        const strong = document.createElement("strong");
        strong.textContent = "Para decidir";
        const ul = document.createElement("ul");
        for (const d of step.decisoes) { const i = document.createElement("li"); i.textContent = d; ul.append(i); }
        box.append(strong, ul);
        text.append(box);
      }

      const vote = document.createElement("div");
      vote.className = "vote";
      const buttons = document.createElement("div");
      buttons.className = "vote-buttons";
      buttons.setAttribute("role", "group");
      buttons.setAttribute("aria-label", "Sua escolha para " + step.titulo);
      const mine = state.me && state.votes[state.me] ? state.votes[state.me][key] : null;
      for (const [v, label] of VOTES) {
        const b = document.createElement("button");
        b.type = "button";
        b.dataset.v = v;
        b.textContent = label;
        b.setAttribute("aria-pressed", String(mine === v));
        b.disabled = !state.canWrite;
        b.addEventListener("click", () => choose(key, mine === v ? null : v));
        buttons.append(b);
      }
      const tally = document.createElement("p");
      tally.className = "tally";
      tally.textContent = state.db ? tallyText(key) : "";
      vote.append(buttons, tally);
      text.append(vote);

      if (state.comments) {
        const c = document.createElement("button");
        c.type = "button";
        c.className = "comment";
        c.textContent = "Comentar esta tela";
        c.addEventListener("click", async () => {
          try { await state.comments.openComposer({ element: li }); } catch (e) { /* o composer não abriu */ }
        });
        text.append(c);
      }
      text.append(path);

      const shots = document.createElement("div");
      shots.className = "shots";
      for (const tela of ["celular", "computador"]) {
        const fig = document.createElement("figure");
        fig.className = tela;
        const cap = document.createElement("figcaption");
        const left = document.createElement("span");
        left.textContent = tela === "celular" ? "Celular" : "Computador";
        const right = document.createElement("span");
        right.textContent = step.visivel ? "tela visível" : "página inteira";
        cap.append(left, right);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "frame";
        btn.setAttribute("aria-label", "Ampliar " + step.titulo + " no " + left.textContent.toLowerCase());
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.src = "capturas/" + step.imagens[tela];
        img.alt = step.titulo + " (" + left.textContent.toLowerCase() + ")";
        btn.append(img);
        btn.addEventListener("click", () => zoom(img.src, step.titulo + " · " + left.textContent));
        fig.append(cap, btn);
        shots.append(fig);
      }
      li.append(text, shots);
      list.append(li);
    }
  }

  function zoom(src, title) {
    const d = $("#zoom");
    $("#zoom-img").src = src;
    $("#zoom-img").alt = title;
    $("#zoom-title").textContent = title;
    if (typeof d.showModal === "function") d.showModal();
  }
  $("#zoom-close").addEventListener("click", () => $("#zoom").close());
  $("#zoom").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });

  for (const b of document.querySelectorAll(".seg button")) {
    b.addEventListener("click", () => {
      document.body.dataset.view = b.dataset.view;
      for (const o of document.querySelectorAll(".seg button")) o.setAttribute("aria-pressed", String(o === b));
      try { localStorage.setItem("fluxos-view", b.dataset.view); } catch (e) {}
    });
  }
  try {
    const saved = localStorage.getItem("fluxos-view");
    if (saved) document.querySelector('.seg button[data-view="' + saved + '"]')?.click();
  } catch (e) {}

  let saving = Promise.resolve();
  function choose(key, value) {
    if (!state.db || !state.me || !state.canWrite) return;
    const mineNow = { ...(state.votes[state.me] || {}) };
    if (value) mineNow[key] = value; else delete mineNow[key];
    state.votes[state.me] = mineNow;
    renderSteps();
    saving = saving.then(() =>
      state.db.doc("votos/" + state.me).set({ escolhas: mineNow, atualizadoEm: new Date().toISOString() })
        .then(() => { $("#status").textContent = ""; })
        .catch(() => { $("#status").textContent = "Não consegui salvar sua escolha agora. Tente de novo."; })
    );
  }

  async function resolveNames() {
    if (!state.user) return;
    const ids = Object.keys(state.votes).filter((id) => id !== state.me);
    if (!ids.length) return;
    try {
      const ps = await state.user.profiles(ids);
      for (const id of ids) state.names[id] = (ps[id] && ps[id].name) || "alguém";
    } catch (e) {}
  }

  function route() {
    state.persona = personaFromHash();
    renderTabs();
    renderSteps();
  }
  window.addEventListener("hashchange", () => { route(); window.scrollTo({ top: 0 }); });
  route();

  if (!window.claude || typeof window.claude.use !== "function") return;
  window.claude.use("comments").then((c) => { if (c) { state.comments = c; renderSteps(); } });
  Promise.all([window.claude.use("db"), window.claude.use("user")]).then(async ([db, user]) => {
    state.user = user;
    if (!db) { $("#status").textContent = "Entre na sua conta para marcar as telas."; return; }
    state.db = db;
    state.me = user ? await user.id() : null;
    const allowed = user && typeof user.can === "function" ? await user.can("data.write") : null;
    state.canWrite = Boolean(state.me) && allowed !== false;
    const timer = setTimeout(() => { $("#status").textContent = "As escolhas estão demorando para carregar."; }, 10000);
    db.collection("votos").onSnapshot(async (snap) => {
      clearTimeout(timer);
      const next = {};
      for (const d of snap.docs) next[d.id] = (d.data() || {}).escolhas || {};
      state.votes = next;
      await resolveNames();
      $("#status").textContent = state.canWrite ? "" : "Você pode ver as escolhas, mas não marcar.";
      renderSteps();
    }, () => { clearTimeout(timer); $("#status").textContent = "Não consegui carregar as escolhas."; });
  });
})();
</script>
`;

writeFileSync(join(PASTA, "galeria.html"), html);
console.log(`✓ .fluxos/galeria.html (${roteiro.passos.length} telas).`);
