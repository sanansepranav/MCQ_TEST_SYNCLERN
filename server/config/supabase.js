const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey =
  process.env.SUPABASE_KEY ||
  'sb_publishable_78JpbE8U-3Hg93oqwSIHSg_u-tWii2j';

let supabase = null;

try {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('⚡ Supabase Client initialized with key:', supabaseKey.substring(0, 20) + '...');
} catch (error) {
  console.warn('⚠️ Supabase initialization warning:', error.message);
}

module.exports = supabase;
