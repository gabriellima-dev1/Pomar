import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

/** Retorno do OAuth (Google) e de links de e-mail: troca o código pela sessão. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }

  const reason = searchParams.get("error") ? "google" : "link";
  return NextResponse.redirect(new URL(`/login?erro=${reason}`, origin));
}
