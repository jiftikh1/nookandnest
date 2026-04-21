import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Lazy proxy — defers client creation until first use so Next.js build-time
// route evaluation does not trip on missing env vars.
let _admin: SupabaseClient | undefined;
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    _admin ??= createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const value = Reflect.get(_admin, prop);
    return typeof value === "function" ? value.bind(_admin) : value;
  },
});
