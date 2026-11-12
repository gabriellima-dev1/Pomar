/**
 * Prepara as personas dos fluxos de telas (docs/fluxos/PLANO.md): Carla (estuda um
 * livro), Diego (competidor na Feira) e Elisa (socializadora). Contas
 * `fluxo.<nome>@example.com`, todas `is_demo`. Rodar de novo recomeça do zero.
 *
 * Uso: npm run fluxos:preparar -- --confirmo
 *      npm run fluxos:preparar -- --remover --confirmo   (apaga as 3 contas)
 *
 * As senhas ficam em .fluxos/senhas.json (fora do git), para entrar no app como elas.
 * Nunca fecha a semana em andamento da Feira e não mexe em contas reais.
 */
import { randomUUID } from "node:crypto";
import { addDays, dayRange, localDay, weekStart } from "../../lib/dates.ts";
import {
  PERSONAS,
  TZ,
  admin,
  emMaceio,
  idsDasContas,
  lerSenhas,
  must,
  salvarSenhas,
  type PersonaId,
} from "./comum.ts";

const args = process.argv.slice(2);
if (!args.includes("--confirmo")) {
  console.error(
    "Isto recria as contas de exemplo fluxo.carla/diego/elisa@example.com (is_demo).\n" +
      "Rode de novo com --confirmo para seguir.",
  );
  process.exit(1);
}

const db = admin();
const ids = await idsDasContas(db);

if (args.includes("--remover")) {
  for (const p of Object.values(PERSONAS)) {
    const id = ids.get(p.email);
    if (id) must("apagar conta", await db.auth.admin.deleteUser(id));
  }
  salvarSenhas({});
  console.log("✓ Contas de exemplo apagadas.");
  process.exit(0);
}

const today = localDay(new Date(), TZ);
const monday = weekStart(today);
const lastMonday = addDays(monday, -7);

// Contas -------------------------------------------------------------------------
const senhas = lerSenhas();
const uid = {} as Record<PersonaId, string>;
for (const [key, p] of Object.entries(PERSONAS) as [PersonaId, (typeof PERSONAS)[PersonaId]][]) {
  const password = randomUUID();
  let id = ids.get(p.email);
  if (id) {
    must("senha", await db.auth.admin.updateUserById(id, { password }));
  } else {
    const created = must(
      "criar conta",
      await db.auth.admin.createUser({
        email: p.email,
        password,
        email_confirm: true,
        user_metadata: { display_name: p.nome },
      }),
    );
    id = created.user!.id;
  }
  senhas[key] = password;
  uid[key] = id;
}
salvarSenhas(senhas);
const all = Object.values(uid);

// Recomeço: apaga o que as personas tinham ---------------------------------------
for (const table of [
  "subjects",
  "pomodoro_sessions",
  "xp_events",
  "user_daily_badges",
  "weekly_harvests",
  "user_themes",
  "feed_events",
  "reactions",
  "league_members",
] as const) {
  must(`limpar ${table}`, await db.from(table).delete().in("user_id", all));
}
must("limpar seguidores", await db.from("follows").delete().in("follower_id", all));
must("limpar seguidos", await db.from("follows").delete().in("followee_id", all));
must(
  "coorte A",
  await db.from("user_cohorts").upsert(
    all.map((user_id) => ({ user_id, cohort: "A" })),
    { onConflict: "user_id" },
  ),
);

async function perfil(key: PersonaId, firstDay: string, extra: Record<string, unknown> = {}) {
  const p = PERSONAS[key];
  must(
    `perfil ${key}`,
    await db
      .from("profiles")
      .update({
        display_name: p.nome,
        username: p.apelido,
        is_demo: true,
        timezone: TZ,
        theme: "classico",
        onboarding_step: "concluido",
        bartle_primary: p.perfil,
        league_opt_in: true,
        league_invite_dismissed_at: null,
        public_profile: p.publico,
        league_division: "bronze",
        xp_total: 0,
        level: 1,
        level_seen: 1,
        streak_current: 0,
        streak_best: 0,
        freezes: 0,
        last_closed_day: addDays(firstDay, -1),
        reactions_seen_at: null,
        min_per_page: null,
        ...extra,
      })
      .eq("id", uid[key]),
  );
}

type Sessao = {
  topic_id: string | null;
  start: Date;
  pages: number | null;
};

async function criarSessoes(key: PersonaId, subjectId: string, list: Sessao[]) {
  if (list.length === 0) return;
  must(
    `ciclos ${key}`,
    await db.from("pomodoro_sessions").insert(
      list.map((s) => ({
        user_id: uid[key],
        subject_id: subjectId,
        topic_id: s.topic_id,
        planned_focus_sec: 1500,
        started_at: s.start.toISOString(),
        ended_at: new Date(s.start.getTime() + 25 * 60_000).toISOString(),
        status: "completed",
        paused_sec: 0,
        pauses: 0,
        pages_logged: s.pages,
      })),
    ),
  );
}

