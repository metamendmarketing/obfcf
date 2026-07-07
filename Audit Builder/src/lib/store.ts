/**
 * @file store.ts
 * @description Core global state management for the Audit Builder application using Zustand.
 * Handles state persistence, multi-audit tracking, finding categorization, and page management.
 * Uses idb-keyval (IndexedDB) as the primary storage mechanism to bypass the 5MB localStorage limit,
 * with graceful degradation to localStorage.
 * 
 * ARCHITECTURE NOTE:
 * The application currently supports two rendering architectures:
 * 1. Legacy Architecture: Uses `reportStructure` to define sections and custom headings.
 * 2. New Architecture: Uses `pages` and `blocks` (e.g., HeroHeaderBlock, TextBlock) for modular composition.
 * Both coexist in the state, and `LivePreview` orchestrates which to render based on the presence of `blocks`.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase } from './supabase';
import { DEFAULT_CONCLUSION } from './constants';
import { get as getIdb, set as setIdb, del as delIdb } from 'idb-keyval';

let timeoutId: any = null;

const supabaseStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // Check for injected state first (used by headless PDF generator)
    if (typeof window !== 'undefined' && (window as any).__AUDIT_STATE__) {
      return (window as any).__AUDIT_STATE__;
    }

    // 1. Fetch Supabase state
    let supabaseVal: string | null = null;
    let supabaseTime = 0;
    let shellState: any = null;
    try {
      const fetchPromise = supabase
        .from('app_state')
        .select('state')
        .eq('id', name)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Supabase fetch timeout')), 30000)
      );

      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      const { data, error } = result;
        
      if (error && error.code !== 'PGRST116') {
        console.error("Supabase fetch error", error);
      }
      
      if (data && data.state) {
        shellState = typeof data.state === 'string' ? JSON.parse(data.state) : data.state;
        supabaseTime = shellState?.lastUpdated || shellState?.state?.lastUpdated || 0;
      }
    } catch (e) {
      console.error("Supabase unavailable", e);
    }

    // 2. Fetch IndexedDB state
    let idbVal: string | null = null;
    let idbTime = 0;
    try {
      const idbValue = await getIdb(name);
      if (idbValue) {
        idbVal = typeof idbValue === 'string' ? idbValue : JSON.stringify(idbValue);
        const parsed = JSON.parse(idbVal);
        idbTime = parsed?.state?.lastUpdated || 0;
      }
    } catch (e) {
      console.warn("IndexedDB read failed during migration fallback", e);
    }

    // 3. Fetch localStorage state
    let localVal: string | null = null;
    let localTime = 0;
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(name);
        if (stored) {
          localVal = stored;
          const parsed = JSON.parse(stored);
          localTime = parsed?.state?.lastUpdated || 0;
        }
      } catch (e) {
        console.warn("localStorage read failed during migration fallback", e);
      }
    }

    // 4. Compare timestamps and find the newest state
    let newestVal: string | null = null;
    let newestTime = -1;
    let source = "none";
    
    // Determine if we are running inside the headless PDF generator
    const isHeadless = typeof window !== 'undefined' && window.location.search.includes('headless=true');

    if (shellState) {
      newestTime = supabaseTime;
      source = "supabase";
    }
    
    // Headless browser should always use Supabase, bypassing any poisoned /tmp/ local storage
    if (!isHeadless) {
      if (idbVal && idbTime >= newestTime) {
        newestTime = idbTime;
        source = "indexeddb";
      }
      if (localVal && localTime >= newestTime) {
        newestTime = localTime;
        source = "localstorage";
      }
    }

    console.log(`Loaded state from ${source} with timestamp ${newestTime}`);

    // If Supabase won, we need to fetch chunks if applicable
    if (source === "supabase" && shellState) {
        if (shellState.isChunked) {
            try {
                const auditIds = shellState.activeAuditIds || [];
                const tplIds = shellState.activeTemplateIds || [];
                const findingIds = shellState.activeFindingIds || [];
                
                const chunkIds = [
                   ...auditIds.map((id: string) => `chunk-audit-${id}`),
                   ...tplIds.map((id: string) => `chunk-tpl-${id}`),
                   ...findingIds.map((id: string) => `chunk-finding-${id}`)
                ];
                
                const reconstructedAudits: any = {};
                const reconstructedFindings: any = {};
                const reconstructedTemplates: any = {};
                
                for (let i = 0; i < chunkIds.length; i += 50) {
                    const batchIds = chunkIds.slice(i, i + 50);
                    const { data: chunksData } = await supabase
                        .from('app_state')
                        .select('id, state')
                        .in('id', batchIds);
                        
                    if (chunksData) {
                        chunksData.forEach(row => {
                            if (row.id.startsWith('chunk-audit-')) {
                                if (row.state.audit) reconstructedAudits[row.state.audit.id] = row.state.audit;
                                if (row.state.findings) {
                                    row.state.findings.forEach((f: any) => {
                                        reconstructedFindings[f.id] = f;
                                    });
                                }
                            } else if (row.id.startsWith('chunk-finding-')) {
                                reconstructedFindings[row.state.id] = row.state;
                            } else if (row.id.startsWith('chunk-tpl-')) {
                                reconstructedTemplates[row.state.id || row.id.replace('chunk-tpl-', '')] = row.state;
                            }
                        });
                    }
                }
                
                const targetState = shellState.state || shellState;
                targetState.audits = reconstructedAudits;
                targetState.findings = reconstructedFindings;
                targetState.pageTemplates = reconstructedTemplates;
                targetState.deletedAuditIds = shellState.deletedAuditIds || [];
                targetState.deletedTemplateIds = shellState.deletedTemplateIds || [];
                targetState.deletedFindingIds = shellState.deletedFindingIds || [];
                targetState.deletedUsernames = shellState.deletedUsernames || [];
                
                // PRESERVE LOCAL SESSION
                let localUser = null;
                try {
                  const sessionStr = typeof window !== 'undefined' ? window.localStorage.getItem('audit-session') : null;
                  if (sessionStr) {
                    localUser = JSON.parse(sessionStr);
                  } else {
                    const localParsed = idbVal ? JSON.parse(idbVal) : (localVal ? JSON.parse(localVal) : null);
                    localUser = localParsed?.state?.currentUser || localParsed?.currentUser || null;
                  }
                } catch(e) {}
                targetState.currentUser = localUser;
                
                supabaseVal = JSON.stringify(shellState);
            } catch (e) {
                console.error("Failed to fetch chunks", e);
            }
        } else {
            supabaseVal = JSON.stringify(shellState);
        }
        newestVal = supabaseVal;
    } else if (source === "indexeddb") {
        newestVal = idbVal;
    } else if (source === "localstorage") {
        newestVal = localVal;
    }

    // ALWAYS ensure cloud users are injected into newestVal so the local browser is never missing accounts
    if (newestVal && shellState) {
        try {
            const parsedNewest = JSON.parse(newestVal);
            const cloudUsers = shellState.state ? shellState.state.users : shellState.users;
            if (cloudUsers && Object.keys(cloudUsers).length > 0) {
                if (parsedNewest.state) {
                    parsedNewest.state.users = { ...cloudUsers, ...(parsedNewest.state.users || {}) };
                } else {
                    parsedNewest.users = { ...cloudUsers, ...(parsedNewest.users || {}) };
                }
                newestVal = JSON.stringify(parsedNewest);
            }
        } catch(e) {}
    }

    // 5. If local state was newer than Supabase, trigger an immediate sync to Supabase in the background!
    if ((source === "indexeddb" || source === "localstorage") && newestVal) {
      try {
        // We reuse setItem logic to ensure chunking happens on background sync
        supabaseStorage.setItem(name, newestVal).then(() => {
           console.log("Background sync to Supabase (chunked) succeeded!");
        }).catch(err => {
           console.error("Background sync failed", err);
        });
      } catch (e) {
        console.error("Background sync dispatch failed", e);
      }
    }

    // 6. Ensure all caches are updated with the newest state
    if (newestVal) {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(name, newestVal);
        } catch (e) {
          console.warn("localStorage quota exceeded, skipping local storage write.");
        }
      }
      try {
        setIdb(name, newestVal).catch(() => {});
      } catch (e) {
        console.warn("IndexedDB write failed", e);
      }
    }

    return newestVal;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    // Inject a native timestamp on every save to guarantee mathematically perfect hydration
    try {
      const parsed = JSON.parse(value);
      if (parsed.state) {
        parsed.state.lastUpdated = Date.now();
        value = JSON.stringify(parsed);
      }
    } catch (e) {
      console.error("Failed to inject timestamp", e);
    }

    // 1. Save locally immediately to prevent data loss on page refresh/unload
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(name, value);
      } catch (e) {
        console.warn("localStorage quota exceeded, relying on IndexedDB");
      }
    }
    try {
      await setIdb(name, value);
    } catch (e) {
      console.error("IndexedDB save failed", e);
    }

    // 2. Debounce the cloud sync to Supabase
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(async () => {
      try {
        const parsedState = JSON.parse(value);
        const stateObj = parsedState.state || parsedState;
        
        const fullState = getFullState ? getFullState() : null;
        const audits = fullState ? fullState.audits : (stateObj.audits || {});
        const findings = fullState ? fullState.findings : (stateObj.findings || {});
        const pageTemplates = fullState ? fullState.pageTemplates : (stateObj.pageTemplates || {});
        
        const localActiveAuditIds = Object.keys(audits);
        const localActiveTemplateIds = Object.keys(pageTemplates);
        const localDeletedAuditIds = stateObj.deletedAuditIds || [];
        const localDeletedTemplateIds = stateObj.deletedTemplateIds || [];
        
        // Fetch current shell from DB to merge and prevent race conditions
        const { data: currentShellData } = await supabase.from('app_state').select('state').eq('id', name).single();
        const currentShell = currentShellData?.state || {};
        
        const cloudActiveAuditIds = currentShell.activeAuditIds || [];
        const cloudActiveTemplateIds = currentShell.activeTemplateIds || [];
        const cloudDeletedAuditIds = currentShell.deletedAuditIds || [];
        const cloudDeletedTemplateIds = currentShell.deletedTemplateIds || [];
        const cloudActiveFindingIds = currentShell.activeFindingIds || [];
        
        const localActiveFindingIds = Object.keys(findings);
        const localDeletedFindingIds = stateObj.deletedFindingIds || [];
        const cloudDeletedFindingIds = currentShell.deletedFindingIds || [];
        
        const localDeletedUsernames = stateObj.deletedUsernames || [];
        const cloudDeletedUsernames = currentShell.deletedUsernames || [];
        
        const mergedDeletedAuditIds = Array.from(new Set([...cloudDeletedAuditIds, ...localDeletedAuditIds]));
        const mergedDeletedTemplateIds = Array.from(new Set([...cloudDeletedTemplateIds, ...localDeletedTemplateIds]));
        const mergedDeletedFindingIds = Array.from(new Set([...cloudDeletedFindingIds, ...localDeletedFindingIds]));
        const mergedDeletedUsernames = Array.from(new Set([...cloudDeletedUsernames, ...localDeletedUsernames]));
        
        const mergedActiveAuditIds = Array.from(new Set([...cloudActiveAuditIds, ...localActiveAuditIds]))
                                       .filter(id => !mergedDeletedAuditIds.includes(id));
        const mergedActiveTemplateIds = Array.from(new Set([...cloudActiveTemplateIds, ...localActiveTemplateIds]))
                                       .filter(id => !mergedDeletedTemplateIds.includes(id));
                                       
        const mergedActiveFindingIds = Array.from(new Set([...cloudActiveFindingIds, ...localActiveFindingIds]))
                                       .filter(id => !mergedDeletedFindingIds.includes(id));
        
        const shellState = JSON.parse(JSON.stringify(parsedState));
        
        // Merge users to preserve all cloud users so they aren't overwritten by local browser
        const shellStateUsers = shellState.state ? shellState.state.users : shellState.users;
        const currentShellUsers = currentShell.state ? currentShell.state.users : currentShell.users;
        const mergedUsers = {
          ...(currentShellUsers || {}),
          ...(shellStateUsers || {})
        };
        mergedDeletedUsernames.forEach(username => {
          delete mergedUsers[username];
        });

        if (shellState.state) {
            shellState.state.audits = {};
            shellState.state.findings = {};
            shellState.state.pageTemplates = {};
            shellState.state.currentUser = null; // Do not upload local session
            shellState.state.users = mergedUsers;
        } else {
            shellState.audits = {};
            shellState.findings = {};
            shellState.pageTemplates = {};
            shellState.currentUser = null;
            shellState.users = mergedUsers;
        }
        
        shellState.isChunked = true;
        shellState.activeAuditIds = mergedActiveAuditIds;
        shellState.activeTemplateIds = mergedActiveTemplateIds;
        shellState.activeFindingIds = mergedActiveFindingIds;
        shellState.deletedAuditIds = mergedDeletedAuditIds;
        shellState.deletedTemplateIds = mergedDeletedTemplateIds;
        shellState.deletedFindingIds = mergedDeletedFindingIds;
        shellState.deletedUsernames = mergedDeletedUsernames;
        
        // Upsert shell
        const { error: shellError } = await supabase.from('app_state').upsert({ id: name, state: shellState });
        if (shellError) throw shellError;
        
        // Prepare chunks
        const rows = [];
        for (const auditId of mergedActiveAuditIds) {
           const auditData = audits[auditId];
           if (!auditData) continue; // Only push chunks that exist locally
           rows.push({
             id: `chunk-audit-${auditId}`,
             state: { audit: auditData }
           });
        }
        for (const findingId of mergedActiveFindingIds) {
           const findingData = findings[findingId];
           if (!findingData) continue;
           rows.push({
             id: `chunk-finding-${findingId}`,
             state: findingData
           });
        }
        for (const tplId of mergedActiveTemplateIds) {
           const tplData = pageTemplates[tplId];
           if (!tplData) continue;
           rows.push({
             id: `chunk-tpl-${tplId}`,
             state: tplData
           });
        }
        
        // Upload chunks sequentially in larger batches since rows are much smaller now
        for (let i = 0; i < rows.length; i += 50) {
            const chunkRows = rows.slice(i, i + 50);
            const { error: chunkError } = await supabase.from('app_state').upsert(chunkRows);
            if (chunkError) console.error("Chunk upload error", chunkError);
        }
      } catch (e) {
        console.error("Supabase save failed", e);
      }
    }, 1500); // 1.5s debounce for cloud sync
    return Promise.resolve();
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await supabase.from('app_state').delete().eq('id', name);
    } catch (e) {
      console.error("Supabase removeItem failed", e);
    }
    if (typeof window !== 'undefined') window.localStorage.removeItem(name);
    try {
      await delIdb(name);
    } catch (e) {}
  },
};

export type BlockType = 
  | 'HeroHeader' 
  | 'RichText' 
  | 'HighlightCards' 
  | 'ImageSideBySide' 
  | 'FindingDetail' 
  | 'DataPanel' 
  | 'Cover'
  | 'ProcessSteps'
  | 'ServiceList'
  | 'StageHeader'
  | 'StageCaption'
  | 'ThankYou';

export interface Block {
  id: string;
  type: BlockType;
  data: any;
}

export interface ReportPage {
  id: string;
  title: string;
  blocks: Block[];
  isLocked?: boolean;
  isHidden?: boolean;
  annotations?: Annotation[];
  layout?: 'standard' | 'split-focus';
}

export function createDefaultPages(): ReportPage[] {
  return [
    {
      id: "cover",
      title: "Cover Page",
      isLocked: true,
      blocks: [{ id: crypto.randomUUID(), type: 'Cover', data: {} }]
    },
    {
      id: "executive-summary",
      title: "Executive Summary",
      isLocked: true,
      blocks: [
        { 
          id: crypto.randomUUID(), 
          type: 'HeroHeader', 
          data: { 
            title: 'Creating the Right Conditions for Growth',
            alignment: 'left'
          } 
        },
        { 
          id: crypto.randomUUID(), 
          type: 'RichText', 
          data: { 
            html: `
<div class="font-sans text-gray-800 leading-relaxed text-xl max-w-4xl">
  <p class="mb-4">Sealeze operates in a specialized, trust-driven market where <strong>search visibility and clarity strongly influence buying decisions</strong>. You already understand the importance of capturing demand, especially as customers <strong>increasingly rely on digital touchpoints to evaluate suppliers</strong>.</p>
  
  <p class="mb-6"><strong>AI-driven search, third-party platforms, and embedded external content now play a larger role in how users find and consume information.</strong> In some cases, this creates value leaks, where attention is pulled away from Waupaca's own content.</p>
  
  <img src="/audits/mcp-assets/mcp_page_10_img_2.png" class="rounded-md shadow-lg border border-black/10" style="display: inline-block; float: right; padding-left: 8px; width: 450px;" containerstyle="display: inline-block; float: right; padding-left: 8px; width: 450px;" wrapperstyle="display: inline-block; float: right; padding-left: 8px; width: 450px;" width="450" alt="Competitor ads appearing within embedded YouTube content" />
  
  <p class="mb-4">An example of this is <strong>competitor ads appearing within embedded YouTube content on the site</strong>, which can distract users and reduce trust during evaluation.</p>
  
  <p class="mb-10">This audit categorizes the friction points holding you back, and the opportunities waiting to be claimed into <strong>3 distinct phases of the user journey:</strong></p>
</div>
`
          } 
        },
        {
          id: crypto.randomUUID(),
          type: 'HighlightCards',
          data: {
            title: '',
            layout: 'grid',
            cards: [
              {
                title: 'Awareness',
                value: 'Phase 1',
                trend: 'Identifying the technical barriers - like missing rich results and inconsistent title - that render the brand invisible to high-intent searchers.',
                trendDirection: 'neutral'
              },
              {
                title: 'Consideration',
                value: 'Phase 2',
                trend: 'Highlighting where site performance, broken links, and confusing navigation erode the confidence of users who do arrive.',
                trendDirection: 'neutral'
              },
              {
                title: 'Conversion',
                value: 'Phase 3',
                trend: 'Friction points that slow action, along with opportunities to strengthen performance as search continues to evolve.',
                trendDirection: 'neutral'
              }
            ]
          }
        },
        { 
          id: crypto.randomUUID(), 
          type: 'RichText', 
          data: { 
            html: `
<div class="font-sans text-gray-800 leading-relaxed text-xl mt-12 max-w-4xl">
  <p>After addressing the immediate friction points, we outline <strong>3 key long-term focus areas</strong> that will ensure Sealeze's site is structurally search-ready from every angle. We conclude with a focused <strong>SEM competitive audit</strong> that highlights how to capture and strengthen every conversion opportunity landing on the site.</p>
</div>
`
          } 
        }
      ]
    },
    {
      id: "findings",
      title: "Findings",
      isLocked: true,
      blocks: []
    },
    {
      id: "paid-search",
      title: "Paid Search Opportunities",
      isLocked: true,
      blocks: [
        { id: crypto.randomUUID(), type: 'HeroHeader', data: { title: 'Paid Search Opportunities', alignment: 'left' } },
        { id: crypto.randomUUID(), type: 'DataPanel', data: {} },
        { id: crypto.randomUUID(), type: 'RichText', data: { html: '<p>Given the current quality of competitor ads, you are well positioned to launch a search campaign that outperforms the field...</p>' } }
      ]
    },
    {
      id: "seo-onboarding",
      title: "SEO Onboarding Process",
      isLocked: true,
      layout: 'split-focus',
      blocks: [
        { id: crypto.randomUUID(), type: 'HeroHeader', data: { title: 'SEO Onboarding Process', alignment: 'left' } },
        { id: crypto.randomUUID(), type: 'ProcessSteps', data: {
            steps: [
              { title: "Client Insights", description: "<p>The first step in our onboarding process is to gather important information with our questionnaire. This helps ensure we have sufficient access and will allow us to better understand your unique digital marketing goals.</p>" },
              { title: "Quick Win Audit", description: "<p>The next critical step is to create an audit of your current SEO strategy/website and identify all of the quick-win opportunities that will drive the highest ROI. Fixing high priority issues and taking advantage of low hanging fruit opportunities will serve as the basis for our SEO strategy during the setup process.</p>" },
              { title: "Keyword Research", description: "<p>Keyword research is a core part of our onboarding and the foundation of your on-page SEO strategy. We build a complete keyword set with search volume and buyer-stage insights to target relevant terms and improve SERP rankings.</p>" },
              { title: "Analytics & GTM Setup", description: "<p>The final component of our onboarding process is to implement conversion tracking on your site. Our team will leverage Google Tag Manager along with Google Analytics to accurately track user engagement across your site, and ensure this data is captured and accessible.</p>" },
              { title: "Reporting", description: "<p>Step one will be to create a custom dashboard to monitor KPIs relating to user volume, engagement, and conversions. Our reporting makes big data digestible, and we are always ready to interpret data and make recommendations.</p>" }
            ]
          }
        }
      ]
    },
    {
      id: "recommended-setup",
      title: "Recommended Organic SEO Setup",
      isLocked: true,
      blocks: [
        { id: crypto.randomUUID(), type: 'HeroHeader', data: { title: 'Recommended Organic SEO Setup', alignment: 'left' } },
        { id: crypto.randomUUID(), type: 'ProcessSteps', data: {
            steps: [
              { title: "Technical Foundation", description: "<p>We begin by resolving core technical hurdles, including sitemap generation, robots.txt configuration, and setting up Google Search Console accurately.</p>" },
              { title: "On-Page Optimization", description: "<p>Applying our keyword research, we will systematically update meta titles, descriptions, and heading structures across your highest priority pages to align with user intent.</p>" },
              { title: "Performance Tuning", description: "<p>Addressing site speed and Core Web Vitals to ensure mobile responsiveness and load times meet Google's strict algorithmic thresholds.</p>" }
            ]
          }
        }
      ]
    },
    {
      id: "recommended-monthly",
      title: "Recommended Monthly Services",
      isLocked: true,
      blocks: [
        { id: crypto.randomUUID(), type: 'HeroHeader', data: { title: 'Recommended Monthly SEO Services', subtitle: 'Below are our suggested organic monthly optimizations; however, this list is not exhaustive.', alignment: 'right' } },
        { id: crypto.randomUUID(), type: 'ServiceList', data: {
            columns: 2,
            services: [
              { title: "Continued Keyword Research", description: "<p>Identifying new, high-value search terms and topical clusters to expand your reach as the market evolves.</p>" },
              { title: "Content Gap Analysis", description: "<p>Reviewing competitor content to find unaddressed topics and queries, allowing us to capture market share with targeted new pages.</p>" },
              { title: "Technical Maintenance", description: "<p>Ongoing crawling and monitoring to identify and fix new 404 errors, broken links, or indexing issues as your site grows.</p>" },
              { title: "Link Building Outreach", description: "<p>Securing high-quality, authoritative backlinks to increase your domain authority and push competitive pages higher in the SERPs.</p>" },
              { title: "Performance Reporting", description: "<p>Monthly check-ins and dashboard reviews to analyze traffic, keyword movement, and conversion trends.</p>" }
            ]
          }
        }
      ]
    },
    {
      id: "conclusion",
      title: "Conclusion",
      isLocked: true,
      blocks: [
        { id: crypto.randomUUID(), type: 'HeroHeader', data: { title: 'Conclusion', subtitle: "You've scaled the platform. Now let's scale how it's seen.", alignment: 'left' } },
        { id: crypto.randomUUID(), type: 'RichText', data: { html: DEFAULT_CONCLUSION } }
      ]
    },
    {
      id: "thank-you",
      title: "Thank You",
      isLocked: true,
      blocks: [
        { 
          id: crypto.randomUUID(), 
          type: 'ThankYou', 
          data: { 
            name: "Matthew Bowes",
            phone: "+1 250 483 6713",
            email: "mbowes@metamend.com",
            website: "metamend.com"
          } 
        }
      ]
    }
  ];
}



export type CoverLogo = {
  id: string;
  url: string;
  x: number;
  y: number;
  width: number;
};

export type Audit = {
  id: string;
  companyName: string;
  hideCompanyName?: boolean;
  auditTitle?: string;
  websiteUrl: string;
  coverLogos?: CoverLogo[];
  industry: string;
  primaryService: "SEO" | "SEM" | "CRO" | "Analytics" | "Full Search Marketing";
  preparedBy: string;
  date: string;
  notes?: string;
  accentColor?: string;
  status: "Draft" | "Review" | "Approved";

  reportStructure?: {
    executiveSummary?: string;
    executiveSummaryImage?: string;
    paidSearchOpportunities?: string;
    seoOnboarding?: string;
    recommendedSetup?: string;
    recommendedMonthly?: string;
    conclusion?: string;
    sections?: any[];
    tableOfContents?: { title: string; pageNumber: string; isSubItem?: boolean }[];
    customHeadings?: {
      paidSearchOpportunities?: string;
      seoOnboarding?: string;
      seoOnboardingSubtext?: string;
      recommendedSetup?: string;
      recommendedMonthly?: string;
      conclusion?: string;
      conclusionSubtext?: string;
    };
    stageConfigs?: Record<string, { heading: string; caption: string }>;
    paidSearchData?: {
      panelTitle?: string;
      panelText1?: string;
      panelText2?: string;
      step1Title?: string;
      step1Text1?: string;
      step1Text2?: string;
      table1Title?: string;
      table1Rows?: { keyword: string; volume: string; cpc: string }[];
      table2Title?: string;
      table2Rows?: { keyword: string; volume: string; cpc: string }[];
      step2Title?: string;
      step2Text1?: string;
      step2Text2?: string;
      competitors?: { name: string; description: string; imageUrl: string }[];
      conclusionText?: string;
    };
    customStages?: string[];
  };
  pages?: ReportPage[];
  isTemplate?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LayoutType =
  | "image-left"
  | "image-right"
  | "image-full"
  | "comparison"
  | "gallery"
  | "text-only"
  | "legacy-box-left"
  | "legacy-box-right"
  | "legacy-box-top"
  | "legacy-box-bottom"
  | "strategic-card"
  | "sem-opportunity"
  | "roadmap";

export type Annotation = {
  id: string;
  type: "box" | "arrow";
  startX: number; // percentage relative to container width
  startY: number; // percentage relative to container height
  endX: number;
  endY: number;
  color: string;
};

export type Finding = {
  id: string;
  auditId: string;
  title: string;
  rawNotes: string;
  stage: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Opportunity";
  pageUrl?: string;
  evidence?: string;
  businessImpact?: string;
  recommendation?: string;
  boxColor?: "dark" | "light";
  
  // Custom Layout Offsets
  boxWidth?: number; // percentage (e.g. 40 to 100)
  verticalOffset?: number; // pixels (e.g. -200 to +200)
  horizontalOffset?: number; // pixels (e.g. -200 to +200)
  imageWidth?: number; // percentage (e.g. 30 to 100)
  imageVerticalOffset?: number; // pixels
  imageHorizontalOffset?: number; // pixels
  imageAlignment?: "left" | "center" | "right";
  
  image2Width?: number;
  image2VerticalOffset?: number;
  image2HorizontalOffset?: number;
  image2Alignment?: "left" | "center" | "right";
  
  image3Width?: number;
  image3VerticalOffset?: number;
  image3HorizontalOffset?: number;
  image3Alignment?: "left" | "center" | "right";
  
  // Draggable Card Offsets
  showBusinessImpact?: boolean;
  businessImpactWidth?: number;
  businessImpactVerticalOffset?: number;
  businessImpactHorizontalOffset?: number;
  
  showRecommendation?: boolean;
  recommendationWidth?: number;
  recommendationVerticalOffset?: number;
  recommendationHorizontalOffset?: number;

  // Optional floating table
  showTable?: boolean;
  tableContent?: string;
  tableHorizontalOffset?: number;
  tableVerticalOffset?: number;
  tableWidth?: number;

  // AI Polished Fields
  polishedTitle?: string;
  polishedSummary?: string;
  polishedBody?: string;
  clientFriendlyExplanation?: string;
  severityRationale?: string;
  
  // Media & Layout
  imageUrl?: string; // Legacy fallback
  imageUrls?: string[]; // Array of base64 strings for galleries
  imageCaption?: string;
  competitorImageUrl?: string;
  layoutType: LayoutType;
  
  status: "Draft" | "Polished" | "Needs Review" | "Included in Report" | "Hidden";
  order: number;
  pageBreakBefore?: boolean;
  isPageBreak?: boolean;
  annotations?: Annotation[];
  createdAt: string;
  updatedAt: string;
};

export interface User {
  username: string;
  role: 'admin' | 'user';
  password?: string;
  profileImage?: string; // Base64 or URL
}

let getFullState: (() => AppState) | null = null;

export interface AppState {
  // App State
  audits: Record<string, Audit>;
  findings: Record<string, Finding>;
  pageTemplates: Record<string, ReportPage>;
  activeAuditId: string | null;
  hasHydrated: boolean;
  deletedAuditIds: string[];
  deletedTemplateIds: string[];
  deletedFindingIds: string[];
  deletedUsernames: string[];
  activeEditors: Record<string, string[]>;
  
  // Auth state
  users: Record<string, User>;
  currentUser: User | null;
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  createUser: (username: string, password: string, role: 'admin' | 'user', profileImage?: string) => boolean;
  updateUserRole: (username: string, role: 'admin' | 'user') => void;
  updateUserProfileImage: (username: string, profileImage: string) => void;
  deleteUser: (username: string) => void;
  changePassword: (username: string, newPassword: string) => void;

  toggleAuditTemplate: (id: string) => void;
  saveAuditAsTemplate: (id: string) => string | null;
  savePageTemplate: (page: ReportPage, name: string) => void;
  deletePageTemplate: (id: string) => void;
  addPageToAudit: (auditId: string, templateId?: string) => string;
  
  createAudit: (audit: Omit<Audit, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => string;
  updateAudit: (id: string, updates: Partial<Audit>) => void;
  setActiveAudit: (id: string) => void;
  
  addFinding: (auditId: string, finding: Omit<Finding, 'id' | 'createdAt' | 'updatedAt' | 'auditId' | 'status' | 'order'>) => string;
  updateFinding: (id: string, updates: Partial<Finding>) => void;
  removeFinding: (id: string) => void;
  updateReportStructure: (auditId: string, updates: Partial<NonNullable<Audit["reportStructure"]>>) => void;
  updatePages: (auditId: string, pages: ReportPage[]) => void;
  updatePageAnnotations: (auditId: string, pageId: string, annotations: Annotation[]) => void;
  deleteAudit: (id: string) => void;
  cloneAudit: (id: string) => string | null;
  loadValtirTemplate: () => void;
  loadEverestTemplate: () => void;
}

import { valtirAudit, valtirFindings } from './templates/valtir-template';
import { everestAudit, everestFindings } from './templates/everest-final';

const initialUsers: Record<string, User> = {
  "kosborne@metamend.com": {
    username: "kosborne@metamend.com",
    password: "Entity555#",
    role: "admin",
    profileImage: ""
  },
  "bgacek@metamend.com": {
    username: "bgacek@metamend.com",
    password: "Metamend2026!",
    role: "user",
    profileImage: ""
  },
  "mbowes@metamend.com": {
    username: "mbowes@metamend.com",
    password: "Metamend2026!",
    role: "user",
    profileImage: ""
  },
  "blibrandi@metamend.com": {
    username: "blibrandi@metamend.com",
    password: "Metamend2026!",
    role: "user",
    profileImage: ""
  },
  "svreeswijk@metamend.com": {
    username: "svreeswijk@metamend.com",
    password: "Metamend2026!",
    role: "user",
    profileImage: ""
  }
};

const initialAudits: Record<string, Audit> = {};

const initialFindings: Record<string, Finding> = {};

function migrateImageUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  if (url.startsWith('/images/') || url.startsWith('/mcp-assets/') || url.startsWith('/client-logos.png')) {
    return `/audits${url}`;
  }
  return url;
}

function migrateHtml(html: string | undefined): string | undefined {
  if (!html) return html;
  return html
    .replace(/src="\/mcp-assets\//g, 'src="/audits/mcp-assets/')
    .replace(/src="\/images\//g, 'src="/audits/images/')
    .replace(/src="\/client-logos.png/g, 'src="/audits/client-logos.png');
}

function migrateFinding(finding: any) {
  if (!finding) return finding;
  if (finding.imageUrl) {
    finding.imageUrl = migrateImageUrl(finding.imageUrl);
  }
  if (finding.imageUrls && Array.isArray(finding.imageUrls)) {
    finding.imageUrls = finding.imageUrls.map(migrateImageUrl);
  }
  return finding;
}

function migrateAudit(audit: any) {
  if (!audit) return audit;
  
  if (audit.clientLogoUrl) {
    audit.clientLogoUrl = migrateImageUrl(audit.clientLogoUrl);
  }
  
  if (audit.coverLogos && Array.isArray(audit.coverLogos)) {
    audit.coverLogos.forEach((logo: any) => {
      if (logo.url) logo.url = migrateImageUrl(logo.url);
    });
  }

  if (audit.reportStructure) {
    if (audit.reportStructure.executiveSummary) {
      audit.reportStructure.executiveSummary = migrateHtml(audit.reportStructure.executiveSummary);
    }
    if (audit.reportStructure.paidSearchOpportunities) {
      audit.reportStructure.paidSearchOpportunities = migrateHtml(audit.reportStructure.paidSearchOpportunities);
    }
    if (audit.reportStructure.paidSearchData?.competitors) {
      audit.reportStructure.paidSearchData.competitors.forEach((comp: any) => {
        if (comp.imageUrl) comp.imageUrl = migrateImageUrl(comp.imageUrl);
      });
    }
  }

  if (audit.pages && Array.isArray(audit.pages)) {
    audit.pages.forEach((page: any) => {
      if (page.blocks && Array.isArray(page.blocks)) {
        page.blocks.forEach((block: any) => {
          if (block.type === 'RichText' && block.data?.html) {
            block.data.html = migrateHtml(block.data.html);
          }
          if (block.data?.logos && Array.isArray(block.data.logos)) {
            block.data.logos.forEach((logo: any) => {
              if (logo.url) logo.url = migrateImageUrl(logo.url);
            });
          }
          if (block.data?.competitors && Array.isArray(block.data.competitors)) {
            block.data.competitors.forEach((comp: any) => {
              if (comp.imageUrl) comp.imageUrl = migrateImageUrl(comp.imageUrl);
            });
          }
        });
      }
    });

    const hasFindingsPage = audit.pages.some((p: any) => p.id === 'findings');
    if (!hasFindingsPage) {
      const execSummaryIndex = audit.pages.findIndex((p: any) => p.id === 'executive-summary');
      const findingsPage = {
        id: 'findings',
        title: 'Findings',
        isLocked: true,
        blocks: []
      };
      if (execSummaryIndex !== -1) {
        audit.pages.splice(execSummaryIndex + 1, 0, findingsPage);
      } else {
        const coverIndex = audit.pages.findIndex((p: any) => p.id === 'cover');
        audit.pages.splice(coverIndex !== -1 ? coverIndex + 1 : 1, 0, findingsPage);
      }
    }
  }

  return audit;
}

/**
 * Global application store initialized with Zustand.
 * Provides all reactive state updates and persistence logic.
 */
