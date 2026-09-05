// Initialize client-side Supabase client using configuration from server
let supabaseInstance = null;

async function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  try {
    const res = await fetch('/api/config');
    const config = await res.json();
    if (!config.supabaseUrl || !config.supabaseAnonKey) {
      throw new Error('Supabase configuration missing');
    }
    // Using global window.supabase from the CDN script
    supabaseInstance = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    throw err;
  }
}

window.getSupabase = getSupabase;
