import { generateObject } from 'ai';
import { z } from 'zod';
import { Company } from './types';
import FirecrawlApp from '@mendable/firecrawl-js';
import { getConfiguredProviders, getProviderModel } from './provider-config';

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

const CompanyInfoSchema = z.object({
  name: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  industry: z.string(),
  mainProducts: z.array(z.string()),
  competitors: z.array(z.string()).optional(),
});

// AJOUT : locale dans les arguments
export async function scrapeCompanyInfo(url: string, locale: string, maxAge?: number): Promise<Company> {
  try {
    // Ensure URL has protocol
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    // Default to 1 week cache if not specified
    const cacheAge = maxAge ? Math.floor(maxAge / 1000) : 604800; // 1 week in seconds
    
    // Scraping
    const response = await firecrawl.scrapeUrl(normalizedUrl, {
      formats: ['markdown'],
      maxAge: cacheAge,
    });
    if (!response.success) {
      throw new Error(response.error);
    }
    const html = response.markdown;
    const metadata = response.metadata;
    
    // AI extraction provider
    const configuredProviders = getConfiguredProviders();
    if (configuredProviders.length === 0) {
      throw new Error('No AI providers configured and enabled for content extraction');
    }
    const provider = configuredProviders[0];
    const model = getProviderModel(
      provider.id,
      provider.models.find(m => m.name.toLowerCase().includes('mini') || m.name.toLowerCase().includes('flash'))?.id
      || provider.defaultModel
    );
    if (!model) {
      throw new Error(`${provider.name} model not available`);
    }

    // PROMPT DYNAMIQUE SELON LOCALE
    const prompt =
      locale === 'fr'
        ? `Extrait les informations de l'entreprise à partir du contenu de ce site web :

URL : ${normalizedUrl}
Contenu : ${html}

Extrait :
- Le nom de l'entreprise
- Une brève description naturelle en français
- Les mots-clés pertinents (en français)
- Identifie la catégorie PRINCIPALE du secteur

Règles de catégorisation (utilise la catégorie française correspondante) :
- Si la société fabrique des glacières, gourdes, équipements outdoor/camping : « équipement outdoor »
- Si elle propose du web scraping, crawling, extraction de données, parsing HTML : « web scraping »
- Si elle fournit des modèles ou services IA/ML : « intelligence artificielle »
- Si elle offre de l'hébergement, déploiement ou cloud : « déploiement »
- Si c’est une plateforme e-commerce ou créateur de boutiques en ligne : « plateforme e-commerce »
- Si elle vend des produits physiques en direct (vêtements, accessoires…) : « marque DTC (direct-to-consumer) »
- Si c’est dans la mode/habillement/linge/vêtements : « mode & habillement »
- Si elle propose des outils/applis/API software : « outils développeur »
- Si c’est une marketplace/agrégateur : « marketplace »
- Autre logiciel B2B : « SaaS »
- Autre produit conso : « biens de consommation »

IMPORTANT :
1. Pour mainProducts, liste les PRODUITS réels (ex : « glacières », « gourdes », « accessoires ») pas des catégories générales
2. Pour competitors, extrais les NOMS COMPLETS des entreprises concurrentes (ex : « RTIC », « IGLOO », « Coleman »)
3. Concentre-toi sur ce que l'entreprise fabrique ou vend, pas sur le contenu de ses produits.
`
        : `Extract company information from this website content:

URL: ${normalizedUrl}
Content: ${html}

Extract the company name, a brief description, relevant keywords, and identify the PRIMARY industry category. 

Industry detection rules:
- If the company makes coolers, drinkware, outdoor equipment, camping gear, categorize as "outdoor gear"
- If the company offers web scraping, crawling, data extraction, or HTML parsing tools/services, categorize as "web scraping"
- If the company primarily provides AI/ML models or services, categorize as "AI"
- If the company offers hosting, deployment, or cloud infrastructure, categorize as "deployment"
- If the company is an e-commerce platform or online store builder, categorize as "e-commerce platform"
- If the company sells physical products directly to consumers (clothing, accessories, etc.), categorize as "direct-to-consumer brand"
- If the company is in fashion/apparel/underwear/clothing, categorize as "apparel & fashion"
- If the company provides software tools or APIs, categorize as "developer tools"
- If the company is a marketplace or aggregator, categorize as "marketplace"
- For other B2B software, use "SaaS"
- For other consumer products, use "consumer goods"

IMPORTANT: 
1. For mainProducts, list the ACTUAL PRODUCTS (e.g., "coolers", "tumblers", "drinkware") not product categories
2. For competitors, extract FULL COMPANY NAMES (e.g., "RTIC", "IGLOO", "Coleman") not just initials
3. Focus on what the company MAKES/SELLS, not what goes IN their products (e.g., Yeti makes coolers, not beverages)
`;

    const { object } = await generateObject({
      model,
      schema: CompanyInfoSchema,
      prompt,
    });

    // Extract favicon URL
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace('www.', '');
    const faviconUrl =
      metadata?.favicon ||
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128` ||
      `${urlObj.origin}/favicon.ico`;

    return {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      name: object.name,
      description: object.description,
      industry: object.industry,
      logo: metadata?.ogImage || undefined,
      favicon: faviconUrl,
      scraped: true,
      scrapedData: {
        title: object.name,
        description: object.description,
        keywords: object.keywords,
        mainContent: html || '',
        mainProducts: object.mainProducts,
        competitors: object.competitors,
        ogImage: metadata?.ogImage || undefined,
        favicon: faviconUrl,
      },
    };
  } catch (error) {
    console.error('Error scraping company info:', error);

    // Ensure URL has protocol for fallback
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    // Fallback: extract company name from URL
    const urlObj = new URL(normalizedUrl);
    const domain = urlObj.hostname.replace('www.', '');
    const companyName = domain.split('.')[0];
    const formattedName = companyName.charAt(0).toUpperCase() + companyName.slice(1);

    return {
      id: crypto.randomUUID(),
      url: normalizedUrl,
      name: formattedName,
      description: locale === 'fr'
        ? `Informations sur ${formattedName}`
        : `Information about ${formattedName}`,
      industry: locale === 'fr' ? 'technologie' : 'technology',
      scraped: false,
    };
  }
}
