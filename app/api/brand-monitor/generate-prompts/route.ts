import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { companyName, sector, description, products, competitors } = await req.json();

  const prompt = `
  Generate 4 concise, highly relevant questions in English for a Brand Monitor AI to analyze the online presence and competitive positioning of the following company:
  
  - Name: ${companyName}
  - Sector: ${sector}
  - Description: ${description}
  - Main products/services: ${products}
  - Competitors: ${(competitors || []).join(', ')}
  
  Each question must focus on competitive analysis of the company's products or services versus those of its competitors. The questions should help understand strengths, weaknesses, differentiation, product visibility, market perception, and emerging opportunities or threats. Avoid generic branding questions: focus specifically on competition and product comparison. Each question should be a single sentence, maximum 18 words.
  
  Only output the list of questions in English.
  `;
  
  
  

  const gptResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  });

  // Suppose que la réponse est un tableau ou un texte à parser
  const questions = gptResponse.choices[0].message.content
    .split('\n')
    .filter(q => q.trim().length > 0);

  return NextResponse.json({ prompts: questions });
}
