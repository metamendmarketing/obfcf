import fs from 'fs';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  const extractedData = JSON.parse(fs.readFileSync('C:\\Users\\kevin\\.gemini\\antigravity\\brain\\11a0088d-19c4-4dda-8f8b-69d6e26a409e\\scratch\\mcp_extracted.json', 'utf-8'));
  
  // Condense text for Gemini to map it to JSON
  let fullText = extractedData.map(p => `--- PAGE ${p.page_number} ---\n${p.text}\nIMAGES ON PAGE: ${p.images.join(', ')}`).join('\n\n');
  
  const prompt = `
You are an expert data migration engineer. I am giving you the full raw text and image mappings of a legacy 22-page "MCP Funds" SEO Audit PDF.
I need you to map this legacy data into my exact JSON schema for the new SaaS platform.

Here is the exact TypeScript Schema you must output as a valid JSON object:

{
  "audit": {
    "id": "mcp-legacy-audit-1",
    "prospectName": "MCP Funds",
    "websiteUrl": "string",
    "industry": "Finance",
    "primaryService": "SEO",
    "preparedBy": "Metamend",
    "reportStructure": {
      "executiveSummary": "string (Extract the overarching executive summary)"
    }
  },
  "findings": [
    {
      "id": "generate unique string like mcp-finding-1",
      "title": "string (the legacy title of the issue)",
      "rawNotes": "string (the legacy text explaining the issue)",
      "stage": "Discovery" | "Consideration" | "Conversion" | "Long-Term Impact",
      "category": "string",
      "severity": "High" | "Medium" | "Low",
      "polishedTitle": "string (same as title)",
      "polishedSummary": "string (a 1 sentence summary of the issue)",
      "polishedBody": "string (the full text explanation in HTML <p> tags)",
      "businessImpact": "string (1 sentence commercial impact)",
      "recommendation": "string (1 sentence fix)",
      "imageUrl": "string (Select the most relevant image path from IMAGES ON PAGE for this finding, or leave empty)",
      "layoutType": "image-left" | "gallery" | "comparison" | "text-only" (choose the best based on images)
    }
  ]
}

DO NOT output markdown, just the raw JSON object.

RAW AUDIT TEXT:
${fullText}
  `;

  console.log("Sending to Gemini...");
  const model = genAI.getGenerativeModel({ 
    model: "gemini-3.1-flash-lite-preview",
    generationConfig: {
      responseMimeType: "application/json"
    }
  });

  const result = await model.generateContent(prompt);
  const jsonText = result.response.text();
  
  fs.writeFileSync('C:\\Users\\kevin\\.gemini\\antigravity\\brain\\11a0088d-19c4-4dda-8f8b-69d6e26a409e\\scratch\\mcp_seed.json', jsonText);
  console.log("Saved to mcp_seed.json!");
}

run().catch(console.error);
