import { Audit, Finding, createDefaultPages } from '../store';

export const valtirAuditId = "audit-valtir-template";

export const valtirAudit: Audit = {
  id: valtirAuditId,
  companyName: "Valtir Rentals",
  status: "Approved",
  websiteUrl: "https://www.valtirrentals.com",
  industry: "Equipment Rentals",
  primaryService: "CRO",
  preparedBy: "Matthew",
  date: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isTemplate: true,
  reportStructure: {
    customStages: [
      "Discovery & Architecture",
      "Engagement Friction",
      "Conversion Leaks",
      "Technical Equity"
    ],
    stageConfigs: {
      "Discovery & Architecture": {
        heading: "Navigational Gaps & Content Flow",
        caption: "How users find and navigate the site"
      },
      "Engagement Friction": {
        heading: "User Experience Roadblocks",
        caption: "Immediate UX issues causing bounces"
      },
      "Conversion Leaks": {
        heading: "Protecting the Conversion Path",
        caption: "Where active users lose trust"
      },
      "Technical Equity": {
        heading: "Consolidating Authority & Search Presence",
        caption: "Underlying issues bleeding domain authority"
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
                html: `<p>Valtir Rentals operates in a highly competitive equipment rental space where visibility and trust are paramount. While the foundation of the business is strong, the current digital experience contains several structural and user-experience roadblocks that prevent you from capturing maximum market share.</p><p>This Conversion Rate Optimization (CRO) and SEO audit identifies key friction points across the user journey—from initial discovery to final conversion. By addressing these gaps, we can elevate the user experience, consolidate lost technical equity, and significantly improve conversion rates.</p>`
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
                html: `<p>By addressing the friction points outlined in this audit, Valtir Rentals can dramatically improve both search visibility and on-site conversion rates. The current traffic leaks and structural issues are suppressing the true potential of the website.</p><p>Our recommended approach focuses on immediately plugging the conversion leaks, streamlining the user experience, and reclaiming lost technical equity from past acquisitions. This strategy will position Valtir Rentals as the definitive leader in the space, ensuring that when users search for equipment, they find a trusted, fast, and seamless experience.</p>`
              }
            };
          }
          return block;
        })
      };
    }
    
    return page;
  })
};

