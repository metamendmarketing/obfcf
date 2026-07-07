import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { METAMEND_KNOWLEDGE_BASE } from "@/lib/knowledge-base";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { findings, companyName, industry, sectionType, otherPagesContext, customStages } = body;

    if (!findings || !Array.isArray(findings)) {
      return NextResponse.json({ error: "Findings array is required." }, { status: 400 });
    }

    if (!sectionType || (sectionType !== 'executive-summary' && sectionType !== 'conclusion')) {
      return NextResponse.json({ error: "Invalid sectionType." }, { status: 400 });
    }

    const findingsStr = JSON.stringify(findings.map((f: any) => ({
      title: f.polishedTitle || f.title,
      summary: f.polishedSummary,
      businessImpact: f.businessImpact,
      recommendation: f.recommendation,
      severity: f.severity,
      stage: f.stage,
      category: f.category
    })), null, 2);

    let systemPrompt = "";

    if (sectionType === 'executive-summary') {
      systemPrompt = `
You are the Lead Digital Strategist at Metamend. Your job is to write the Executive Summary for an SEO/CRO Audit Report.
PROSPECT: ${companyName} (${industry})

Here are a few "Legacy Thematic" examples extracted from past successful Metamend audits. 
CRITICAL TONE INSTRUCTION: Deeply analyze these examples to understand Metamend's authoritative, consultative tone of voice. Notice how they elevate technical issues into business risks and opportunities. Borrow the strategic positioning and narrative flow from these examples.
${JSON.stringify(METAMEND_KNOWLEDGE_BASE.executiveToneExamples, null, 2)}

Below are the specific findings from the client's audit. 
CRITICAL DATA INSTRUCTION: Do NOT simply summarize, list, or rewrite these findings. They have already been documented elsewhere in the report. Use them STRICTLY as context to understand the overarching systemic issues (e.g., severe UX roadblocks, structural SEO flaws, massive conversion leaks). Formulate a tailored narrative that demonstrates the ultimate business value of solving these overarching issues.

${otherPagesContext ? `Additionally, here is the content from the other supplementary pages included in this audit presentation. Review this context to understand the specific methodologies, services, or proposals being presented to the client, and seamlessly incorporate this understanding into your narrative:\n\nSUPPLEMENTARY PAGE CONTEXT:\n${otherPagesContext}` : ''}

LENGTH CONSTRAINT: The output MUST fit perfectly on 1 printed page. Maximum 200 words. Be concise and impactful. Do not exceed 200 words.
FORMATTING RULE: You MUST output ONLY valid HTML. Do not wrap in markdown \`\`\`html.
Use <p> for paragraphs. Use <strong> tags to bold key commercial phrases.
You MUST include a <ul> list that categorizes the high-level friction points into the exact stages this audit is structured into. 
The stages for this specific audit are:
${customStages && customStages.length > 0 ? customStages.map((s: string) => `<li><strong>${s}:</strong></li>`).join('\n') : `<li><strong>Awareness:</strong></li>\n<li><strong>Consideration:</strong></li>\n<li><strong>Conversion:</strong></li>`}

FINDINGS (For Context Only):
${findingsStr}
`;
    } else {
      systemPrompt = `
You are the Lead Digital Strategist at Metamend. Your job is to write the Conclusion for an SEO/CRO Audit Report.
PROSPECT: ${companyName} (${industry})

Below are the specific findings from the client's audit. 
CRITICAL DATA INSTRUCTION: Do NOT simply summarize, list, or rewrite these findings. They have already been documented elsewhere in the report. Use them STRICTLY as context to understand the systemic issues holding the client back. 

${otherPagesContext ? `Additionally, here is the content from the other supplementary pages included in this audit presentation. Review this context to understand the specific methodologies, services, or proposals being presented to the client, and seamlessly incorporate this understanding into your narrative:\n\nSUPPLEMENTARY PAGE CONTEXT:\n${otherPagesContext}` : ''}

Write a bespoke, pragmatic conclusion that summarizes the holistic solution to the specific issues found in this audit. 
CRITICAL TONE INSTRUCTION: Do NOT sound "markety", "salesy", or generic. Do NOT focus on pitching or selling Metamend's services. Instead, speak directly and objectively to the reality of the client's current situation based strictly on the findings provided. Focus on the gravity of the issues identified, the operational reality of what needs to be addressed, and the concrete path forward to fix them.

LENGTH CONSTRAINT: The output MUST fit perfectly on 1 printed page. Maximum 200 words. Be concise and impactful. Do not exceed 200 words.
FORMATTING RULE: You MUST output ONLY valid HTML. Do not wrap in markdown \`\`\`html.
Use <p> for paragraphs. Use <strong> tags for emphasis.
You MUST include an <ol> list of exactly 3 high-level, long-term strategic priorities for the client.

FINDINGS (For Context Only):
${findingsStr}
`;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite"
    });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt }] }
      ]
    });

    let html = result.response.text().trim();
    // Strip markdown formatting if the model still outputs it
    if (html.startsWith("```html")) html = html.replace(/^```html\n/, "");
    if (html.endsWith("```")) html = html.replace(/\n```$/, "");

    return NextResponse.json({ html });
    
  } catch (error) {
    console.error("AI Generate Section Error:", error);
    return NextResponse.json({ error: "Failed to generate AI section." }, { status: 500 });
  }
}
