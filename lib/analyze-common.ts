import { AIResponse, AnalysisProgressData, Company, PartialResultData, ProgressData, PromptGeneratedData, ScoringProgressData, SSEEvent } from './types';
import { generatePromptsForCompany, analyzePromptWithProvider, calculateBrandScores, analyzeCompetitors, identifyCompetitors, analyzeCompetitorsByProvider } from './ai-utils';
import { analyzePromptWithProvider as analyzePromptWithProviderEnhanced } from './ai-utils-enhanced';
import { getConfiguredProviders } from './provider-config';

export interface AnalysisConfig {
  company: Company;
  customPrompts?: string[];
  userSelectedCompetitors?: { name: string }[];
  useWebSearch?: boolean;
  sendEvent: (event: SSEEvent) => Promise<void>;
  locale: string; 
}

export interface AnalysisResult {
  company: Company;
  knownCompetitors: string[];
  prompts: any[];
  responses: AIResponse[];
  scores: any;
  competitors: any[];
  providerRankings: any;
  providerComparison: any;
  errors?: string[];
  webSearchUsed?: boolean;
}

// Fonction utilitaire pour charger les messages
function getMessages(locale: string) {
  try {
    // Dynamique selon le contexte, adapte si besoin
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`@/messages/${locale}.json`);
  } catch (e) {
    // fallback en anglais si non trouvé
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(`@/messages/en.json`);
  }
}

// Fonction utilitaire pour la traduction/interpolation
function t(messages: any, key: string, params: Record<string, any> = {}) {
  // Récupération par clé imbriquée (ex: "analysis.generatingPrompts")
  let str = key.split('.').reduce((acc, cur) => acc?.[cur], messages) || key;
  Object.keys(params).forEach(param => {
    str = str.replace(`{${param}}`, params[param]);
  });
  return str;
}

