import { Audit, Finding, createDefaultPages } from '../store';

export const everestAuditId = "audit-everest-final";

export const everestAudit: Audit = {
  id: everestAuditId,
  companyName: "Everest Formulations",
  status: "Approved",
  industry: "Digital Marketing",
  primaryService: "SEO",
  preparedBy: "Valtir",
  date: new Date().toISOString(),
  websiteUrl: "https://www.everestformulations.com",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isTemplate: true,
  reportStructure: {
    customStages: [
      "Competitive Benchmarking",
      "Branded Keywords",
      "Competitor Ads",
      "Keyword Targeting",
      "Brand and Trust Risks",
      "Discovery",
      "Consideration",
      "Conversion",
      "Loyalty"
    ],
    stageConfigs: {
      "Competitive Benchmarking": {
        heading: "Competitive Benchmarking",
        caption: "Where You're a Follower Instead of a Leader"
      },
      "Branded Keywords": {
        heading: "Branded Keywords",
        caption: "Your Brand, Their Clicks"
      },
      "Competitor Ads": {
        heading: "Competitor Ads",
        caption: "Where They're Bidding"
      },
      "Keyword Targeting": {
        heading: "Keyword Targeting",
        caption: "Aligning with Buyer Intent"
      },
      "Brand and Trust Risks": {
        heading: "Brand and Trust Risks",
        caption: "What happens when users do reach Everest?"
      },
      "Discovery": {
        heading: "Discovery",
        caption: "An Unclear Story"
      },
      "Consideration": {
        heading: "Consideration",
        caption: "Trust Left Up to Chance"
      },
      "Conversion": {
        heading: "Conversion",
        caption: "Friction Interrupting Path to Action"
      },
      "Loyalty": {
        heading: "Loyalty",
        caption: "Missing Follow-Through"
      }
    }
  },
  pages: createDefaultPages().map(page => {
    if (page.id === 'executive-summary') {
      return {
        ...page,
        blocks: page.blocks.map(block => {
          if (block.type === 'RichText') {
            return {
              ...block,
              data: {
                ...block.data,
                html: `<p>Everest Formulations operates in a highly competitive, high-growth, and high-trust space. We don’t need to tell you how critical search visibility and user experience are in shaping purchasing decisions — you already know that, and you’ve built your business on the principles of credibility, consistency, and access. That said, even for a business as developed and technologically embedded as yours, certain nuances can go unnoticed. Our perspective, shaped by decades navigating consumer demand and the ever-evolving digital landscape, allows us to spot these blind spots.</p><p>Our goal is simple: to identify where your digital presence may not yet reflect the strength of your brand, and where overlooked opportunities exist to sharpen your competitive edge.</p><p>In short, we’re not here to replace — we’re here to complement. The following findings and recommendations are positioned to help Everest capture more of what you’ve already worked hard to build.</p>`
              }
            };
          }
          return block;
        })
      };
    }
    
    if (page.id === 'conclusion') {
      return {
        ...page,
        blocks: page.blocks.map(block => {
          if (block.type === 'RichText') {
            return {
              ...block,
              data: {
                ...block.data,
                html: `<p>Everest Formulations has earned its position in a high-growth, high-trust industry. But in today’s landscape, that offline strength is not translating online where critical first impressions are being formed. This audit reveals a simple truth: while past efforts laid the foundation, they’ve stopped short of what’s needed to compete and lead in the current market.</p><p>Competitors have already stepped into this gap. They are claiming visibility Everest should own — showing up in branded and non-branded searches, leveraging product markup, and actively shaping buyer perception through paid and organic channels.</p><p>Meanwhile, Everest’s current digital signals are working against its own credibility. Poor review visibility, brand confusion, broken user paths, slow site speed, and missing on-page elements all create silent friction. Ultimately, not just harming rankings and traffic, but shaking buyer confidence at every stage from discovery to conversion.</p><p>This is not just about fixing technical issues: it’s about reclaiming market leadership.</p><ul><li>The search demand is there.</li><li>The competition is already capitalizing.</li><li>The gaps are clear and fixable.</li></ul><p>By closing these gaps, Everest can shift from passive to proactive. Not only protecting its brand, but reasserting itself as the leader customers find first, trust most, and ultimately choose. The path forward is simple: elevate, don’t replace. Where the previous approach focused on baseline presence, it is time for Everest to adopt a strategy that reflects its ambition: one built for visibility, for trust, and for growth.</p>`
              }
            };
          }
          return block;
        })
      };
    }
    
    return {
      ...page,
      blocks: page.blocks.map(block => {
        if (block.type === 'RichText' && block.data.html) {
          return {
            ...block,
            data: {
              ...block.data,
              html: block.data.html.replace(/Sealeze's/g, "Everest Formulations'").replace(/Sealeze/g, "Everest Formulations")
            }
          };
        }
        return block;
      })
    };
  })
};

let findingCounter = 1;
const genId = () => `everest-final-finding-${findingCounter++}`;

export const everestFindings: Finding[] = [
  {
    id: genId(),
    auditId: everestAuditId,
    title: "Google Ad campaigns have been inactive since 2023, a key missed opportunity",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "High",
    rawNotes: "Everest Formulations has built a respected name, but online visibility tells a different story: one where competitors are stepping up and taking ownership of crucial touchpoints. Right now, others are leading the search conversation — simply because they’re present where Everest is not.",
    imageUrl: "/audits/images/everest_new/image5.png",
    layoutType: "legacy-box-left",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "Visibility gaps have quietly started to accumulate",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Today, Everest Formulations’ top organic competitors include companies that share the 'Everest' name. In a space crowded with variations of this identity, visibility gaps have quietly started to accumulate — leaving room for others to fill.",
    imageUrl: "/audits/images/everest_new/image6.png",
    layoutType: "legacy-box-top",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "'Everest Formulations' returns your site, but related brand searches like 'Everest Packaging' appear first.",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "High",
    rawNotes: "Your brand should be the first and clearest option when customers search for you, but right now, it’s not.",
    imageUrl: "/audits/images/everest_new/image7.png",
    layoutType: "image-left",
    boxColor: "light",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "01 Contract Packaging",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "High",
    rawNotes: "In broad, industry-defining searches like 'Contract Packaging', competitors are consistently running ads, with new ones appearing every time.",
    imageUrl: "/audits/images/everest_new/image8.png",
    layoutType: "image-left",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "02 Nutraceutical Contract Packaging",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "High",
    rawNotes: "In more specific, high-intent searches like 'Nutraceutical Contract Packaging', competition slightly thins but still exists. These are highly valuable because they speak directly to Everest’s service offerings.",
    imageUrl: "/audits/images/everest_new/image9.png",
    layoutType: "legacy-box-right",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "Aligning with Buyer Intent",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Beyond competitors showing up in key spaces, there’s another issue at play: Everest isn’t fully aligned with how buyers actually search for solutions like yours. While broad terms may offer brand awareness, the most valuable users — those who are actively problem-solving and ready to act, are searching more specifically. One such example: “Kitting & Assembly”, where Everest’s current site and strategy do not sufficiently target or capture this demand. Long-tail keywords may be low volume, but they signal high intent. At this stage, buyers aren’t browsing — they’re choosing. And without Everest present, competitors gladly step in.",
    imageUrl: "/audits/images/everest_new/image10.png",
    layoutType: "legacy-box-bottom",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "01 Outdated references to 'Everest Packaging'",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Outdated references to 'Everest Packaging' create confusion about whether they’ve reached the right company.",
    imageUrl: "/audits/images/everest_new/image11.png",
    layoutType: "legacy-box-top",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "02 K1-related listings blur the brand identity",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "K1-related listings blur the brand identity, raising questions about specialization and ownership. For a first-time visitor, the question becomes: Is this the right company? Are they current? Are they specialized for my needs? At this early, pivotal stage, confusion creates hesitation — and often, cost you opportunities before meaningful engagement ever begins.",
    imageUrl: "/audits/images/everest_new/image12.png",
    layoutType: "image-left",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "01 Negative reviews are highly visible and unaddressed",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "High",
    rawNotes: "A buyer continuing deeper into the funnel seeks validation and confidence, yet Everest’s online reputation introduces new risks. When potential clients see poor feedback with no public response, it signals that issues are not a priority. 60% of consumers say negative reviews have made them decide not to use a business.",
    imageUrl: "/audits/images/everest_new/image13.png",
    layoutType: "legacy-box-left",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "02 Critically slow mobile site speed",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Slow-loading is proven to be a critical deterrent for users. For every additional second of page load time between 0 and 5 seconds, website conversion rates drop by an average of 4.42%.",
    imageUrl: "/audits/images/everest_new/image14.png",
    layoutType: "legacy-box-right",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "03 Lack of product markup leaves visibility and clicks on the table",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Product review markups are one of the only elements that visually stand out in search results, drawing the eye and signaling trust. Without it, Everest’s listings miss the chance to visually differentiate, making it easier for companys to scroll past and harder to win clicks in crucial decision moments.",
    imageUrl: "/audits/images/everest_new/image15.png",
    imageUrls: ["/audits/images/everest_new/image15.png", "/audits/images/everest_new/image16.png"],
    layoutType: "gallery",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "01 Generic 404 pages quietly push users away",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Even for those ready to engage, Everest’s site experience makes the next step harder than it should be. Right now, when visitors hit missing pages, they’re met with unclear redirects and no helpful path forward. This creates confusion, breaks the flow of their journey, and increases the chance they leave entirely. A custom 404 page with links to key pages or a search function can turn a dead end into a second chance to re-engage.",
    imageUrl: "/audits/images/everest_new/image17.png",
    layoutType: "legacy-box-left",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "02 Broken links interrupt the buyer’s momentum",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "Medium",
    rawNotes: "Dead links create moments of friction that make the site feel poorly maintained. Even small signs of neglect can cast doubt on reliability, leading them to disengage and move on.",
    imageUrl: "/audits/images/everest_new/image18.png",
    layoutType: "legacy-box-bottom",
    boxColor: "dark",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "--- Page Break ---",
    rawNotes: "",
    stage: "",
    
    category: "Layout",
    severity: "Low",
    layoutType: "legacy-box-left",
    isPageBreak: true, status: "Hidden", order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: genId(),
    auditId: everestAuditId,
    title: "Missing Follow-Through",
    stage: "",
    category: "Content",
    status: "Polished",
    order: 0,
    severity: "High",
    rawNotes: "The journey doesn’t end at conversion, but right now, Everest makes it difficult to track, optimize, and nurture post-engagement relationships. Limited conversion tracking leaves valuable insights untapped. With key contact points buried in the footer and relying on mailto: links, it’s difficult to measure who’s engaging — and how. Without proper call tracking and conversion monitoring, Everest misses the chance to learn from and refine what drives results.",
    imageUrl: "/audits/images/everest_new/image19.png",
    layoutType: "legacy-box-top",
    boxColor: "light",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
