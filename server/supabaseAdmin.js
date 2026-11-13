const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_KEY must be set in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

module.exports = { supabaseAdmin, SUPABASE_URL };
