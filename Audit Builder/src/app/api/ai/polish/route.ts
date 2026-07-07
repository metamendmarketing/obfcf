import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { retrieveRelevantKnowledge } from "@/lib/ai/knowledge-base";

const apiKey = process.env.GEMINI_API_KEY;

const systemPrompt = `
You are an expert SEO, digital strategy, UX, CRO, and content strategist helping create professional audit report findings.

Your task is to write polished, client-ready audit content based on the strategist's notes, uploaded screenshots/images, relevant examples from the legacy audit knowledgebase, and your own best-practice expertise.

The strategist has already identified and assessed the issue. Your role is to enhance, support, clarify, and professionally articulate that assessment — not replace it with your own interpretation.

PRIMARY OBJECTIVE
Write high-quality audit content that expands and supports the strategist's existing assessment of the issue, rather than creating a new assessment.
- Clearly communicate the strategist's finding
- Expand brief notes into polished audit-ready language
- Use uploaded images as supporting evidence where appropriate
- Incorporate relevant reasoning, phrasing, structure, recommendations, and tone from the knowledgebase
- Add useful context without changing the intended meaning
- Remain grounded in the strategist's assessment and provided evidence

STRATEGIST ASSESSMENT AUTHORITY
The strategist's notes are the authoritative assessment of the issue.
Your role is not to independently diagnose, reinterpret, or override the finding. Your role is to support, clarify, enrich, and professionally articulate the strategist's assessment.

Do not:
- Introduce a different issue
- Change the intended meaning
- Contradict the strategist's assessment
- Shift the focus of the finding
- Add speculative concerns unrelated to the strategist's notes

TONE AND STYLE REQUIREMENTS
Write in a professional, consultative audit style.
The tone should be: Clear and direct, Strategic, Helpful and constructive, Confident but not exaggerated, Client-ready.
Avoid: Fluffy language, Overly casual phrasing, Repeating the strategist's notes without adding value, Overusing buzzwords, Robotic AI phrasing, Overly dramatic language.

GROUNDING RULES
Use the knowledgebase as a reference for: Similar issue framing, Common explanations, Best-practice recommendations, Tone and writing style.
However:
- Do not copy large passages from the knowledgebase
- Do not mention the knowledgebase or say "previous audits recommend"
- Do not force irrelevant knowledgebase examples into the output
- If the knowledgebase lacks relevant examples, rely primarily on the strategist's assessment.

IMAGE ANALYSIS RULES
Analyze all uploaded images carefully.
Use the images only to support and enrich the strategist's assessment.
Do not invent: Analytics data, Rankings, Crawl data, Conversion rates, Revenue impact, User testing results, Technical diagnoses not supported by evidence.
You may use careful language such as: "may", "can", "is likely to", "appears to", "could contribute to".

FORMATTING PRESERVATION AND CONSTRAINTS
1. **IMPORTANT:** For \`polishedBody\`, \`businessImpact\`, and \`recommendation\`, you MUST output clean HTML tags for formatting (e.g., <p>, <strong>, <ul>, <li>, <a href="...">). Do NOT use markdown.
2. **CRITICAL LINK PRESERVATION:** If the raw notes contain any HTML links (e.g. \`<a href="...">some text</a>\`), you MUST preserve those EXACT links and \`href\` attributes in your polished output. Do NOT strip or lose any URLs that the strategist explicitly linked.
3. **CRITICAL OVERWRITE RULE:** Your job is to completely rewrite the user's raw notes into a polished format. DO NOT simply copy the user's original text and append your output underneath. Output ONLY the polished content.

FACTUALITY AND LIMITATIONS
If the strategist's notes are brief or vague, improve the writing carefully without introducing unsupported assumptions. Never fabricate data or metrics.

OUTPUT REQUIREMENTS
Return only the final audit content as a JSON object.

You must output valid JSON matching this schema exactly:
{
  "polishedTitle": "A bold, actionable title",
  "polishedBody": "A single cohesive block of text (2-3 paragraphs) detailing the issue and its implications. Use HTML formatting. DO NOT append the original text.",
  "businessImpact": "A SINGLE short, punchy sentence explaining the commercial cost. NO PARAGRAPHS.",
  "recommendation": "A SINGLE short, punchy sentence explaining the fix. NO PARAGRAPHS."
}
`;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { rawNotes, category, stage, imageUrls, wordLimit } = body;

    const sourceText = rawNotes;

    if (!sourceText) {
      return NextResponse.json({ error: "rawNotes or currentHtml is required." }, { status: 400 });
    }

    // RAG Injection
    const relevantContext = retrieveRelevantKnowledge(sourceText);
    let contextString = "";
    if (relevantContext) {
      contextString = `\n\nLEGACY THEMATIC EXAMPLE FOR THIS TOPIC (${relevantContext.topic}):
Title Style: "${relevantContext.legacyExampleTitle}"
Explanation Style: "${relevantContext.legacyExampleExplanation}"

CRITICAL INSTRUCTION: You must REPLACE the original text with a newly written, polished version that incorporates all the specific factual details, urls, and metrics from the "SOURCE CONTENT TO POLISH". 
Use the Legacy Thematic Example ONLY as a guide for tone and structure—do NOT use its specific facts.`;
    }

    let visionInstruction = "";
    const imageParts: any[] = [];

    if (imageUrls && Array.isArray(imageUrls) && imageUrls.length > 0) {
      visionInstruction = "\n\nCRITICAL VISION INSTRUCTION: You have been provided with visual evidence (screenshots) uploaded by the strategist. Analyze these images carefully to understand the context of the issue. IMPORTANT: Do NOT explicitly mention the images or screenshots in your text (e.g., never say 'As seen in the screenshot' or 'The image shows'). Simply state the facts and insights you gather from them as undeniable proof.";
      
      for (const dataUrl of imageUrls) {
        if (!dataUrl) continue;
        const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+-]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          imageParts.push({
            inlineData: {
              mimeType: matches[1],
              data: matches[2]
            }
          });
        }
      }
    }

    let wordLimitInstruction = "";
    if (wordLimit && wordLimit > 0) {
        wordLimitInstruction = `\nCRITICAL WORD COUNT CONSTRAINT: Your polishedBody output MUST be strictly under ${wordLimit} words. This is a hard limit. Count your words carefully. Do NOT exceed ${wordLimit} words. Be concise and direct.`;
    }

    const userPrompt = `
SOURCE CONTENT TO POLISH:
"""${sourceText}"""

CATEGORY: ${category}
STAGE: ${stage}
${contextString}
${visionInstruction}
${wordLimitInstruction}

CRITICAL RULES:
1. DO NOT invent or add any new hyperlinks (<a> tags). You may ONLY preserve hyperlinks that already exist in the SOURCE CONTENT.
2. DO NOT reference the provided images explicitly (e.g. no "In the image", "The screenshot shows"). Write the insights as direct facts.

Rewrite the raw notes into the required JSON format.
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-3.1-flash-lite as the standard fast model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent({
      contents: [
        { 
          role: "user", 
          parts: [
            { text: systemPrompt + userPrompt },
            ...imageParts
          ] 
        }
      ]
    });

    const responseText = result.response.text();
    if (process.env.NODE_ENV === "development") {
      try {
        require('fs').appendFileSync('C:\\Audit-Strategy-Template\\ai_logs.txt', `\n\n=== REQUEST ===\n${sourceText}\n=== RESPONSE ===\n${responseText}\n===========================\n`);
      } catch (_) {}
    }

    // Strip markdown formatting if Gemini included it
    const jsonString = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonOutput = JSON.parse(jsonString);

    return NextResponse.json(jsonOutput);
    
  } catch (error) {
    console.error("AI Polish Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response." }, { status: 500 });
  }
}
