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
  
  Each question should sound like a real user query, similar to these examples:
  - What are the main competitors of [Brand]?
  - What do users think of [Brand]?
  - What are the best alternatives to [Brand]?
  - How does [Brand] compare to [Competitor] for B2B usage?
  - What new features has [Brand] announced recently?
  - Is [Brand] available internationally?
  - Which [sector] startups are the most innovative in 2025?
  - How do I open an account at [Brand]?
  - What are the latest news about [Brand]?
  - What products does [Brand] offer?
  
  Questions should be concise, in a natural tone, and directly related to the brand, its products/services, and its competitors. Only output the list of questions in English.
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
