require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  console.log("Fetching audit-builder-storage from Supabase...");
  const { data, error } = await supabase.from('app_state').select('state').eq('id', 'audit-builder-storage').single();
  if (error) {
    console.error("Error fetching data:", error);
    return;
  }
  
  let stateObj = typeof data.state === 'string' ? JSON.parse(data.state) : data.state;
  const appState = stateObj.state;
  
  if (!appState || !appState.audits) {
    console.log("No audits found in state.");
    return;
  }

  let modified = false;
  let targetAudit = null;
  
  const auditsList = Array.isArray(appState.audits) ? appState.audits : Object.values(appState.audits);
  for (const audit of auditsList) {
    if (audit.companyName && audit.companyName.toLowerCase().includes('mckenzie') || 
        (audit.websiteUrl && audit.websiteUrl.toLowerCase().includes('mckenzie'))) {
      targetAudit = audit;
      break;
    }
  }

  if (!targetAudit) {
    console.log("Could not find McKenzie Taxidermy audit in the database.");
    return;
  }

  console.log(`Found McKenzie Taxidermy audit! ID: ${targetAudit.id}`);
  
  const findingsList = Array.isArray(appState.findings) ? appState.findings : Object.values(appState.findings || {});
  
  for (const finding of findingsList) {
    if (finding.auditId === targetAudit.id) {
      if (finding.title && (finding.title.includes('Authority Consolidation Failure') || finding.title.includes('Traffic Leaking to Legacy Parked Domains'))) {
        console.log(`Resetting offsets for finding: ${finding.title}`);
        
        finding.verticalOffset = 0;
        finding.horizontalOffset = 0;
        finding.imageVerticalOffset = 0;
        finding.imageHorizontalOffset = 0;
        finding.image2VerticalOffset = 0;
        finding.image2HorizontalOffset = 0;
        finding.businessImpactVerticalOffset = 100;
        finding.businessImpactHorizontalOffset = 0;
        finding.recommendationVerticalOffset = 200;
        finding.recommendationHorizontalOffset = 0;
        finding.tableVerticalOffset = 300;
        finding.tableHorizontalOffset = 0;
        
        if (finding.title.includes('Traffic Leaking')) {
          finding.pageBreakBefore = false;
        }
        modified = true;
      }
    }
  }

  if (modified) {
    console.log(`Updating Supabase row ID: audit-builder-storage...`);
    const { error: updateError } = await supabase.from('app_state').update({ state: stateObj }).eq('id', 'audit-builder-storage');
    if (updateError) {
      console.error("Failed to update database:", updateError);
    } else {
      console.log("Successfully reset finding positions for the McKenzie audit in the main storage!");
    }
    
    // Also try to update the shared versions if they exist
    const { data: sharedData } = await supabase.from('app_state').select('id, state');
    for (const row of sharedData) {
      if (row.id.startsWith('shared-')) {
        let sObj = typeof row.state === 'string' ? JSON.parse(row.state) : row.state;
        if (sObj.id === targetAudit.id || sObj.companyName?.toLowerCase().includes('mckenzie') || sObj.websiteUrl?.toLowerCase().includes('mckenzie')) {
           console.log("Found shared copy, updating: " + row.id);
           
           if (sObj.sections) {
             for (const section of sObj.sections) {
               if (section.type === 'stage' && section.findings) {
                 for (let i = 0; i < section.findings.length; i++) {
                   const finding = section.findings[i];
                   if (finding.title && (finding.title.includes('Authority Consolidation Failure') || finding.title.includes('Traffic Leaking to Legacy Parked Domains'))) {
                     finding.verticalOffset = 0;
                     finding.horizontalOffset = 0;
                     finding.imageVerticalOffset = 0;
                     finding.imageHorizontalOffset = 0;
                     finding.image2VerticalOffset = 0;
                     finding.image2HorizontalOffset = 0;
                     finding.businessImpactVerticalOffset = 100;
                     finding.businessImpactHorizontalOffset = 0;
                     finding.recommendationVerticalOffset = 200;
                     finding.recommendationHorizontalOffset = 0;
                     finding.tableVerticalOffset = 300;
                     finding.tableHorizontalOffset = 0;
                     if (finding.title.includes('Traffic Leaking')) finding.pageBreakBefore = false;
                   }
                 }
               }
             }
           }
          await supabase.from('app_state').update({ state: sObj }).eq('id', row.id);
        }
      }
    }
  } else {
    console.log("Could not find the specific findings in the audit.");
  }
}

run();
