import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { METAMEND_KNOWLEDGE_BASE } from "@/lib/knowledge-base";

const apiKey = process.env.GEMINI_API_KEY;

const systemPrompt = `
You are the Master Orchestrator for Metamend, a premium SEO/CRO agency.
Your job is to take a list of polished findings and organize them into a final, presentation-ready report structure.

STRICT NARRATIVE ORDERING & DYNAMIC COPY:
You must output a JSON structure that groups findings into these core narrative stages.
However, you have FULL CREATIVE LICENSE to write the exact 'title', 'subtitle', and 'intro' for each section. They must be highly dynamic and perfectly tailored to the specific raw findings provided for this client.

Use the Metamend PDF examples purely as thematic inspiration (e.g., "The Visibility Crisis" or "What happens when users search [Brand]?"). Do NOT copy those exactly unless they are genuinely the most powerful way to summarize the client's specific issues. Be fluid, dynamic, and executive-focused.

Here are a few "Legacy Thematic" examples extracted from past successful Metamend audits. Pay close attention to the structural flow and executive, friction-focused tone:
${JSON.stringify(METAMEND_KNOWLEDGE_BASE.executiveToneExamples, null, 2)}

1. Brand and Trust Risks (Generate a hard-hitting, custom title, subtitle, and intro based on the specific trust findings)
2. Discovery (Generate a custom title, subtitle, and intro based on the visibility/SEO findings)
3. Consideration
4. Conversion
5. Long-Term Impact Areas
6. Paid Search Strategic Opportunities

LAYOUT SELECTION RULES:
For each finding in the sections, you must select the best UI layout string from this list:
- "image-left" (Default for single image findings)
- "image-right" (To break up visual repetition for single images)
- "image-full" (For critical issues with large single screenshots)
- "gallery" (MUST USE if the finding has multiple images / imageCount > 1)
- "comparison" (If the finding explicitly compares to a competitor, or compares 'before and after' using multiple images)
- "text-only" (If no visual evidence is provided)
- "strategic-card" (For high-level summaries)

You must output valid JSON matching this schema exactly:
{
  "sections": [
    {
      "title": "Discovery",
      "subtitle": "The Visibility Crisis",
      "intro": "1-2 paragraphs introducing the friction in this stage based on the findings...",
      "findings": [
         {
           "id": "the original finding id",
           "layoutType": "image-left",
           "order": 1
         }
      ]
    }
  ]
}
`;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { findings, companyName, industry } = body;

    if (!findings || !Array.isArray(findings)) {
      return NextResponse.json({ error: "Findings array is required." }, { status: 400 });
    }

    const userPrompt = `
PROSPECT: ${companyName} (${industry})
FINDINGS TO ORCHESTRATE:
${JSON.stringify(findings.map((f: any) => ({
      id: f.id,
      title: f.polishedTitle || f.title,
      severity: f.severity,
      stage: f.stage,
      category: f.category,
      hasImage: !!f.imageUrl,
      imageCount: f.imageUrls?.length || (f.imageUrl ? 1 : 0)
    })), null, 2)}

Analyze these findings and return the orchestrated JSON structure according to the Metamend narrative arc.
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: systemPrompt + userPrompt }] }
      ]
    });

    const text = result.response.text();
    const jsonOutput = JSON.parse(text);

    return NextResponse.json(jsonOutput);
    
  } catch (error: any) {
    console.error("AI Compose Error:", error);
    return NextResponse.json({ error: `Failed to generate AI report composition: ${error.message || 'Unknown error'}` }, { status: 500 });
  }
}
