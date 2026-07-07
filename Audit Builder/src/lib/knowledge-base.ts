export const METAMEND_KNOWLEDGE_BASE = {
  executiveToneExamples: [
    "<p><strong>Creating the Right Conditions for Growth</strong></p><p>Across the entire decision-making journey, touchpoints that should build confidence are instead introducing friction and uncertainty. By addressing the foundational gaps and opportunities outlined in this audit, we can move from passive visibility to proactive market leadership.</p><p>Addressing both the technical barriers and conversion friction will improve current performance while enabling more efficient, scalable growth across channels.</p>",
    "<p><strong>Why Growth Stalled While the Market Rebounded</strong></p><p>Search volume for destination travel has surged to nearly pre-pandemic levels; yet, for your organization, that rising tide did not lift the boat. The findings in this audit showcase that while demand is returning, your digital share remains conservative. The audience is actively searching for the experience you provide, but right now, they simply aren't finding you.</p><p>This audit categorizes the friction points holding you back, and the opportunities waiting to be claimed across three distinct phases of the user journey: Discovery, Consideration, and Conversion.</p>",
    "<p><strong>Reclaiming Market Leadership</strong></p><p>You’ve built a respected name, but online visibility tells a different story: one where competitors are stepping up and taking ownership of crucial touchpoints. Right now, others are leading the search conversation simply because they are present where you are not.</p><p>This is not just about fixing technical issues; it is about reclaiming your market leadership. By closing these gaps, you can shift from passive to proactive, reasserting yourself as the brand customers find first, trust most, and ultimately choose.</p>"
  ],
  findingArchetypes: {
    "Technical SEO": [
      {
        title: "Index Bloat and Duplicate Content",
        summary: "Large volumes of low-value, duplicate, or irrelevant pages are currently being indexed by search engines.",
        impact: "Dilutes domain authority, wastes crawl budget, and creates ranking confusion.",
        recommendation: "Implement 301 redirects, clean up sitemaps, and use canonical tags to consolidate authority."
      },
      {
        title: "Site Speed and Latency",
        summary: "Unoptimized images and heavy scripts are causing critical latency, particularly on mobile devices.",
        impact: "Reduces user experience and negatively impacts mobile-first ranking signals.",
        recommendation: "Compress media assets, remove redundant code, and optimize loading sequences."
      },
      {
        title: "Invalid Redirect Chains",
        summary: "Internal links are passing through multiple redirects or 302 temporary redirects rather than clean 301s.",
        impact: "Strips link equity and forces search engine spiders through unnecessary hops.",
        recommendation: "Update all redirect paths to single 301-permanent redirects."
      },
      {
        title: "Broken Internal/External Links",
        summary: "Numerous 404 errors and broken internal links exist across the site structure.",
        impact: "Creates a poor user experience, increases bounce rates, and signals neglect to crawlers.",
        recommendation: "Conduct a deep site crawl to identify and fix all broken paths."
      }
    ],
    "CRO": [
      {
        title: "Friction in Lead Forms",
        summary: "Contact and lead forms contain an excessive number of mandatory fields, discouraging completion.",
        impact: "Significantly decreases form fill rates and lead volume.",
        recommendation: "Reduce mandatory fields and implement value statements to incentivize conversion."
      },
      {
        title: "Lack of Conversion Tracking",
        summary: "Key user interactions like 'Contact Us' or 'Quote Request' buttons lack granular tracking.",
        impact: "Makes it impossible to measure ROI or identify bottlenecks in the funnel.",
        recommendation: "Implement Google Tag Manager to track all high-value button clicks and goal completions."
      },
      {
        title: "Weak Call to Action (CTA) Placement",
        summary: "Primary conversion points are buried below the fold or lack persuasive messaging.",
        impact: "Users are not guided toward the next step in the buyer journey.",
        recommendation: "Optimize above-the-fold content to include clear, high-contrast CTAs and value propositions."
      },
      {
        title: "Unoptimized 404 Experience",
        summary: "The site serves a generic 404 page that offers no guidance or next steps.",
        impact: "Converts potential leads into bounced users.",
        recommendation: "Revamp the 404 page to include site search, top resources, and high-value landing page links."
      }
    ],
    "Brand Trust": [
      {
        title: "Brand Hijacking in Paid Search",
        summary: "Competitors or third-party dealers are bidding on branded terms and controlling the first impression.",
        impact: "Increases acquisition costs and diverts traffic to alternative products.",
        recommendation: "Launch aggressive brand protection campaigns to ensure the official site is the primary result."
      },
      {
        title: "Outdated or Inconsistent Brand Messaging",
        summary: "External listings and internal pages reference outdated company names or conflicting identities.",
        impact: "Erodes user confidence and complicates brand recognition.",
        recommendation: "Audit and standardize all off-site citations and on-site brand references."
      },
      {
        title: "Unmanaged Online Reputation",
        summary: "Public reviews are left unaddressed, particularly negative feedback.",
        impact: "Signals a lack of customer focus and harms brand sentiment.",
        recommendation: "Establish a structured process for prompt, professional review responses."
      },
      {
        title: "Weak Semantic Markup/Rich Snippets",
        summary: "Absence of review or product markup in search results.",
        impact: "Prevents the brand from standing out visually against competitors in search results.",
        recommendation: "Implement Schema markup to enable star ratings and product information in SERPs."
      }
    ]
  }
};
