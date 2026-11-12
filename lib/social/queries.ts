import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  isFeedType,
  parsePayload,
  type FeedPayload,
  type FeedType,
  type ReceivedReaction,
} from "./feed";

/**
 * Leituras do social pela sessão da pessoa. Dados de outras pessoas só chegam pelas
 * funções SECURITY DEFINER (campos públicos de perfis públicos).
 */

export type FeedItem = {
  id: string;
  username: string;
  isDemo: boolean;
  type: FeedType;
  payload: FeedPayload;
  at: string;
  reacted: boolean;
};

export async function getFriendsFeed(): Promise<FeedItem[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("friends_feed");
  return (data ?? []).flatMap((r) =>
    isFeedType(r.type) && r.username
      ? [
          {
            id: r.id,
            username: r.username,
            isDemo: r.is_demo,
            type: r.type,
            payload: parsePayload(r.payload),
            at: r.created_at,
            reacted: r.reacted,
          },
        ]
      : [],
  );
}

export async function getReceivedReactions(): Promise<ReceivedReaction[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("received_reactions");
  return (data ?? []).flatMap((r) =>
    isFeedType(r.type)
      ? [
          {
            eventId: r.event_id,
            type: r.type,
            payload: parsePayload(r.payload),
            from: r.from_username,
            at: r.created_at,
          },
        ]
      : [],
  );
}

export type PersonRow = { username: string; level: number; isDemo: boolean; following: boolean };

export async function getLeagueSuggestions(): Promise<PersonRow[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("league_suggestions");
  return (data ?? []).map((r) => ({
    username: r.username,
    level: r.level,
    isDemo: r.is_demo,
    following: r.following,
  }));
}

export type PublicProfile =
  | { privado: true }
  | {
      privado: false;
      username: string;
      level: number;
      streak: number;
      isDemo: boolean;
      createdAt: string;
      isMe: boolean;
      following: boolean;
      badges: string[];
      recent: { type: FeedType; payload: FeedPayload; at: string }[];
    };

/** Perfil público (28); null = apelido inexistente. */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase.rpc("public_profile", { p_username: username });
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const d = data as Record<string, unknown>;
  if (d.privado === true) return { privado: true };
  const recent = Array.isArray(d.recent) ? d.recent : [];
  return {
    privado: false,
    username: String(d.username ?? username),
    level: Number(d.level ?? 1),
    streak: Number(d.streak ?? 0),
    isDemo: d.is_demo === true,
    createdAt: String(d.created_at ?? ""),
    isMe: d.is_me === true,
    following: d.following === true,
    badges: Array.isArray(d.badges)
      ? d.badges.filter((b): b is string => typeof b === "string")
      : [],
    recent: recent.flatMap((r) => {
      if (!r || typeof r !== "object") return [];
      const x = r as Record<string, unknown>;
      return isFeedType(x.type)
        ? [{ type: x.type, payload: parsePayload(x.payload), at: String(x.created_at ?? "") }]
        : [];
    }),
  };
}