export const useStore = create<AppState>()(
  persist(
    (set, get) => {
      getFullState = get;
      return {
        users: initialUsers,
        currentUser: null,
        audits: initialAudits,
        findings: initialFindings,
        pageTemplates: {},
        activeAuditId: null,
        hasHydrated: false,
        deletedAuditIds: [],
        deletedTemplateIds: [],
        deletedFindingIds: [],
        deletedUsernames: [],
        activeEditors: {},

        login: async (username: string, password: string) => {
          const state = get();
          const cleanUsername = username.toLowerCase().trim();
          let user = state.users[cleanUsername];
          
          // If user not found or password doesn't match, attempt a cloud refresh of users
          // This handles the case where the initial hydration fell back to an old offline cache
          // that didn't have this user yet.
          if (!user || user.password !== password) {
            try {
              const { data: currentShellData } = await supabase.from('app_state').select('state').eq('id', 'audit-builder-storage').single();
              const currentShell = currentShellData?.state || {};
              if (currentShell.users) {
                  set((s: AppState) => ({
                    users: { ...s.users, ...currentShell.users }
                  }));
                  const updatedState = get();
                  user = updatedState.users[cleanUsername];
              }
            } catch (e) {
              console.warn("Failed to fetch users during login attempt", e);
            }
          }
          
          if (user && user.password === password) {
            set({ currentUser: user });
            if (typeof window !== 'undefined') {
              try { window.localStorage.setItem('audit-session', JSON.stringify(user)); } catch(e) {}
            }
            return true;
          }
          return false;
        },

        logout: () => {
          set({ currentUser: null });
          if (typeof window !== 'undefined') {
            try { window.localStorage.removeItem('audit-session'); } catch(e) {}
          }
        },

        createUser: (username: string, password: string, role: 'admin' | 'user', profileImage: string = "") => {
          const state = get();
          const cleanUsername = username.toLowerCase().trim();
          if (!cleanUsername || !password) return false;
          if (state.users[cleanUsername]) return false;

          const newUser: User = {
            username: cleanUsername,
            password,
            role,
            profileImage
          };

          set((state: AppState) => ({
            users: {
              ...state.users,
              [cleanUsername]: newUser
            }
          }));
          return true;
        },

        updateUserRole: (username: string, role: 'admin' | 'user') => {
          const cleanUsername = username.toLowerCase().trim();
          set((state: AppState) => {
            const user = state.users[cleanUsername];
            if (!user) return state;
            const updatedUser = { ...user, role };
            const isCurrentUser = state.currentUser?.username === cleanUsername;
            return {
              users: {
                ...state.users,
                [cleanUsername]: updatedUser
              },
              currentUser: isCurrentUser ? updatedUser : state.currentUser
            };
          });
        },

        updateUserProfileImage: (username: string, profileImage: string) => {
          const cleanUsername = username.toLowerCase().trim();
          set((state: AppState) => {
            const user = state.users[cleanUsername];
            if (!user) return state;
            const updatedUser = { ...user, profileImage };
            const isCurrentUser = state.currentUser?.username === cleanUsername;
            return {
              users: {
                ...state.users,
                [cleanUsername]: updatedUser
              },
              currentUser: isCurrentUser ? updatedUser : state.currentUser
            };
          });
        },

        deleteUser: (username: string) => {
          const cleanUsername = username.toLowerCase().trim();
          set((state: AppState) => {
            if (state.currentUser?.username === cleanUsername) return state;
            const newUsers = { ...state.users };
            delete newUsers[cleanUsername];
            return { 
              users: newUsers,
              deletedUsernames: [...(state.deletedUsernames || []), cleanUsername]
            };
          });
        },

        changePassword: (username: string, newPassword: string) => {
          const cleanUsername = username.toLowerCase().trim();
          set((state: AppState) => {
            const user = state.users[cleanUsername];
            if (!user) return state;
            const updatedUser = { ...user, password: newPassword };
            const isCurrentUser = state.currentUser?.username === cleanUsername;
            return {
              users: {
                ...state.users,
                [cleanUsername]: updatedUser
              },
              currentUser: isCurrentUser ? updatedUser : state.currentUser
            };
          });
        },

        toggleAuditTemplate: (id: string) => set((state: AppState) => {
          const audit = state.audits[id];
          if (!audit) return state;
          return {
            audits: {
              ...state.audits,
              [id]: { ...audit, isTemplate: !audit.isTemplate, updatedAt: new Date().toISOString() }
            }
          };
        }),

        saveAuditAsTemplate: (id: string) => {
          const state = get();
          const sourceAudit = state.audits[id];
          if (!sourceAudit) return null;

          const newAuditId = crypto.randomUUID();
          const now = new Date().toISOString();

          const clonedAudit: Audit = {
            ...JSON.parse(JSON.stringify(sourceAudit)),
            id: newAuditId,
            companyName: `${sourceAudit.companyName} Template`,
            status: 'Draft',
            createdAt: now,
            updatedAt: now,
            isTemplate: true
          };

          const newFindings: Record<string, Finding> = {};
          Object.values(state.findings)
            .filter((f: any) => f.auditId === id)
            .forEach(f => {
              const newFindingId = crypto.randomUUID();
              newFindings[newFindingId] = {
                ...JSON.parse(JSON.stringify(f)),
                id: newFindingId,
                auditId: newAuditId,
                createdAt: now,
                updatedAt: now,
              };
            });

          set((state: AppState) => ({
            audits: {
              ...state.audits,
              [newAuditId]: clonedAudit
            },
            findings: {
              ...state.findings,
              ...newFindings
            }
          }));

          return newAuditId;
        },

        savePageTemplate: (page: ReportPage, name: string) => set((state: AppState) => {
          const id = `template-${crypto.randomUUID()}`;
          const cleanPage = JSON.parse(JSON.stringify(page));
          cleanPage.id = id;
          cleanPage.title = name;
          
          // Deep clone blocks with new IDs so they don't conflict
          cleanPage.blocks = cleanPage.blocks?.map((b: any) => ({
            ...b,
            id: crypto.randomUUID()
          })) || [];

          return {
            pageTemplates: {
              ...state.pageTemplates,
              [id]: cleanPage
            }
          };
        }),

        deletePageTemplate: (id: string) => set((state: AppState) => {
          if (state.currentUser?.role !== 'admin') {
            alert("Only an admin can delete page templates.");
            return state;
          }
          const newTemplates = { ...state.pageTemplates };
          delete newTemplates[id];
          return { 
            pageTemplates: newTemplates,
            deletedTemplateIds: Array.from(new Set([...(state.deletedTemplateIds || []), id]))
          };
        }),

        addPageToAudit: (auditId: string, templateId?: string) => {
          const state = get();
          const audit = state.audits[auditId];
          if (!audit) return "";

          const newPageId = crypto.randomUUID();
          let newPage: ReportPage;

          if (templateId && state.pageTemplates[templateId]) {
            // Clone from template
            newPage = JSON.parse(JSON.stringify(state.pageTemplates[templateId]));
            newPage.id = newPageId;
            newPage.blocks = newPage.blocks?.map((b: any) => ({
              ...b,
              id: crypto.randomUUID()
            })) || [];
          } else {
            // Blank page
            newPage = {
              id: newPageId,
              title: "New Page",
              blocks: []
            };
          }

          const currentPages = audit.pages || [];
          // Insert before conclusion and thank you if they exist, otherwise at the end
          let insertIndex = currentPages.length;
          const conclusionIdx = currentPages.findIndex((p: ReportPage) => p.id === 'conclusion');
          const thankYouIdx = currentPages.findIndex((p: ReportPage) => p.id === 'thank-you');
          
          if (conclusionIdx !== -1) insertIndex = conclusionIdx;
          else if (thankYouIdx !== -1) insertIndex = thankYouIdx;

          const newPages = [...currentPages];
          newPages.splice(insertIndex, 0, newPage);

          set({
            audits: {
              ...state.audits,
              [auditId]: {
                ...audit,
                pages: newPages,
                updatedAt: new Date().toISOString()
              }
            }
          });

          return newPageId;
        },

        createAudit: (auditData: Omit<Audit, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          
          set((state: AppState) => ({
            audits: {
              ...state.audits,
              [id]: {
                ...auditData,
                id,
                status: 'Draft',
                reportStructure: {},
                pages: createDefaultPages(),
                createdAt: now,
                updatedAt: now,
              }
            },
            activeAuditId: id
          }));
          
          return id;
        },

        updateAudit: (id: string, updates: Partial<Audit>) => set((state: AppState) => ({
          audits: {
            ...state.audits,
            [id]: {
              ...state.audits[id],
              ...updates,
              updatedAt: new Date().toISOString()
            }
          }
        })),

        setActiveAudit: (id: string) => set({ activeAuditId: id }),

        updateReportStructure: (auditId: string, updates: Partial<NonNullable<Audit["reportStructure"]>>) => set((state: AppState) => {
          const audit = state.audits[auditId];
          if (!audit) return state;
          return {
            audits: {
              ...state.audits,
              [auditId]: {
                ...audit,
                reportStructure: {
                  ...audit.reportStructure,
                  ...updates
                },
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),

        updatePages: (auditId: string, pages: ReportPage[]) => set((state: AppState) => {
          const audit = state.audits[auditId];
          if (!audit) return state;
          return {
            audits: {
              ...state.audits,
              [auditId]: {
                ...audit,
                pages,
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),

        updatePageAnnotations: (auditId: string, pageId: string, annotations: Annotation[]) => set((state: AppState) => {
          const audit = state.audits[auditId];
          if (!audit || !audit.pages) return state;
          return {
            audits: {
              ...state.audits,
              [auditId]: {
                ...audit,
                pages: audit.pages.map(p => p.id === pageId ? { ...p, annotations } : p),
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),

        addFinding: (auditId: string, findingData: Omit<Finding, 'id' | 'createdAt' | 'updatedAt' | 'auditId' | 'status' | 'order'>) => {
          const id = crypto.randomUUID();
          const now = new Date().toISOString();
          
          set((state: AppState) => {
            // Get current order count for this audit
            const order = Object.values(state.findings).filter((f: Finding) => f.auditId === auditId).length;
            
            return {
              findings: {
                ...state.findings,
                [id]: {
                  ...findingData,
                  id,
                  auditId,
                  status: 'Draft',
                  order,
                  createdAt: now,
                  updatedAt: now,
                }
              }
            };
          });
          
          return id;
        },

        updateFinding: (id: string, updates: Partial<Finding>) => set((state: AppState) => {
          const currentFinding = state.findings[id];
          if (!currentFinding) return state;

          const merged = { ...currentFinding, ...updates };

          // Automatically sync polishedTitle with title updates
          if (updates.title !== undefined) {
            merged.polishedTitle = updates.title;
          }

          // Automatically clear polishedBody on rawNotes updates so rawNotes takes precedence on the canvas
          if (updates.rawNotes !== undefined) {
            merged.polishedBody = "";
          }

          return {
            findings: {
              ...state.findings,
              [id]: {
                ...merged,
                updatedAt: new Date().toISOString()
              }
            }
          };
        }),

        removeFinding: (id: string) => set((state: AppState) => {
          const newFindings = { ...state.findings };
          delete newFindings[id];
          return { 
            findings: newFindings,
            deletedFindingIds: Array.from(new Set([...(state.deletedFindingIds || []), id]))
          };
        }),

        deleteAudit: (id: string) => set((state: AppState) => {
          if (state.currentUser?.role !== 'admin') {
            alert("Only an admin can delete audits.");
            return state;
          }
          const newAudits = { ...state.audits };
          delete newAudits[id];
          
          // Also clean up associated findings
          const newFindings = { ...state.findings };
          const deletedFindings: string[] = [];
          Object.keys(newFindings).forEach(findingId => {
            if (newFindings[findingId].auditId === id) {
              deletedFindings.push(findingId);
              delete newFindings[findingId];
            }
          });
          
          return { 
            audits: newAudits, 
            findings: newFindings,
            activeAuditId: state.activeAuditId === id ? null : state.activeAuditId,
            deletedAuditIds: Array.from(new Set([...(state.deletedAuditIds || []), id])),
            deletedFindingIds: Array.from(new Set([...(state.deletedFindingIds || []), ...deletedFindings]))
          };
        }),

        loadValtirTemplate: () => set((state: AppState) => ({
          audits: {
            ...state.audits,
            [valtirAudit.id]: valtirAudit
          },
          findings: {
            ...state.findings,
            ...Object.values(valtirFindings).reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, Finding>)
          }
        })),

        loadEverestTemplate: () => set((state: AppState) => ({
          audits: {
            ...state.audits,
            [everestAudit.id]: everestAudit
          },
          findings: {
            ...state.findings,
            ...everestFindings.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, Finding>)
          }
        })),

        cloneAudit: (id: string) => {
          const state = get();
          const sourceAudit = state.audits[id];
          if (!sourceAudit) return null;

          const newAuditId = crypto.randomUUID();
          const now = new Date().toISOString();

          // Deep copy the audit but reset metadata
          const clonedAudit: Audit = {
            ...JSON.parse(JSON.stringify(sourceAudit)),
            id: newAuditId,
            companyName: `${sourceAudit.companyName} (Copy)`,
            status: 'Draft',
            createdAt: now,
            updatedAt: now,
          };

          // Clone all findings associated with this audit
          const newFindings: Record<string, Finding> = {};
          Object.values(state.findings)
            .filter((f: any) => f.auditId === id)
            .forEach(f => {
              const newFindingId = crypto.randomUUID();
              newFindings[newFindingId] = {
                ...JSON.parse(JSON.stringify(f)),
                id: newFindingId,
                auditId: newAuditId,
                createdAt: now,
                updatedAt: now,
              };
            });

          set((state: AppState) => ({
            audits: {
              ...state.audits,
              [newAuditId]: clonedAudit
            },
            findings: {
              ...state.findings,
              ...newFindings
            },
            activeAuditId: newAuditId
          }));

          return newAuditId;
        }
      };
    },
    {
      name: 'audit-builder-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => supabaseStorage),
      partialize: (state) => ({ 
        audits: state.audits, 
        findings: state.findings, 
        pageTemplates: state.pageTemplates,
        users: state.users,
        currentUser: state.currentUser,
        deletedAuditIds: state.deletedAuditIds,
        deletedTemplateIds: state.deletedTemplateIds,
        deletedFindingIds: state.deletedFindingIds,
        deletedUsernames: state.deletedUsernames || [],
        lastUpdated: Date.now()
      }),
      merge: (persistedState: any, currentState: any) => {
        // Extract default pages to preload into pageTemplates
        const defaultPages = createDefaultPages();
        const defaultTemplates = defaultPages.filter(p => 
          ['seo-onboarding', 'recommended-setup', 'recommended-monthly', 'paid-search'].includes(p.id)
        ).reduce((acc, page) => {
          const clone = JSON.parse(JSON.stringify(page));
          clone.id = `default-tpl-${page.id}`;
          // Make sure blocks get new IDs so they don't share ref with the default page
          clone.blocks = clone.blocks.map((b: any) => ({ ...b, id: crypto.randomUUID() }));
          acc[clone.id] = clone;
          return acc;
        }, {} as Record<string, ReportPage>);

        const hasPersistedData = persistedState && persistedState.audits && Object.keys(persistedState.audits).length > 0;
        
        const mergedUsers = {
          ...initialUsers,
          ...(persistedState?.users || {})
        };
        const deletedUsernames = persistedState?.deletedUsernames || [];
        deletedUsernames.forEach((username: string) => {
          delete mergedUsers[username];
        });

        let finalCurrentUser = persistedState?.currentUser || null;
        if (typeof window !== 'undefined') {
          try {
            const sessionStr = window.localStorage.getItem('audit-session');
            if (sessionStr) {
              finalCurrentUser = JSON.parse(sessionStr);
            }
          } catch(e) {}
        }

        if (!hasPersistedData) {
           const initialAudits = { 
             [valtirAudit.id]: valtirAudit,
             [everestAudit.id]: everestAudit
           };
           const initialFindings = {
             ...Object.values(valtirFindings).reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, Finding>),
             ...everestFindings.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, Finding>)
           };

           // Migrate initial audits & findings to ensure basepath mapping
           Object.keys(initialAudits).forEach(id => {
             initialAudits[id] = migrateAudit(initialAudits[id]);
           });
           Object.keys(initialFindings).forEach(id => {
             initialFindings[id] = migrateFinding(initialFindings[id]);
           });

           return {
             ...currentState,
             users: mergedUsers,
             currentUser: finalCurrentUser,
             hasHydrated: true,
             audits: initialAudits,
             findings: initialFindings,
             pageTemplates: defaultTemplates
           };
        }

        const mergedAudits = {
          [valtirAudit.id]: valtirAudit,
          [everestAudit.id]: everestAudit,
          ...(persistedState?.audits || {})
        };

        // Data migration: ensure legacy data stored under prospectName is mapped to companyName
        Object.values(mergedAudits).forEach((audit: any) => {
          if (audit.prospectName && !audit.companyName) {
            audit.companyName = audit.prospectName;
            delete audit.prospectName;
          }
        });

        const mergedFindings = {
          ...Object.values(valtirFindings).reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, Finding>),
          ...everestFindings.reduce((acc, curr) => { acc[curr.id] = curr; return acc; }, {} as Record<string, Finding>),
          ...(persistedState?.findings || {})
        };

        // Migrate all merged audits and findings to support the new base path context
        Object.keys(mergedAudits).forEach(id => {
          mergedAudits[id] = migrateAudit(mergedAudits[id]);
        });
        Object.keys(mergedFindings).forEach(id => {
          mergedFindings[id] = migrateFinding(mergedFindings[id]);
        });

        return {
          ...currentState,
          ...persistedState,
          users: mergedUsers,
          currentUser: finalCurrentUser,
          hasHydrated: true,
          audits: mergedAudits,
          findings: mergedFindings,
          pageTemplates: {
            ...defaultTemplates,
            ...(persistedState?.pageTemplates || {})
          }
        };
      }
    }
  )
);
