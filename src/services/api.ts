const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
export const USE_MOCK =
  String(import.meta.env.VITE_USE_MOCK ?? "true").toLowerCase() === "true";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  get: async <T>(path: string) => handle<T>(await fetch(`${API_BASE_URL}${path}`)),
  post: async <T>(path: string, body: unknown) =>
    handle<T>(
      await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    ),
};
