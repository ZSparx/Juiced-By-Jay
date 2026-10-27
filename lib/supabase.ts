import { createClient } from "@supabase/supabase-js";

// Public (anon) client: can only read active products thanks to row level security.
export function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Keep the public client wiring intact while allowing the preview shell to render
  // when project variables have not reached the running server yet.
  if (!url || !key) return null;

  return createClient(url, key, { auth: { persistSession: false } });
}
