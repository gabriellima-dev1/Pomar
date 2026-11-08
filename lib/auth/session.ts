import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { LOGIN_PATH } from "./routes";

export type CurrentUser = { id: string; email: string | null };

/** Usuário da requisição (JWT verificado), ou `null`. Memoizado por requisição. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : null };
});

/** Exige login (defesa em profundidade além do proxy). */
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(LOGIN_PATH);
  return user;
}