const rawFindings = [
  // Stage 1: Discovery & Architecture
  {
    title: "broken site structure",
    rawNotes: "The current site structure contains forward directories however there are no category of top-level page content. For example, the application folder that contains printer security content derives as a 404 creating a break in page flow and breadcrumbs.",
    imageUrl: "/audits/images/valtir/broken site structure.png",
    stage: "Discovery & Architecture",
    category: "Architecture"
  },
  {
    title: "no case study site structure",
    rawNotes: "While there are many case studies that are indexed in the search engines, there is no easy way to navigate to them. Additionally, the user experience for this section is weak and hard to navigate.",
    imageUrl: "/audits/images/valtir/no case study site structure.png",
    stage: "Discovery & Architecture",
    category: "Architecture"
  },
  {
    title: "FAQ page indexed but not linked from website",
    rawNotes: "There are many pages that are not navigable from the main navigation of subpages. However, these pages are still indexed with the search engines.",
    imageUrl: "/audits/images/valtir/FAQ page indexed but not linked from website.png",
    stage: "Discovery & Architecture",
    category: "Architecture"
  },
  {
    title: "category content",
    rawNotes: "All category pages are lacking content. This prevents the search engine from racing the site for high value keywords related to the core product categories. This also present s the ability to create internal licking and overall site relevance.",
    imageUrl: "/audits/images/valtir/category content.png",
    stage: "Discovery & Architecture",
    category: "Content"
  },
  
  // Stage 2: Engagement Friction
  {
    title: "hero image",
    rawNotes: "The main “hero image” on the home page is pushing bauble content below the fold. This deceases the value of the content to the search engines and provide little value to the users as they do not contain strong calls to action or general benefit statements.",
    imageUrl: "/audits/images/valtir/hero image.png",
    stage: "Engagement Friction",
    category: "UX/UI"
  },
  {
    title: "Speed",
    rawNotes: "Site speed has a direct impact on rankings and conversion rate. This issue more important than ever with LLM’s and AI based search.",
    imageUrl: "/audits/images/valtir/speed.png",
    stage: "Engagement Friction",
    category: "Performance"
  },
  {
    title: "broken search results",
    rawNotes: "When performing a search, you are presented with a massive logo that breaks the page before providing inaccurate search results. This effects user trust.",
    imageUrl: "/audits/images/valtir/broken search results.png",
    stage: "Engagement Friction",
    category: "UX/UI"
  },
  {
    title: "broken industry page",
    rawNotes: "Some of the industry landing pages have a broken style that is distorting the images and content creating a bad user experience and effect site trust.",
    imageUrl: "/audits/images/valtir/broken industry page.png",
    stage: "Engagement Friction",
    category: "UX/UI"
  },

  // Stage 3: Conversion Leaks
  {
    title: "traffic leak",
    rawNotes: "Current pdf’s contain references in the header to “Valmont Highway”. When a user sees this and performs a search for them, they are directed to a site that list your competitors with competing products.",
    imageUrl: "/audits/images/valtir/traffic leak.png",
    stage: "Conversion Leaks",
    category: "Conversion"
  },
  {
    title: "external asset takes off site no way back",
    rawNotes: "Many of the site's assets, specifically the pdf’s, link off site with no way back to the main site. This can chat a traffic leak and these assets will not be credited to the site.",
    imageUrl: "/audits/images/valtir/external asset takes off site no way back.png",
    stage: "Conversion Leaks",
    category: "Conversion"
  },
  {
    title: "reviews missing markup",
    rawNotes: "The reviews on your home page are not properly markup with product reviews snippets. This prevents the search engine from show the star review in the SERP’s which creates a higher page impressions o click through ratio.",
    imageUrl: "/audits/images/valtir/reviews missing markup.png",
    stage: "Conversion Leaks",
    category: "Trust"
  },

  // Stage 4: Technical Equity
  {
    title: "old site still indexed",
    rawNotes: "Your old site contains invalid redirects, often passing through 5 or more 301’s before landing on the final destination. This is preventing the site form properly carrying over its equity and page authority while also keeping it indexed. Cleaning up the redirects and performing a “Google change of address request” in GSC is highly recommended.",
    imageUrl: "/audits/images/valtir/old site still indexed.png",
    stage: "Technical Equity",
    category: "Technical SEO"
  },
  {
    title: "old site still indexed - 2",
    rawNotes: "Same as above, however given this is a sub domain it will need to be separately authenticated in GSC before performing a “Google change of address request” and 301 redirect implementations.",
    imageUrl: "/audits/images/valtir/old site still indexed - 2.png",
    stage: "Technical Equity",
    category: "Technical SEO"
  },
  {
    title: "equity loss",
    rawNotes: "Many of Valitr’s past acquisitions are not redirecting to the main site. These sites still have quality back linking and foaming authority that could be redirected to regain the equity that is currently being lost.",
    imageUrl: "/audits/images/valtir/equity loss.png",
    stage: "Technical Equity",
    category: "Technical SEO"
  },
  {
    title: "product assets",
    rawNotes: "The products assets are located off site and are not being accredited to the primary domain.",
    imageUrl: "/audits/images/valtir/product assets.png",
    stage: "Technical Equity",
    category: "Technical SEO"
  },
  {
    title: "alt tag spam",
    rawNotes: "Alt tag is not representative of the image. Because the content has keywords that are not descriptive of the image, it could be flagged as spam.",
    imageUrl: "/audits/images/valtir/alt tag spam.png",
    stage: "Technical Equity",
    category: "Technical SEO"
  },
  {
    title: "faq snippets",
    rawNotes: "FAQ section does not contain semantic markup which it the most important element to a FAQ for search engines and LLM’s.",
    imageUrl: "/audits/images/valtir/faq snippets.png",
    stage: "Technical Equity",
    category: "Technical SEO"
  }
];

export const valtirFindings: Record<string, Finding> = {};

rawFindings.forEach((f, index) => {
  const id = `valtir-finding-${index}`;
  valtirFindings[id] = {
    id,
    auditId: valtirAuditId,
    title: f.title,
    rawNotes: f.rawNotes,
    stage: f.stage,
    category: f.category,
    severity: "High",
    layoutType: "image-left",
    status: "Draft",
    order: index,
    imageUrl: f.imageUrl,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
});
