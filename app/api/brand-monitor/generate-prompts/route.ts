import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  const { companyName, sector, description, products, competitors, locale } =
    await req.json();

    const promptEn = `
    Generate 4 realistic, sector-specific GEO prompts in English for a Brand Monitor AI to analyze the online presence and competition in the following context:
    
    - Name: ${companyName}
    - Sector: ${sector}
    - Description: ${description}
    - Main products/services: ${products}
    - Competitors: ${(competitors || []).join(", ")}
    
    At least one question should ask for a list of the main companies or leading providers in the sector.
    
    Each question should sound like a real user query. **Do NOT mention the company name, brand, or competitors directly. Do NOT use generic references like "this company", "this provider", or "their products/services".**
    
    Instead, focus on:
    - industry trends,
    - best products/services in the sector,
    - comparisons between solutions,
    - innovation,
    - features sought by users,
    - challenges or pain points,
    - recent news or developments in the sector.
    
    **Examples:**
    - Who are the main companies providing [main product/service] in [sector]?
    - What are the most recommended solutions for [main product/service] in [sector]?
    - Which companies are leading innovation in [sector] in 2025?
    - How do top platforms in [sector] compare in terms of user satisfaction?
    - What are the latest trends in [sector] workforce management?
    
    Only output the list of questions in English.
    `;
    

    const promptFr = `
    Génère 4 prompts GEO sectoriels et naturels en français pour une IA de Brand Monitor, afin d’analyser la présence en ligne et la concurrence dans le contexte suivant :
    
    - Nom : ${companyName}
    - Secteur : ${sector}
    - Description : ${description}
    - Produits/services principaux : ${products}
    - Concurrents : ${(competitors || []).join(", ")}
    
    Au moins une question doit demander la liste des principaux acteurs, entreprises ou fournisseurs du secteur.
    
    Chaque question doit ressembler à une vraie requête d’utilisateur. **Ne mentionne pas directement le nom de l’entreprise, d’une marque, ni de concurrents. N’utilise PAS de références génériques comme "cette entreprise", "ce fournisseur", ou "leurs produits/services".**
    
    Concentre-toi plutôt sur :
    - les tendances du secteur,
    - les meilleures solutions/produits,
    - les comparaisons entre plateformes,
    - l’innovation,
    - les attentes des utilisateurs,
    - les défis rencontrés,
    - les actualités récentes du secteur.
    
    **Exemples :**
    - Quels sont les principaux acteurs de [produit/service] dans le secteur [secteur] ?
    - Quelles sont les solutions les plus recommandées pour [produit/service] dans le secteur [secteur] ?
    - Quelles entreprises sont les plus innovantes dans le secteur [secteur] en 2025 ?
    - Comment comparer les principales plateformes de [secteur] selon la satisfaction utilisateur ?
    - Quelles sont les dernières tendances en gestion de [secteur] ?
    
    Ne rends que la liste des questions en français.
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
