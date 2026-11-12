"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { searchPeople, type PersonResult } from "@/app/(app)/liga/actions";
import { cardClasses } from "@/components/ui/Card";
import { normalizeUsernameInput } from "@/lib/league/username";
import { levelLine, PersonRow } from "./PersonRow";

/**
 * Buscar pessoas (referencias/27-buscar-pessoas.png): prefixo do apelido a partir de
 * 2 letras, só perfis públicos. As sugestões "Da sua Feira" chegam prontas do servidor.
 */
export function PeopleSearch({ children }: { children?: ReactNode }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PersonResult[] | null>(null);
  const prefix = normalizeUsernameInput(query);
  const active = prefix.length >= 2;

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const found = await searchPeople(prefix);
      if (!cancelled) setResults(found);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [prefix, active]);

  const shown = active ? results : null;

  return (
    <div className="flex flex-col gap-5">
      <label className="border-primary bg-surface-200 flex min-h-14 flex-1 items-center gap-3 rounded-lg border-[3px] px-4 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus-ring)]">
        <Search size={24} aria-hidden className="text-ink-muted shrink-0" />
        <span className="sr-only">Buscar pessoas pelo apelido</span>
        <input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setResults(null);
          }}
          placeholder="Buscar pessoas pelo apelido"
          autoFocus
          autoCapitalize="none"
          spellCheck={false}
          className="text-ink placeholder:text-ink-muted min-w-0 flex-1 bg-transparent text-lg font-semibold focus-visible:outline-none"
        />
      </label>
      <p className="text-ink-muted font-semibold">Só aparecem pessoas com perfil público.</p>

      {active && (
        <section aria-label="Resultados da busca" aria-live="polite">
          {shown === null ? (
            <p className="text-ink-muted px-1">Procurando…</p>
          ) : shown.length === 0 ? (
            <p className="text-ink-muted px-1">Ninguém com perfil público começa com “{prefix}”.</p>
          ) : (
            <ul className={`${cardClasses} flex flex-col px-4 py-2`}>
              {shown.map((p) => (
                <PersonRow
                  key={p.username}
                  username={p.username}
                  subtitle={levelLine(p.level)}
                  following={p.following}
                  isDemo={p.isDemo}
                />
              ))}
            </ul>
          )}
        </section>
      )}
      {children}
    </div>
  );
}
