import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { companyName, sector, description, products, competitors } =
    await req.json();

  const prompt = `
    Generate 4 concrete, natural GEO prompts in English for a Brand Monitor AI to analyze the online presence and competition of the following company:
    
    - Name: ${companyName}
    - Sector: ${sector}
    - Description: ${description}
    - Main products/services: ${products}
    - Competitors: ${(competitors || []).join(", ")}
    
    Each question should sound like a real user query, but **do NOT mention the company name, brand, or competitors directly in the prompt**. Instead, use generic references (e.g. "this company", "this provider", or "their products/services"). Example:
    
    - What do users think of this company’s main product?
    - What are the alternatives to this provider for B2B?
    - How do the latest features of this platform compare to competitors?
    - Is this service available internationally?
    - Which startups in the [sector] are most innovative in 2025?
    - How do I open an account at this provider?
    - What are the latest news about this company?
    - What products does this company offer?
    
    Questions should be concise, natural, and related to the company, its products/services, and competitors, but **should NOT directly use the brand/company or competitor names**. Only output the list of questions in English.
    `;

  const gptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  // Suppose que la réponse est un tableau ou un texte à parser
  const questions = gptResponse.choices[0].message.content
    .split("\n")
    .filter((q) => q.trim().length > 0);

  return NextResponse.json({ prompts: questions });
}
