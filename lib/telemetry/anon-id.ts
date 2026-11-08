const STORAGE_KEY = "pomar_anon_id";

let memoryId: string | null = null;

function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Identificador anônimo e estável deste navegador (liga `landing_viewed` ao cadastro).
 * Cai para um id em memória se o localStorage estiver bloqueado.
 */
export function getAnonId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) return stored;
    const id = newId();
    window.localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    memoryId ??= newId();
    return memoryId;
  }
}
