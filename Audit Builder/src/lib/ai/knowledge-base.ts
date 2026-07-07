export interface StandardFinding {
  topic: string;
  keywords: string[];
  stage: string;
  category: string;
  legacyExampleTitle: string;
  legacyExampleExplanation: string;
}

export const KNOWLEDGE_BASE: StandardFinding[] = [
  {
    topic: "Title Tags",
    keywords: ["title tag", "titles", "page title", "missing title", "duplicate title"],
    stage: "Discovery",
    category: "Technical SEO",
    legacyExampleTitle: "Weak Title Tag Strategy Limiting Search Performance",
    legacyExampleExplanation: "Title tags across the site do not effectively target high-intent keywords. Title tags are one of the strongest ranking signals and directly influence click-through rates. Getting titles and headers right is foundational, because they set expectations for both users and search engines before any content is read. Without them, the brand is less visible and less compelling in search results."
  },
  {
    topic: "URL Structure",
    keywords: ["url", "urls", "hierarchy", "slug", "directory"],
    stage: "Discovery",
    category: "Technical SEO",
    legacyExampleTitle: "Disjointed URL Structure Breaking Site Hierarchy",
    legacyExampleExplanation: "The current URLs do not follow a clear parent-child structure. Pages sit in separate directories instead of being properly nested, breaking logical hierarchy and making it harder for search engines to understand how pages relate to one another. This ultimately limits discoverability."
  },
  {
    "topic": "Index Bloat and Duplicate Content",
    "keywords": [
      "index",
      "bloat",
      "duplicate",
      "content"
    ],
    "stage": "Discovery",
    "category": "Technical SEO",
    "legacyExampleTitle": "Index Bloat and Duplicate Content",
    "legacyExampleExplanation": "Large volumes of low-value, duplicate, or irrelevant pages are currently being indexed by search engines. Dilutes domain authority, wastes crawl budget, and creates ranking confusion. Implement 301 redirects, clean up sitemaps, and use canonical tags to consolidate authority."
  },
  {
    "topic": "Site Speed and Latency",
    "keywords": [
      "speed",
      "latency",
      "slow",
      "performance"
    ],
    "stage": "Discovery",
    "category": "Technical SEO",
    "legacyExampleTitle": "Site Speed and Latency",
    "legacyExampleExplanation": "Unoptimized images and heavy scripts are causing critical latency, particularly on mobile devices. Reduces user experience and negatively impacts mobile-first ranking signals. Compress media assets, remove redundant code, and optimize loading sequences."
  },
  {
    "topic": "Invalid Redirect Chains",
    "keywords": [
      "invalid",
      "redirect",
      "chains",
      "302"
    ],
    "stage": "Discovery",
    "category": "Technical SEO",
    "legacyExampleTitle": "Invalid Redirect Chains",
    "legacyExampleExplanation": "Internal links are passing through multiple redirects or 302 temporary redirects rather than clean 301s. Strips link equity and forces search engine spiders through unnecessary hops. Update all redirect paths to single 301-permanent redirects."
  },
  {
    "topic": "Broken Internal/External Links",
    "keywords": [
      "broken",
      "404",
      "dead link"
    ],
    "stage": "Discovery",
    "category": "Technical SEO",
    "legacyExampleTitle": "Broken Internal/External Links",
    "legacyExampleExplanation": "Numerous 404 errors and broken internal links exist across the site structure. Creates a poor user experience, increases bounce rates, and signals neglect to crawlers. Conduct a deep site crawl to identify and fix all broken paths."
  },
  {
    "topic": "Friction in Lead Forms",
    "keywords": [
      "friction",
      "lead",
      "forms",
      "contact form"
    ],
    "stage": "Conversion",
    "category": "CRO",
    "legacyExampleTitle": "Friction in Lead Forms",
    "legacyExampleExplanation": "Contact and lead forms contain an excessive number of mandatory fields, discouraging completion. Significantly decreases form fill rates and lead volume. Reduce mandatory fields and implement value statements to incentivize conversion."
  },
  {
    "topic": "Lack of Conversion Tracking",
    "keywords": [
      "conversion tracking",
      "analytics",
      "goals"
    ],
    "stage": "Conversion",
    "category": "CRO",
    "legacyExampleTitle": "Lack of Conversion Tracking",
    "legacyExampleExplanation": "Key user interactions like 'Contact Us' or 'Quote Request' buttons lack granular tracking. Makes it impossible to measure ROI or identify bottlenecks in the funnel. Implement Google Tag Manager to track all high-value button clicks and goal completions."
  },
  {
    "topic": "Weak Call to Action (CTA) Placement",
    "keywords": [
      "cta",
      "call to action",
      "placement"
    ],
    "stage": "Conversion",
    "category": "CRO",
    "legacyExampleTitle": "Weak Call to Action (CTA) Placement",
    "legacyExampleExplanation": "Primary conversion points are buried below the fold or lack persuasive messaging. Users are not guided toward the next step in the buyer journey. Optimize above-the-fold content to include clear, high-contrast CTAs and value propositions."
  },
  {
    "topic": "Unoptimized 404 Experience",
    "keywords": [
      "404 page",
      "not found",
      "error page"
    ],
    "stage": "Conversion",
    "category": "CRO",
    "legacyExampleTitle": "Unoptimized 404 Experience",
    "legacyExampleExplanation": "The site serves a generic 404 page that offers no guidance or next steps. Converts potential leads into bounced users. Revamp the 404 page to include site search, top resources, and high-value landing page links."
  },
  {
    "topic": "Brand Hijacking in Paid Search",
    "keywords": [
      "hijacking",
      "paid search",
      "bidding"
    ],
    "stage": "Brand and Trust Risks",
    "category": "Brand Trust",
    "legacyExampleTitle": "Brand Hijacking in Paid Search",
    "legacyExampleExplanation": "Competitors or third-party dealers are bidding on branded terms and controlling the first impression. Increases acquisition costs and diverts traffic to alternative products. Launch aggressive brand protection campaigns to ensure the official site is the primary result."
  },
  {
    "topic": "Outdated or Inconsistent Brand Messaging",
    "keywords": [
      "outdated",
      "inconsistent",
      "brand messaging"
    ],
    "stage": "Brand and Trust Risks",
    "category": "Brand Trust",
    "legacyExampleTitle": "Outdated or Inconsistent Brand Messaging",
    "legacyExampleExplanation": "External listings and internal pages reference outdated company names or conflicting identities. Erodes user confidence and complicates brand recognition. Audit and standardize all off-site citations and on-site brand references."
  },
  {
    "topic": "Unmanaged Online Reputation",
    "keywords": [
      "reputation",
      "reviews",
      "negative feedback"
    ],
    "stage": "Brand and Trust Risks",
    "category": "Brand Trust",
    "legacyExampleTitle": "Unmanaged Online Reputation",
    "legacyExampleExplanation": "Public reviews are left unaddressed, particularly negative feedback. Signals a lack of customer focus and harms brand sentiment. Establish a structured process for prompt, professional review responses."
  },
  {
    "topic": "Weak Semantic Markup/Rich Snippets",
    "keywords": [
      "schema",
      "markup",
      "rich snippets",
      "structured data"
    ],
    "stage": "Brand and Trust Risks",
    "category": "Brand Trust",
    "legacyExampleTitle": "Weak Semantic Markup/Rich Snippets",
    "legacyExampleExplanation": "Absence of review or product markup in search results. Prevents the brand from standing out visually against competitors in search results. Implement Schema markup to enable star ratings and product information in SERPs."
  },
  {
    "topic": "Keyword Cannibalization",
    "keywords": ["keyword cannibalization", "rank competition", "SERP dilution", "query conflict", "internal competition"],
    "stage": "Discovery",
    "category": "Technical SEO",
    "legacyExampleTitle": "Strategic Dilution: Competitive Internal SERP Cannibalization",
    "legacyExampleExplanation": "Our analysis reveals multiple high-value intent keywords are currently being contested by several competing pages within your domain. This fragmentation prevents the search engine from designating a single 'authoritative' URL, effectively suppressing your maximum potential visibility and diluting page-level equity.\n\nTo restore optimal search performance, we recommend a consolidated architecture approach. By implementing 301 redirects and strategic canonicalization, we can aggregate this dispersed authority into single, high-performing hubs, thereby increasing the probability of reclaiming top-three SERP positioning."
  },
  {
    "topic": "Conversion Friction",
    "keywords": ["conversion rate optimization", "friction points", "checkout flow", "user experience", "conversion funnel"],
    "stage": "Conversion",
    "category": "CRO",
    "legacyExampleTitle": "Inherent Funnel Friction: Barriers to Transactional Completion",
    "legacyExampleExplanation": "The current checkout architecture introduces unnecessary friction points that impede the user journey at critical decision-making stages. Specifically, excessive form fields and non-performant modal interactions are forcing premature abandonment, negatively impacting your ROAS and bottom-line revenue.\n\nWe propose an immediate restructuring of the primary conversion path to prioritize clarity and speed. By streamlining inputs and neutralizing intrusive UI elements, we will reduce the cognitive load on the user, directly translating into a measurable uplift in site-wide conversion velocity."
  },
  {
    "topic": "Mobile Navigation UX",
    "keywords": ["mobile optimization", "UX design", "navigation accessibility", "mobile-first indexing", "responsive friction"],
    "stage": "Technical SEO",
    "category": "CRO",
    "legacyExampleTitle": "Mobile-First Impediments: Navigational Complexity",
    "legacyExampleExplanation": "While your desktop experience provides robust navigation, the mobile implementation suffers from compromised information architecture. The deep-nesting of categories results in increased bounce rates among mobile-first users, signaling a negative UX signal to search engines that can suppress rankings.\n\nSimplifying the mobile interaction model is essential to ensure that your site aligns with Google’s mobile-first indexing standards. Our objective is to create a seamless, thumb-friendly navigation structure that promotes rapid path-to-purchase and improves dwell time."
  },
  {
    "topic": "Content Authority",
    "keywords": ["topical authority", "content gap", "E-E-A-T", "brand trust", "semantic search"],
    "stage": "Consideration",
    "category": "Brand Trust",
    "legacyExampleTitle": "Topical Authority Deficit: Gap in Search Relevance",
    "legacyExampleExplanation": "Current content outputs lack the depth required to establish strong topical authority within your specific niche. Without comprehensive coverage of long-tail semantic queries, the site fails to fulfill the 'Expertise' requirement essential for maintaining competitive visibility against high-authority challengers.\n\nWe recommend a strategic content expansion initiative that maps core pillars to user intent. By filling these semantic gaps, we move beyond superficial ranking to capture the full breadth of the market's search intent, establishing your domain as the primary industry authority."
  },
  {
    "topic": "Search Intent Alignment",
    "keywords": ["search intent", "SERP features", "query mismatch", "transactional intent", "informational search"],
    "stage": "Discovery",
    "category": "SEM",
    "legacyExampleTitle": "Intent Mismatch: Discrepancy Between Query and Landing Page",
    "legacyExampleExplanation": "A significant portion of current landing pages are failing to align with the underlying search intent of the keywords they are targeting. High-intent 'transactional' queries are currently being funneled into 'informational' pages, resulting in a severe mismatch that kills conversion rates and signals low relevance to search algorithms.\n\nRealigning these keywords with purpose-built landing pages is mandatory for scale. This adjustment ensures that search engine users are met with the specific solutions they are looking for, directly improving bounce metrics and enhancing your domain's relevance score."
  },
  {
    "topic": "Technical Performance",
    "keywords": ["core web vitals", "site speed", "latency", "technical debt", "page load times"],
    "stage": "Technical SEO",
    "category": "Technical SEO",
    "legacyExampleTitle": "Technical Debt: Latency and Core Web Vitals",
    "legacyExampleExplanation": "Persistent issues with Core Web Vitals—specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)—are currently acting as a ceiling on your organic performance. Slow site latency is not merely a user experience annoyance; it is a primary ranking factor that is preventing your site from gaining traction in high-competition SERPs.\n\nWe will undertake a technical audit to eliminate script bloat and prioritize asynchronous loading. Modernizing these technical underpinnings will create a performant baseline that supports sustainable growth and improves the baseline quality score of all site assets."
  },
  {
    "topic": "Trust Signal Optimization",
    "keywords": ["social proof", "brand authority", "conversion signals", "customer testimonials", "trust indicators"],
    "stage": "Brand Trust",
    "category": "Brand Trust",
    "legacyExampleTitle": "Absence of Social Proof: Eroding Brand Credibility",
    "legacyExampleExplanation": "At the decision stage of the customer journey, your landing pages lack the requisite trust signals to overcome user skepticism. The current layout omits key social proof elements like verified testimonials and authority certifications, causing potential leads to exit in favor of more 'established' competitors.\n\nIntegrating prominent, context-aware trust indicators is critical to increasing lead velocity. By strategically placing validated trust signals in the user's path, we transform skeptical visitors into confident prospects, effectively shielding your brand from competitive leakage."
  },
  {
    "topic": "Information Architecture",
    "keywords": ["site structure", "crawlability", "internal linking", "URL hierarchy", "bot navigation"],
    "stage": "Technical SEO",
    "category": "Technical SEO",
    "legacyExampleTitle": "Architectural Fragmentation: Hindering Crawler Efficiency",
    "legacyExampleExplanation": "The current site architecture relies on a flat, non-hierarchical structure that makes it difficult for search engine spiders to map the relationship between core pillars and supporting content. This lack of logical structure limits your ability to pass page-level equity effectively, preventing long-tail keywords from ranking.\n\nWe propose a siloing strategy that enforces clear thematic hierarchies. Through optimized internal linking and a refined URL architecture, we will provide search crawlers with a roadmap that clearly defines the topical depth of your domain, thereby boosting crawl budget efficiency and organic visibility."
  }
];

/**
 * Basic semantic matching for the MVP.
 * In the future, this can be replaced with a vector DB lookup.
 */
export function retrieveRelevantKnowledge(rawNotes: string): StandardFinding | null {
  const lowercaseNotes = rawNotes.toLowerCase();
  
  for (const finding of KNOWLEDGE_BASE) {
    if (finding.keywords.some(kw => lowercaseNotes.includes(kw))) {
      return finding;
    }
  }
  
  return null;
}
