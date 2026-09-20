export const isSupabaseAdminConfigured = false;

export const supabaseAdmin: any = new Proxy(
  {},
  {
    get(_target, prop) {
      if (prop === "from") {
        return () => ({
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve({ data: null, error: null }),
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
              order: () => Promise.resolve({ data: [], error: null }),
            }),
            order: () => Promise.resolve({ data: [], error: null }),
          }),
          insert: () => Promise.resolve({ data: null, error: null }),
          update: () => Promise.resolve({ data: null, error: null }),
          delete: () => Promise.resolve({ data: null, error: null }),
          upsert: () => Promise.resolve({ data: null, error: null }),
        });
      }
      return () => Promise.resolve({ data: null, error: null });
    },
  }
);
