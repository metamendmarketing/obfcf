import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: 'c:/Audit-Strategy-Template/.env.local' });

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('GEMINI_API_KEY is missing in env!');
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ 
    model: 'gemini-3.1-flash-lite',
    generationConfig: {
        responseMimeType: 'application/json',
    }
});

const INPUT_FILE = 'c:/Audit-Strategy-Template/scratch/new_audits_text.txt';
const OUTPUT_FILE = 'c:/Audit-Strategy-Template/scratch/new_distilled_kb.json';

async function main() {
    console.log('Loading extracted audits...');
    const rawData = fs.readFileSync(INPUT_FILE, 'utf-8');
    
    const prompt = `
You are an expert AI knowledge architect for Metamend, a premium SEO/CRO agency.
I am providing you with the raw text extractions from 4 newly written Metamend audits and proposals.
Your task is to analyze all this text and extract the "Gold Standard" examples of how Metamend writes audit findings.

CRITICAL INSTRUCTIONS:
Focus entirely on:
1. The structure of the arguments
2. The tone of voice (authoritative, executive-ready, focusing on friction and business impact)
3. The specific archetypes of findings.

Output a JSON structure with an array of findings matching this exact TypeScript interface:
interface StandardFinding {
  topic: string; // The high-level topic (e.g., "Cannibalization", "Poor Mobile Nav")
  keywords: string[]; // 4-5 relevant keywords to help the vector search match this finding
  stage: string; // The funnel stage (e.g., "Discovery", "Consideration", "Conversion", "Technical SEO", "Brand Trust")
  category: string; // "Technical SEO", "CRO", "SEM", or "Brand Trust"
  legacyExampleTitle: string; // A polished, highly authoritative finding title found or inspired by the texts
  legacyExampleExplanation: string; // A 2-3 paragraph example of a highly polished finding explanation. Use pristine formatting and executive tone.
}

Output format must be a JSON object with a single "findings" array:
{
  "findings": [
    { ...StandardFinding },
    { ...StandardFinding }
  ]
}

Extract AT LEAST 8 total unique finding archetypes (e.g., 2 for each audit) from the raw text provided. Ensure the text captures the true essence of the new Metamend agency voice.

RAW DATA:
${rawData}
`;

    console.log('Sending to Gemini 3.1 Flash Lite...');
    try {
        const result = await model.generateContent(prompt);
        const jsonText = result.response.text();
        
        fs.writeFileSync(OUTPUT_FILE, jsonText);
        console.log('Successfully distilled knowledge to ' + OUTPUT_FILE);
    } catch (e) {
        console.error('Error calling Gemini:', e);
    }
}

main();
