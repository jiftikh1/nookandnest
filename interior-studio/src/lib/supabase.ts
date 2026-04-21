import { createBrowserClient } from "@supabase/ssr";

type BrowserClient = ReturnType<typeof createBrowserClient>;

// Lazy proxy — defer createBrowserClient until a method is actually called so
// build-time prerendering of client components does not throw when env vars
// are unavailable.
export function createClient(): BrowserClient {
  let _client: BrowserClient | undefined;
  return new Proxy({} as BrowserClient, {
    get(_target, prop) {
      _client ??= createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const value = Reflect.get(_client, prop);
      return typeof value === "function" ? value.bind(_client) : value;
    },
  });
}