// Carla: Cormen, 3 semanas de estudo ------------------------------------------------
const book = must(
  "livro",
  await db.from("catalog_books").select("id, title").eq("slug", "algoritmos-cormen").single(),
);
const catChapters = must(
  "capítulos",
  await db
    .from("catalog_chapters")
    .select("position, title, catalog_topics(position, title, page_start, page_end)")
    .eq("book_id", book.id)
    .order("position")
    .limit(8),
);

const carlaDays = [
  addDays(lastMonday, -6),
  addDays(lastMonday, -4),
  ...dayRange(lastMonday, addDays(lastMonday, 4)),
  ...dayRange(monday, addDays(today, -1)),
];
await perfil("carla", carlaDays[0]!);
const carlaSubject = must(
  "disciplina da Carla",
  await db
    .from("subjects")
    .insert({
      user_id: uid.carla,
      title: "Algoritmos",
      source: "catalog",
      catalog_book_id: book.id,
      color: "tomate",
      goal_date: addDays(today, 24),
      daily_goal: 2,
      min_per_page: 4.2,
    })
    .select("id")
    .single(),
);
const topics: { id: string; page_start: number; page_end: number; chapter: string }[] = [];
for (const ch of catChapters) {
  const chapter = must(
    "capítulo",
    await db
      .from("chapters")
      .insert({ subject_id: carlaSubject.id, position: ch.position, title: ch.title })
      .select("id")
      .single(),
  );
  const rows = [...ch.catalog_topics].sort((a, b) => a.position - b.position);
  const inserted = must(
    "tópicos",
    await db
      .from("topics")
      .insert(
        rows.map((t) => ({
          chapter_id: chapter.id,
          position: t.position,
          title: t.title,
          page_start: t.page_start,
          page_end: t.page_end,
        })),
      )
      .select("id, page_start, page_end"),
  );
  for (const t of inserted) topics.push({ ...t, chapter: chapter.id });
}

// Ciclos em ordem pelos tópicos: ~6 páginas por ciclo de 25 min (≈ 4,2 min/página).
const sessions: Sessao[] = [];
const doneAt = new Map<string, string>();
let ti = 0;
let read = 0;
for (const [i, day] of carlaDays.entries()) {
  const count = i % 3 === 2 ? 3 : 2;
  for (let n = 0; n < count && ti < topics.length; n++) {
    const topic = topics[ti]!;
    const start = emMaceio(day, 19, n * 30);
    const pages = 6;
    sessions.push({ topic_id: topic.id, start, pages });
    read += pages;
    if (read >= topic.page_end - topic.page_start + 1) {
      doneAt.set(topic.id, new Date(start.getTime() + 25 * 60_000).toISOString());
      ti++;
      read = 0;
    }
  }
}
await criarSessoes("carla", carlaSubject.id, sessions);
for (const [id, at] of doneAt) {
  must("tópico concluído", await db.from("topics").update({ done_at: at }).eq("id", id));
}

// Diego: competidor, ciclos nesta semana ---------------------------------------------
const diegoDays = dayRange(monday, addDays(today, -1));
const diegoFirst = diegoDays[0] ?? addDays(today, -1);
await perfil("diego", addDays(diegoFirst, -7), { league_division: "prata" });
const diegoSubject = must(
  "disciplina do Diego",
  await db
    .from("subjects")
    .insert({ user_id: uid.diego, title: "Redes (revisão)", source: "manual", color: "ceu" })
    .select("id")
    .single(),
);
const diegoChapter = must(
  "capítulo do Diego",
  await db
    .from("chapters")
    .insert({ subject_id: diegoSubject.id, position: 1, title: "Camada de aplicação" })
    .select("id")
    .single(),
);
const diegoTopics = must(
  "tópicos do Diego",
  await db
    .from("topics")
    .insert(
      ["HTTP", "DNS", "E-mail", "CDN"].map((title, i) => ({
        chapter_id: diegoChapter.id,
        position: i + 1,
        title,
        page_start: 1 + i * 20,
        page_end: 20 + i * 20,
      })),
    )
    .select("id"),
);
await criarSessoes(
  "diego",
  diegoSubject.id,
  diegoDays.flatMap((day, d) =>
    [0, 1, 2].map((n) => ({
      topic_id: diegoTopics[Math.min(d, diegoTopics.length - 1)]!.id,
      start: emMaceio(day, 7, n * 30),
      pages: 5,
    })),
  ),
);

