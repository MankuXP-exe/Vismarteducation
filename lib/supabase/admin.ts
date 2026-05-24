import { createClient } from "@supabase/supabase-js";

// Admin client bypasses RLS — use for server-only operations like
// creating enrollments from payment webhooks, seeding data, etc.
// NEVER import this in client components.

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);
