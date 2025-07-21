import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const {
    companyName,
    sector,
    description,
    products,
    competitors,
    locale, 
  } = await req.json();

  // Prompt anglais
  const promptEn = `
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

  // Prompt français
  const promptFr = `
Génère 4 prompts GEO concrets et naturels en français pour une IA de Brand Monitor, afin d'analyser la présence en ligne et la concurrence de l’entreprise suivante :

- Nom : ${companyName}
- Secteur : ${sector}
- Description : ${description}
- Produits/services principaux : ${products}
- Concurrents : ${(competitors || []).join(", ")}

Chaque question doit ressembler à une vraie requête d'utilisateur, mais **ne mentionne pas directement le nom de la marque, de l'entreprise ou des concurrents dans le prompt**. Utilise plutôt des références génériques (ex : "cette entreprise", "ce fournisseur", ou "leurs produits/services"). Exemples :

- Que pensent les utilisateurs du produit principal de cette entreprise ?
- Quelles sont les alternatives à ce fournisseur pour le B2B ?
- Comment les dernières fonctionnalités de cette plateforme se comparent-elles à la concurrence ?
- Ce service est-il disponible à l'international ?
- Quelles startups du [secteur] sont les plus innovantes en 2025 ?
- Comment ouvrir un compte chez ce fournisseur ?
- Quelles sont les dernières actualités concernant cette entreprise ?
- Quels produits propose cette entreprise ?

Les questions doivent être concises, naturelles, et porter sur l'entreprise, ses produits/services et ses concurrents, mais **sans jamais citer directement le nom de la marque/entreprise ou des concurrents**. Ne rends que la liste des questions en français.
`;

  const prompt = locale === "fr" ? promptFr : promptEn;

  const gptResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
  });

  // Nettoyage universel (marche en fr ou en)
  const questions = gptResponse.choices[0].message.content
    .split("\n")
    .filter((q) => q.trim().length > 0);

  return NextResponse.json({ prompts: questions });
}
