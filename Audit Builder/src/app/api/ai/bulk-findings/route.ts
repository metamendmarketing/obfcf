import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
  try {
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured." }, { status: 500 });
    }

    const body = await req.json();
    const { notes, imageFilenames, companyName, industry } = body;

    if (!notes || !imageFilenames) {
      return NextResponse.json({ error: "Notes and imageFilenames are required." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" }); // Using a strong model for complex JSON matching

    const systemPrompt = `
You are a Lead Digital Strategist at Metamend. Your job is to process a messy bulleted list of raw notes and a list of uploaded image filenames.
PROSPECT: ${companyName} (${industry})

Your goal is to parse the raw notes, structure them into high-quality audit findings, and logically match each finding with the MOST RELEVANT image filename from the provided list based on context clues.

RAW NOTES:
${notes}

AVAILABLE IMAGE FILENAMES:
${JSON.stringify(imageFilenames, null, 2)}

INSTRUCTIONS:
1. Parse the RAW NOTES. **CRITICAL RULE**: Every single distinct note, paragraph, or bullet point in the RAW NOTES represents ONE individual finding. You MUST create a separate finding object for every single note provided. DO NOT group multiple notes together into a single finding. If there are 17 distinct notes, you must output exactly 17 findings.
2. Group the findings into highly thoughtful, strategic 'stages' or 'sections'. DO NOT just copy my examples below; instead, INVENT custom groupings that perfectly fit the specific context of the raw notes you are analyzing. (For instance, instead of using a generic term like "UX", analyze the UX notes and create a tailored grouping like "Engagement Friction" or "Navigation Bottlenecks" depending on what the notes actually say).
3. **CRITICAL GROUPING RULE**: Because the presentation displays exactly 2 findings per page, you must strongly attempt to group an EVEN NUMBER of findings (e.g., 2, 4, or 6) into each stage whenever logically possible. This prevents a single finding from being orphaned alone on the final page of a section.
4. Order the findings in a highly logical, practical sequence for the final audit presentation.
5. For each finding, determine which image filenames best match it. If a finding requires multiple images to illustrate the point, include all relevant filenames. If not confident, leave "matchedFilenames" as an empty array.
6. For each finding, generate:
   - "title": A concise, punchy title (e.g. "Critical Checkout Friction").
   - "rawNotes": The original, exact raw bullet points from the notes that pertain to this finding. DO NOT polish or summarize this text. Keep the exact raw notes so the strategist can edit them manually.
   - "stage": The creative strategic stage you categorized it into (e.g. "Conversion Leaks").
   - "stageHeading": A specific, contextual sub-heading for this entire stage (e.g. if the stage is "Conversion Leaks", the heading might be "Protecting the Conversion Path"). All findings in the same stage must have the exact same stageHeading.
   - "category": A specific category (e.g. "Navigation", "Page Speed", "Content Strategy").
   - "severity": "Critical", "High", "Medium", "Low", or "Opportunity".
   - "matchedFilenames": An array of strings containing the exact filenames of the images that match this finding (e.g., ["checkout-bug.png", "checkout-error.png"]).

OUTPUT FORMAT:
You MUST return ONLY a valid JSON array of finding objects, ordered logically for the presentation. No markdown formatting, no backticks, no explanations.
Example:
[
  {
    "rawNotes": "- checkout button is hidden on mobile\\n- user gets stuck",
    "title": "Mobile Checkout Friction",
    "stage": "Conversion Leaks",
    "stageHeading": "Protecting the Conversion Path",
    "category": "Checkout",
    "severity": "Critical",
    "matchedFilenames": ["checkout-bug.png"]
  }
]
`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: systemPrompt }] }]
    });

    let jsonStr = result.response.text().trim();
    // Strip markdown formatting if the model outputs it
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/^```json\n/, "");
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.replace(/^```\n/, "");
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.replace(/\n```$/, "");

    const findings = JSON.parse(jsonStr);

    return NextResponse.json({ findings });
    
  } catch (error: any) {
    console.error("Bulk AI Endpoint Error:", error);
    return NextResponse.json(
      { error: "Failed to process bulk findings.", details: error.message },
      { status: 500 }
    );
  }
}