// Elisa: socializadora, sem apelido ainda (para a tela 24) ----------------------------
const elisaDays = [addDays(lastMonday, 1), addDays(lastMonday, 3)];
await perfil("elisa", elisaDays[0]!, { username: null });
const elisaSubject = must(
  "disciplina da Elisa",
  await db
    .from("subjects")
    .insert({ user_id: uid.elisa, title: "Inglês técnico", source: "manual", color: "uva" })
    .select("id")
    .single(),
);
const elisaChapter = must(
  "capítulo da Elisa",
  await db
    .from("chapters")
    .insert({ subject_id: elisaSubject.id, position: 1, title: "Leitura de artigos" })
    .select("id")
    .single(),
);
const elisaTopic = must(
  "tópico da Elisa",
  await db
    .from("topics")
    .insert({
      chapter_id: elisaChapter.id,
      position: 1,
      title: "Abstracts",
      page_start: 1,
      page_end: 12,
      done_at: emMaceio(elisaDays[1]!, 20, 30).toISOString(),
    })
    .select("id")
    .single(),
);
await criarSessoes(
  "elisa",
  elisaSubject.id,
  elisaDays.map((day) => ({ topic_id: elisaTopic.id, start: emMaceio(day, 20), pages: 6 })),
);

// Feira: Diego e Elisa no grupo de demonstração da semana ---------------------------------
const ana = must(
  "conta demo ana.r",
  await db.from("profiles").select("id").eq("username", "ana.r").maybeSingle(),
);
const demo = ana
  ? must(
      "grupo demo",
      await db
        .from("league_members")
        .select("group_id")
        .eq("week_start", monday)
        .eq("user_id", ana.id)
        .maybeSingle(),
    )
  : null;
if (demo) {
  must(
    "membros",
    await db.from("league_members").insert(
      [uid.diego, uid.elisa].map((user_id) => ({
        group_id: demo.group_id,
        user_id,
        week_start: monday,
      })),
    ),
  );
} else {
  console.warn(
    "⚠ Sem grupo de demonstração nesta semana: rode `npm run demo:league -- <email> --confirmo`\n" +
      "  e depois este script de novo para o Diego aparecer no ranking.",
  );
}

// Resultado da semana passada do Diego (tela 25); a captura troca subiu/ficou/desceu.
must(
  "semana passada",
  await db
    .from("league_weeks")
    .upsert(
      { week_start: lastMonday, closed_at: new Date().toISOString() },
      { onConflict: "week_start", ignoreDuplicates: true },
    ),
);
const pastGroup = must(
  "grupo da semana passada",
  await db
    .from("league_groups")
    .insert({ week_start: lastMonday, division: "bronze", band_min: 0, band_max: 1 })
    .select("id")
    .single(),
);
must(
  "resultado do Diego",
  await db.from("league_members").insert({
    group_id: pastGroup.id,
    user_id: uid.diego,
    week_start: lastMonday,
    xp_week: 230,
    final_rank: 4,
    outcome: "up",
  }),
);

// Feed e parabéns ---------------------------------------------------------------------
const yesterday = addDays(today, -1);
must(
  "feed",
  await db.from("feed_events").insert([
    {
      user_id: uid.carla,
      type: "chapter",
      payload: { position: 1, subject_title: "Algoritmos" },
      dedupe_key: `chapter:${topics[0]!.chapter}`,
      created_at: emMaceio(yesterday, 20, 10).toISOString(),
    },
    {
      user_id: uid.diego,
      type: "division",
      payload: { division: "prata" },
      dedupe_key: `division:${lastMonday}`,
      created_at: emMaceio(monday, 0, 5).toISOString(),
    },
    {
      user_id: uid.elisa,
      type: "chapter",
      payload: { position: 1, subject_title: "Inglês técnico" },
      dedupe_key: `chapter:${elisaChapter.id}`,
      created_at: emMaceio(elisaDays[1]!, 20, 30).toISOString(),
    },
  ]),
);
const elisaEvent = must(
  "item da Elisa",
  await db.from("feed_events").select("id").eq("user_id", uid.elisa).eq("type", "chapter").single(),
);
must(
  "parabéns para a Elisa",
  await db.from("reactions").insert([
    {
      event_id: elisaEvent.id,
      user_id: uid.carla,
      created_at: emMaceio(yesterday, 9).toISOString(),
    },
    {
      event_id: elisaEvent.id,
      user_id: uid.diego,
      created_at: emMaceio(yesterday, 12).toISOString(),
    },
  ]),
);
must(
  "Carla e Diego seguem a Elisa",
  await db.from("follows").insert([
    { follower_id: uid.carla, followee_id: uid.elisa },
    { follower_id: uid.diego, followee_id: uid.elisa },
  ]),
);

console.log(
  `✓ Personas prontas: Carla (${sessions.length} ciclos, ${doneAt.size} tópicos concluídos), ` +
    `Diego (${diegoDays.length * 3} ciclos nesta semana${demo ? ", no grupo demo" : ""}), Elisa.`,
);
console.log("  Senhas em .fluxos/senhas.json. Próximo passo: npm run fluxos:capturar");
