import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is missing." }, { status: 500 });
  }

  const INPUT_FILE = "C:/Users/kevin/.gemini/antigravity/brain/11a0088d-19c4-4dda-8f8b-69d6e26a409e/scratch/extracted_audits.json";
  const OUTPUT_FILE = "C:/Users/kevin/.gemini/antigravity/brain/11a0088d-19c4-4dda-8f8b-69d6e26a409e/scratch/distilled_kb.json";

  try {
    const rawData = fs.readFileSync(INPUT_FILE, "utf-8");

    const prompt = `
You are an expert AI knowledge architect for Metamend, a premium SEO/CRO agency.
I am providing you with the raw text extractions from 65 past Metamend audits and proposals.
Your task is to analyze all this text and extract the "Gold Standard" examples of how Metamend writes.

CRITICAL INSTRUCTIONS:
Ignore outdated technical metrics (like old PageRank or obsolete algorithms). Focus entirely on:
1. The structure of the arguments
2. The tone of voice (authoritative, executive-ready, focusing on friction and business impact)
3. The specific archetypes of findings (Technical SEO, CRO, Brand Trust)

Output a JSON structure matching this exact format:
{
  "executiveToneExamples": [
    "A 2-3 paragraph example of a highly polished executive summary found in the texts...",
    "Another example..."
  ],
  "findingArchetypes": {
    "Technical SEO": [
      {
        "title": "Example Title",
        "summary": "Example high-level summary",
        "impact": "Example business impact",
        "recommendation": "Example recommendation"
      }
    ],
    "CRO": [
      {
        "title": "Example Title",
        "summary": "Example high-level summary",
        "impact": "Example business impact",
        "recommendation": "Example recommendation"
      }
    ],
    "Brand Trust": [
      {
        "title": "Example Title",
        "summary": "Example high-level summary",
        "impact": "Example business impact",
        "recommendation": "Example recommendation"
      }
    ]
  }
}

Extract at least 3 executive tone examples, and at least 4 finding archetypes for each category. Ensure the text is pristine, formatting is clean (use HTML tags like <p> and <strong> inside the strings where appropriate to mimic rich text), and captures the true essence of the Metamend agency voice.

RAW DATA:
${rawData}
`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const result = await model.generateContent(prompt);
    const jsonText = result.response.text();
    
    fs.writeFileSync(OUTPUT_FILE, jsonText);

    return NextResponse.json({ success: true, file: OUTPUT_FILE });
  } catch (error: any) {
    console.error("Distillation Error:", error);
    fs.writeFileSync("C:/Users/kevin/.gemini/antigravity/brain/11a0088d-19c4-4dda-8f8b-69d6e26a409e/scratch/distill_error.txt", error.message + "\n" + (error.stack || ""));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
