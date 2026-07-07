const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('app_state')
    .select('id, state, updated_at')
    .order('updated_at', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error("Error:", error);
  } else {
    const found = data.filter(d => JSON.stringify(d.state).toLowerCase().includes('mckenzie'));
    console.log("Audits found:", found.map(f => ({ id: f.id, updated_at: f.updated_at })));
  }
}

main();
