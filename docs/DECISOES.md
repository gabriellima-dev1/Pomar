# Pomar — Registro de decisões

Formato: **data · decisão · motivo · status** (aprovada / pendente).
Decisões de produto ficam com a dupla. As marcadas como "pendente" foram tomadas pelo Claude Code como a opção mais simples e reversível e aguardam confirmação.

| Data | Decisão | Motivo | Status |
|---|---|---|---|
| 07/11/2026 | **Confirmação de e-mail desligada** no cadastro por e-mail/senha | O SMTP gratuito do Supabase envia ~2 e-mails/h e travaria o beta de 18/11. **Aplicada no projeto em 07/11** (só `auth.email.enable_confirmations`, via `config push` a partir de uma cópia da config remota). Reversível no painel | aprovada |
| 07/11/2026 | `signup_completed` é registrado por **trigger no banco** (`handle_new_user`), não pelo cliente | Vale igual para e-mail e Google, não depende de JavaScript e não se perde em redirecionamentos. Props: `{provider}`; o `anon_id` do navegador é guardado para ligar ao `landing_viewed` | aprovada (técnica) |
| 07/11/2026 | Telemetria do cliente é inserida **direto no Supabase via RLS** (sem rota de API) | Menos código. RLS garante que cada um só grava eventos próprios; visitantes só sem `user_id`; leitura só para admin; nomes restritos à lista do §9.1 por `check` | aprovada (técnica) |
| 07/11/2026 | `profiles` com **grant de update por coluna**: o cliente só altera `display_name`, `avatar_url`, `timezone`, `reminder_time`, `focus_min`, `break_min`, `long_break_min`, `min_per_page` | XP, nível, ofensiva, admin, demo, tema e opt-ins são calculados/validados no servidor (CLAUDE.md). Novas colunas editáveis ganham grant nas próximas fases | aprovada (técnica) |
| 07/11/2026 | `is_admin()` é `SECURITY DEFINER` e executável por usuários logados | Usada nas políticas de admin; só devolve o flag do próprio usuário. O advisor do Supabase aponta isso como aviso, e o risco foi aceito | aprovada (técnica) |
| 07/11/2026 | `telemetry_events.user_id` com `on delete set null` | Ao excluir a conta, os eventos ficam anônimos e as métricas agregadas continuam válidas. Alternativa: apagar tudo (`cascade`). Rever junto com "Excluir conta" (Fase 6) | pendente |
| 07/11/2026 | Fuso do perfil vem do navegador no cadastro por e-mail. **No Google, começa em `America/Maceio`** | O OAuth não envia o fuso. Detecção/ajuste automático fica para a Fase 3 (ofensiva) ou Configurações | pendente |
| 07/11/2026 | Senha com **mínimo de 8 caracteres** | Recomendação comum de segurança (o padrão do Supabase é 6) | pendente |
| 07/11/2026 | `cacheComponents` e `partialPrefetching` do Next 16 **desligados** | O app é quase todo autenticado (sessão em cookies). Com Cache Components, toda leitura de sessão exige `<Suspense>` e validação de navegação instantânea; o modelo dinâmico clássico é mais simples. Reversível no `next.config.ts` | pendente |
| 07/11/2026 | Projeto Supabase em **us-east-1** (o plano pedia São Paulo) | Projeto já criado pela dupla. Só acrescenta ~120 ms de latência; migrar exigiria recriar o projeto | pendente |
| 07/11/2026 | Landing `/` provisória (título, frase, botões) | A landing completa com contadores reais é da Fase 4 | aprovada (PLANO) |
| 07/11/2026 | `supabase/config.toml` serve só para o Supabase local; **não usar `supabase config push`** com ele | A config de Auth remota (Site URL, Redirect URLs, Google) é gerenciada no painel; um push do arquivo local desativaria o Google e trocaria a Site URL | aprovada (técnica) |
