const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
  const { data } = await supabase.from('app_state').select('state').eq('id', 'audit-builder-storage').single();
  const audits = Object.values(data.state.state.audits);
  const mckenzie = audits.find(a => a.companyName && a.companyName.includes('McKenzie'));
  if (!mckenzie) { console.log('not found'); return; }
  console.log('isNewArchitecture?', Boolean(mckenzie.blocks && mckenzie.blocks.length > 0) || Boolean(mckenzie.pages && mckenzie.pages.some(p => p.blocks && p.blocks.length > 0)));
  const conclusionPage = mckenzie.pages?.find(p => p.id === 'conclusion');
  console.log('Conclusion Page Blocks:', conclusionPage ? conclusionPage.blocks?.map(b => b.type) : 'none');
}
run();