export async function performAnalysis({
  company,
  customPrompts,
  userSelectedCompetitors,
  useWebSearch = false,
  sendEvent,
  locale
}: AnalysisConfig): Promise<AnalysisResult> {
  const messages = getMessages(locale);

  // 1. Analyse start
  await sendEvent({
    type: 'start',
    stage: 'initializing',
    data: { 
      message: t(messages, "analysis.starting", {
        company: company.name,
        withWebSearch: useWebSearch ? t(messages, "analysis.withWebSearch") : ""
      })
    } as ProgressData,
    timestamp: new Date()
  });

  // 2. Identify competitors
  await sendEvent({
    type: 'stage',
    stage: 'identifying-competitors',
    data: { 
      stage: 'identifying-competitors',
      progress: 0,
      message: t(messages, "analysis.identifyingCompetitors")
    } as ProgressData,
    timestamp: new Date()
  });

  // Use user-selected competitors if provided, otherwise identify them
  let competitors: string[];
  if (userSelectedCompetitors && userSelectedCompetitors.length > 0) {
    competitors = userSelectedCompetitors.map(c => c.name);
    for (let i = 0; i < competitors.length; i++) {
      await sendEvent({
        type: 'competitor-found',
        stage: 'identifying-competitors',
        data: { 
          competitor: competitors[i],
          index: i + 1,
          total: competitors.length
        },
        timestamp: new Date()
      });
    }
  } else {
    competitors = await identifyCompetitors(company, sendEvent);
  }

  // 3. Generate prompts
  await sendEvent({
    type: 'stage',
    stage: 'generating-prompts',
    data: {
      stage: 'generating-prompts',
      progress: 0,
      message: t(messages, "analysis.generatingPrompts")
    } as ProgressData,
    timestamp: new Date()
  });

  let analysisPrompts;
  if (customPrompts && customPrompts.length > 0) {
    analysisPrompts = customPrompts.map((prompt: string, index: number) => ({
      id: `custom-${index}`,
      prompt,
      category: 'custom' as const
    }));
  } else {
    const prompts = await generatePromptsForCompany(company, competitors);
    analysisPrompts = prompts.slice(0, 4); // ou configurable selon besoin
  }

  // Prompts events
  for (let i = 0; i < analysisPrompts.length; i++) {
    await sendEvent({
      type: 'prompt-generated',
      stage: 'generating-prompts',
      data: {
        prompt: analysisPrompts[i].prompt,
        category: analysisPrompts[i].category,
        index: i + 1,
        total: analysisPrompts.length
      } as PromptGeneratedData,
      timestamp: new Date()
    });
  }

  // 4. Analyze with AI providers
  await sendEvent({
    type: 'stage',
    stage: 'analyzing-prompts',
    data: {
      stage: 'analyzing-prompts',
      progress: 0,
      message: t(messages, "analysis.startingAIAnalysis", {
        withWebSearch: useWebSearch ? t(messages, "analysis.withWebSearch") : ""
      })
    } as ProgressData,
    timestamp: new Date()
  });

  const responses: AIResponse[] = [];
  const errors: string[] = [];
  
  const availableProviders = getAvailableProviders();
  const useMockMode = process.env.USE_MOCK_MODE === 'true' || availableProviders.length === 0;

  const BATCH_SIZE = 3;
  const totalAnalyses = analysisPrompts.length * availableProviders.length;
  let completedAnalyses = 0;

  for (let batchStart = 0; batchStart < analysisPrompts.length; batchStart += BATCH_SIZE) {
    const batchEnd = Math.min(batchStart + BATCH_SIZE, analysisPrompts.length);
    const batchPrompts = analysisPrompts.slice(batchStart, batchEnd);

    const batchPromises = batchPrompts.flatMap((prompt, batchIndex) => 
      availableProviders.map(async (provider) => {
        const promptIndex = batchStart + batchIndex;

        await sendEvent({
          type: 'analysis-start',
          stage: 'analyzing-prompts',
          data: {
            provider: provider.name,
            prompt: prompt.prompt,
            promptIndex: promptIndex + 1,
            totalPrompts: analysisPrompts.length,
            providerIndex: 0,
            totalProviders: availableProviders.length,
            status: 'started'
          } as AnalysisProgressData,
          timestamp: new Date()
        });

        try {
          const analyzeFunction = useWebSearch ? analyzePromptWithProviderEnhanced : analyzePromptWithProvider;
          const response = await analyzeFunction(
            prompt.prompt, 
            provider.name, 
            company.name, 
            competitors,
            useMockMode,
            ...(useWebSearch ? [true] : []) // web search flag
          );

          if (response === null) {
            await sendEvent({
              type: 'analysis-complete',
              stage: 'analyzing-prompts',
              data: {
                provider: provider.name,
                prompt: prompt.prompt,
                promptIndex: promptIndex + 1,
                totalPrompts: analysisPrompts.length,
                providerIndex: 0,
                totalProviders: availableProviders.length,
                status: 'failed'
              } as AnalysisProgressData,
              timestamp: new Date()
            });
            return;
          }

          if (useMockMode) {
            await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
          }

          responses.push(response);

          await sendEvent({
            type: 'partial-result',
            stage: 'analyzing-prompts',
            data: {
              provider: provider.name,
              prompt: prompt.prompt,
              response: {
                provider: response.provider,
                brandMentioned: response.brandMentioned,
                brandPosition: response.brandPosition,
                sentiment: response.sentiment
              }
            } as PartialResultData,
            timestamp: new Date()
          });

          await sendEvent({
            type: 'analysis-complete',
            stage: 'analyzing-prompts',
            data: {
              provider: provider.name,
              prompt: prompt.prompt,
              promptIndex: promptIndex + 1,
              totalPrompts: analysisPrompts.length,
              providerIndex: 0,
              totalProviders: availableProviders.length,
              status: 'completed'
            } as AnalysisProgressData,
            timestamp: new Date()
          });

        } catch (error) {
          errors.push(`${provider.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);

          await sendEvent({
            type: 'analysis-complete',
            stage: 'analyzing-prompts',
            data: {
              provider: provider.name,
              prompt: prompt.prompt,
              promptIndex: promptIndex + 1,
              totalPrompts: analysisPrompts.length,
              providerIndex: 0,
              totalProviders: availableProviders.length,
              status: 'failed'
            } as AnalysisProgressData,
            timestamp: new Date()
          });
        }

        completedAnalyses++;
        const progress = Math.round((completedAnalyses / totalAnalyses) * 100);

        await sendEvent({
          type: 'progress',
          stage: 'analyzing-prompts',
          data: {
            stage: 'analyzing-prompts',
            progress,
            message: t(messages, "analysis.completedAnalyses", {
              completed: completedAnalyses,
              total: totalAnalyses
            })
          } as ProgressData,
          timestamp: new Date()
        });
      })
    );

    await Promise.all(batchPromises);
  }

  // 5. Calculate scores
  await sendEvent({
    type: 'stage',
    stage: 'calculating-scores',
    data: {
      stage: 'calculating-scores',
      progress: 0,
      message: t(messages, "analysis.calculatingScores")
    } as ProgressData,
    timestamp: new Date()
  });

  const competitorRankings = await analyzeCompetitors(company, responses, competitors);

  for (let i = 0; i < competitorRankings.length; i++) {
    await sendEvent({
      type: 'scoring-start',
      stage: 'calculating-scores',
      data: {
        competitor: competitorRankings[i].name,
        score: competitorRankings[i].visibilityScore,
        index: i + 1,
        total: competitorRankings.length
      } as ScoringProgressData,
      timestamp: new Date()
    });
  }

  const { providerRankings, providerComparison } = await analyzeCompetitorsByProvider(
    company, 
    responses, 
    competitors
  );

  const scores = calculateBrandScores(responses, company.name, competitorRankings);

  await sendEvent({
    type: 'progress',
    stage: 'calculating-scores',
    data: {
      stage: 'calculating-scores',
      progress: 100,
      message: t(messages, "analysis.scoringComplete")
    } as ProgressData,
    timestamp: new Date()
  });

  // 6. Finalize
  await sendEvent({
    type: 'stage',
    stage: 'finalizing',
    data: {
      stage: 'finalizing',
      progress: 100,
      message: t(messages, "analysis.analysisComplete")
    } as ProgressData,
    timestamp: new Date()
  });

  return {
    company,
    knownCompetitors: competitors,
    prompts: analysisPrompts,
    responses,
    scores,
    competitors: competitorRankings,
    providerRankings,
    providerComparison,
    errors: errors.length > 0 ? errors : undefined,
    webSearchUsed: useWebSearch,
  };
}

export function getAvailableProviders() {
  const configuredProviders = getConfiguredProviders();
  return configuredProviders.map(provider => ({
    name: provider.name,
    model: provider.defaultModel,
    icon: provider.icon,
  }));
}

export function createSSEMessage(event: SSEEvent): string {
  const lines: string[] = [];
  if (event.type) {
    lines.push(`event: ${event.type}`);
  }
  lines.push(`data: ${JSON.stringify(event)}`);
  lines.push('');
  lines.push('');
  return lines.join('\n');
}
