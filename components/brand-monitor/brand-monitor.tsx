"use client";

import React, {
  useReducer,
  useCallback,
  useState,
  useEffect,
  useRef,
} from "react";
import { Company } from "@/lib/types";
import { CREDITS_PER_BRAND_ANALYSIS } from "@/config/constants";
import { ClientApiError } from "@/lib/client-errors";
import {
  brandMonitorReducer,
  initialBrandMonitorState,
  IdentifiedCompetitor,
} from "@/lib/brand-monitor-reducer";
import {
  validateUrl,
  validateCompetitorUrl,
  normalizeCompetitorName,
  assignUrlToCompetitor,
  detectServiceType,
  getIndustryCompetitors,
} from "@/lib/brand-monitor-utils";
import { getEnabledProviders } from "@/lib/provider-config";
import { useSaveBrandAnalysis } from "@/hooks/useBrandAnalyses";
import { useTranslations } from "next-intl";

import { UrlInputSection } from "./url-input-section";
import { CompanyCard } from "./company-card";
import { AnalysisProgressSection } from "./analysis-progress-section";
import { ResultsNavigation } from "./results-navigation";
import { PromptsResponsesTab } from "./prompts-responses-tab";
import { VisibilityScoreTab } from "./visibility-score-tab";
import { ErrorMessage } from "./error-message";
import { AddPromptModal } from "./modals/add-prompt-modal";
import { AddCompetitorModal } from "./modals/add-competitor-modal";
import { ProviderComparisonMatrix } from "./provider-comparison-matrix";
import { ProviderRankingsTabs } from "./provider-rankings-tabs";
import { useSSEHandler } from "./hooks/use-sse-handler";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShuffleIcon } from "lucide-react";
import { usePathname } from "next/navigation";

interface BrandMonitorProps {
  creditsAvailable?: number;
  onCreditsUpdate?: () => void;
  selectedAnalysis?: any;
  onSaveAnalysis?: (analysis: any) => void;
}

export function BrandMonitor({
  creditsAvailable = 0,
  onCreditsUpdate,
  selectedAnalysis,
  onSaveAnalysis,
}: BrandMonitorProps = {}) {
  
  const t = useTranslations('brandMonitor');
  const pathname = usePathname();
  const locale = pathname.split("/")[1] || "en";
  
  const [state, dispatch] = useReducer(
    brandMonitorReducer,
    initialBrandMonitorState,
  );
  const saveAnalysis = useSaveBrandAnalysis();
  const [isLoadingExistingAnalysis, setIsLoadingExistingAnalysis] =
    useState(false);
  const hasSavedRef = useRef(false);

  // Prompts dynamic state
  const [dynamicPromptsLoading, setDynamicPromptsLoading] = useState(false);
  const [dynamicPromptsError, setDynamicPromptsError] = useState<string | null>(
    null,
  );

  const { startSSEConnection } = useSSEHandler({
    state,
    dispatch,
    onCreditsUpdate,
    onAnalysisComplete: (completedAnalysis) => {
      if (!selectedAnalysis && !hasSavedRef.current) {
        hasSavedRef.current = true;
        const analysisData = {
          url: company?.url || url,
          companyName: company?.name,
          industry: company?.industry,
          analysisData: completedAnalysis,
          competitors: identifiedCompetitors,
          prompts: analyzingPrompts,
          creditsUsed: CREDITS_PER_BRAND_ANALYSIS,
        };
        saveAnalysis.mutate(analysisData, {
          onSuccess: (savedAnalysis) => {
            if (onSaveAnalysis) onSaveAnalysis(savedAnalysis);
          },
          onError: () => {
            hasSavedRef.current = false;
          },
        });
      }
    },
  });

  const {
    url,
    urlValid,
    error,
    loading,
    analyzing,
    preparingAnalysis,
    company,
    showInput,
    showCompanyCard,
    showPromptsList,
    showCompetitors,
    customPrompts,
    removedDefaultPrompts,
    identifiedCompetitors,
    availableProviders,
    analysisProgress,
    promptCompletionStatus,
    analyzingPrompts,
    analysis,
    activeResultsTab,
    expandedPromptIndex,
    showAddPromptModal,
    showAddCompetitorModal,
    newPromptText,
    newCompetitorName,
    newCompetitorUrl,
    scrapingCompetitors,
    dynamicPrompts,
  } = state;

  useEffect(() => {
    if (selectedAnalysis && selectedAnalysis.analysisData) {
      setIsLoadingExistingAnalysis(true);
      dispatch({
        type: "SET_ANALYSIS",
        payload: selectedAnalysis.analysisData,
      });
      if (selectedAnalysis.companyName) {
        dispatch({
          type: "SCRAPE_SUCCESS",
          payload: {
            name: selectedAnalysis.companyName,
            url: selectedAnalysis.url,
            industry: selectedAnalysis.industry,
          } as Company,
        });
      }
      setTimeout(() => setIsLoadingExistingAnalysis(false), 100);
    } else if (selectedAnalysis === null) {
      dispatch({ type: "RESET_STATE" });
      hasSavedRef.current = false;
      setIsLoadingExistingAnalysis(false);
    }
  }, [selectedAnalysis]);

  // Generate prompts using API (dynamic)
  const generateDynamicPrompts = useCallback(async (companyObj: Company) => {
    setDynamicPromptsLoading(true);
    setDynamicPromptsError(null);
    try {
      const res = await fetch("/api/brand-monitor/generate-prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: companyObj.name,
          sector: companyObj.industry,
          description: companyObj.description || "",
          products: companyObj.scrapedData?.products?.join(", ") || "",
          competitors: companyObj.scrapedData?.competitors || [],
          locale,
        }),
      });
      if (!res.ok) throw new Error("Failed to generate dynamic prompts");
      const data = await res.json();
      if (Array.isArray(data.prompts)) {
        dispatch({ type: "SET_DYNAMIC_PROMPTS", payload: data.prompts });
      }
    } catch (err: any) {
      setDynamicPromptsError(t('errors.couldNotGenerateSuggestions'));
    } finally {
      setDynamicPromptsLoading(false);
    }
  }, [t]);

  const handleUrlChange = useCallback(
    (newUrl: string) => {
      dispatch({ type: "SET_URL", payload: newUrl });
      if (error) dispatch({ type: "SET_ERROR", payload: null });
      if (newUrl.length > 0) {
        const isValid = validateUrl(newUrl);
        dispatch({ type: "SET_URL_VALID", payload: isValid });
      } else {
        dispatch({ type: "SET_URL_VALID", payload: null });
      }
    },
    [error],
  );

  const handleScrape = useCallback(async () => {
    if (!url) {
      dispatch({ type: "SET_ERROR", payload: t('errors.enterUrl') });
      return;
    }
    if (!validateUrl(url)) {
      dispatch({
        type: "SET_ERROR",
        payload: t('errors.validUrlExample'),
      });
      dispatch({ type: "SET_URL_VALID", payload: false });
      return;
    }
    if (creditsAvailable < 1) {
      dispatch({
        type: "SET_ERROR",
        payload: t('errors.insufficientCredits'),
      });
      return;
    }
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    dispatch({ type: "SET_URL_VALID", payload: true });
    try {
      const response = await fetch("/api/brand-monitor/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          maxAge: 7 * 24 * 60 * 60 * 1000,
          locale,
        }),
      });
      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (errorData.error?.message) throw new ClientApiError(errorData);
          throw new Error(errorData.error || "Failed to scrape");
        } catch (e) {
          if (e instanceof ClientApiError) throw e;
          throw new Error("Failed to scrape");
        }
      }
      const data = await response.json();
      if (!data.company) throw new Error("No company data received");
      if (onCreditsUpdate) onCreditsUpdate();
      dispatch({ type: "SET_SHOW_INPUT", payload: false });
      setTimeout(() => {
        dispatch({ type: "SCRAPE_SUCCESS", payload: data.company });
        if (data.company) generateDynamicPrompts(data.company);
        setTimeout(() => {
          dispatch({ type: "SET_SHOW_COMPANY_CARD", payload: true });
        }, 50);
      }, 500);
    } catch (error: any) {
      let errorMessage = t('errors.failedToExtract');
      if (error instanceof ClientApiError)
        errorMessage = error.getUserMessage();
      else if (error.message)
        errorMessage = `${t('errors.failedToExtract')}: ${error.message}`;
      dispatch({ type: "SET_ERROR", payload: errorMessage });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [url, creditsAvailable, onCreditsUpdate, generateDynamicPrompts, t]);

  const handlePrepareAnalysis = useCallback(async () => {
    if (!company) return;
    dispatch({ type: "SET_PREPARING_ANALYSIS", payload: true });
    try {
      const response = await fetch("/api/brand-monitor/check-providers", {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        dispatch({
          type: "SET_AVAILABLE_PROVIDERS",
          payload: data.providers || ["OpenAI", "Anthropic", "Google"],
        });
      }
    } catch (e) {
      const defaultProviders = [];
      if (process.env.NEXT_PUBLIC_HAS_OPENAI_KEY)
        defaultProviders.push("OpenAI");
      if (process.env.NEXT_PUBLIC_HAS_ANTHROPIC_KEY)
        defaultProviders.push("Anthropic");
      dispatch({
        type: "SET_AVAILABLE_PROVIDERS",
        payload:
          defaultProviders.length > 0
            ? defaultProviders
            : ["OpenAI", "Anthropic"],
      });
    }
    const extractedCompetitors = company.scrapedData?.competitors || [];
    const industryCompetitors = getIndustryCompetitors(company.industry || "");
    const competitorMap = new Map<string, IdentifiedCompetitor>();
    industryCompetitors.forEach((comp) => {
      const normalizedName = normalizeCompetitorName(comp.name);
      competitorMap.set(normalizedName, comp as IdentifiedCompetitor);
    });
    extractedCompetitors.forEach((name) => {
      const normalizedName = normalizeCompetitorName(name);
      const existing = competitorMap.get(normalizedName);
      if (existing) {
        if (!existing.url) {
          const url = assignUrlToCompetitor(name);
          competitorMap.set(normalizedName, { name, url });
        }
        return;
      }
      const url = assignUrlToCompetitor(name);
      competitorMap.set(normalizedName, { name, url });
    });
    let competitors = Array.from(competitorMap.values())
      .filter((comp) => !/^Competitor [1-5]$/.test(comp.name))
      .slice(0, 6);
    dispatch({ type: "SET_IDENTIFIED_COMPETITORS", payload: competitors });
    dispatch({ type: "SET_SHOW_COMPETITORS", payload: true });
    dispatch({ type: "SET_PREPARING_ANALYSIS", payload: false });
  }, [company]);

  const handleProceedToPrompts = useCallback(() => {
    const currentView = document.querySelector(".animate-panel-in");
    if (currentView) currentView.classList.add("opacity-0");
    setTimeout(() => {
      dispatch({ type: "SET_SHOW_COMPETITORS", payload: false });
      dispatch({ type: "SET_SHOW_PROMPTS_LIST", payload: true });
    }, 300);
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!company) return;
    hasSavedRef.current = false;
    if (creditsAvailable < CREDITS_PER_BRAND_ANALYSIS) {
      dispatch({
        type: "SET_ERROR",
        payload: t('errors.insufficientCreditsAnalysis', { credits: CREDITS_PER_BRAND_ANALYSIS }),
      });
      return;
    }
    if (onCreditsUpdate) onCreditsUpdate();
    const normalizedPrompts =
      state.dynamicPrompts && state.dynamicPrompts.length > 0
        ? state.dynamicPrompts.map((p) => p.trim())
        : [
            ...[
              t('defaultPrompts.best', { type: detectServiceType(company), year: new Date().getFullYear() }),
              t('defaultPrompts.topStartups', { type: detectServiceType(company) }),
              t('defaultPrompts.popular', { type: detectServiceType(company) }),
              t('defaultPrompts.recommended', { type: detectServiceType(company) }),
            ].filter(
              (_, index) => !state.removedDefaultPrompts.includes(index),
            ),
            ...state.customPrompts,
          ].map((p) => p.trim());
    dispatch({ type: "SET_ANALYZING_PROMPTS", payload: normalizedPrompts });
    dispatch({ type: "SET_ANALYZING", payload: true });
    dispatch({
      type: "SET_ANALYSIS_PROGRESS",
      payload: {
        stage: "initializing",
        progress: 0,
        message: t('progress.startingAnalysis'),
        competitors: [],
        prompts: [],
        partialResults: [],
      },
    });
    dispatch({ type: "SET_ANALYSIS_TILES", payload: [] });
    const initialStatus: any = {};
    const expectedProviders = getEnabledProviders().map(
      (config) => config.name,
    );
    normalizedPrompts.forEach((prompt) => {
      initialStatus[prompt] = {};
      expectedProviders.forEach((provider) => {
        initialStatus[prompt][provider] = "pending";
      });
    });
    dispatch({ type: "SET_PROMPT_COMPLETION_STATUS", payload: initialStatus });
    try {
      await startSSEConnection("/api/brand-monitor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          prompts: normalizedPrompts,
          competitors: identifiedCompetitors,
        }),
      });
    } finally {
      dispatch({ type: "SET_ANALYZING", payload: false });
    }
  }, [
    company,
    creditsAvailable,
    onCreditsUpdate,
    state.dynamicPrompts,
    state.removedDefaultPrompts,
    state.customPrompts,
    startSSEConnection,
    identifiedCompetitors,
    t,
  ]);

  const handleRestart = useCallback(() => {
    dispatch({ type: "RESET_STATE" });
    hasSavedRef.current = false;
    setIsLoadingExistingAnalysis(false);
  }, []);

  // Pour Info: defaultPrompts localisés
  const serviceType = detectServiceType(company);
  const currentYear = new Date().getFullYear();
  const defaultPrompts = [
    t('defaultPrompts.best', { type: serviceType, year: currentYear }),
    t('defaultPrompts.topStartups', { type: serviceType }),
    t('defaultPrompts.popular', { type: serviceType }),
    t('defaultPrompts.recommended', { type: serviceType }),
  ].filter((_, index) => !removedDefaultPrompts.includes(index));
  const allPrompts = [...defaultPrompts, ...customPrompts];
  const promptsToShow =
    dynamicPrompts && dynamicPrompts.length > 0
      ? dynamicPrompts
      : allPrompts.map((p) => p.trim());

  const brandData = analysis?.competitors?.find((c) => c.isOwn);

  return (
    <div className="flex flex-col">
      {showInput && (
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <UrlInputSection
              url={url}
              urlValid={urlValid}
              loading={loading}
              analyzing={analyzing}
              onUrlChange={handleUrlChange}
              onSubmit={handleScrape}
            />
          </div>
        </div>
      )}

      {!showInput && company && !showPromptsList && !analyzing && !analysis && (
        <div className="flex items-center justify-center animate-panel-in">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="w-full space-y-6">
              <div
                className={`transition-all duration-500 ${showCompanyCard ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              >
                <CompanyCard
                  company={company}
                  onAnalyze={handlePrepareAnalysis}
                  analyzing={preparingAnalysis}
                  showCompetitors={showCompetitors}
                  identifiedCompetitors={identifiedCompetitors}
                  onRemoveCompetitor={(idx) =>
                    dispatch({ type: "REMOVE_COMPETITOR", payload: idx })
                  }
                  onAddCompetitor={() => {
                    dispatch({
                      type: "TOGGLE_MODAL",
                      payload: { modal: "addCompetitor", show: true },
                    });
                    dispatch({
                      type: "SET_NEW_COMPETITOR",
                      payload: { name: "", url: "" },
                    });
                  }}
                  onContinueToAnalysis={handleProceedToPrompts}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showPromptsList && company && !analysis && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => generateDynamicPrompts(company)}
            disabled={dynamicPromptsLoading}
            className="ml-2 p-2 rounded hover:bg-gray-100"
            title={t('actions.randomizePrompts')}
          >
            <ShuffleIcon className="w-4 h-4" />
          </button>
          {dynamicPromptsLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <span className="text-gray-500 text-md mb-2">
                {t('loading.generatingSuggestions')}
              </span>
            </div>
          ) : (
            <AnalysisProgressSection
              company={company}
              analyzing={analyzing}
              identifiedCompetitors={identifiedCompetitors}
              scrapingCompetitors={scrapingCompetitors}
              analysisProgress={analysisProgress}
              prompts={promptsToShow}
              customPrompts={customPrompts}
              removedDefaultPrompts={removedDefaultPrompts}
              promptCompletionStatus={promptCompletionStatus}
              onRemoveDefaultPrompt={(index) =>
                dispatch({ type: "REMOVE_DEFAULT_PROMPT", payload: index })
              }
              onRemoveCustomPrompt={(prompt) => {
                dispatch({
                  type: "SET_CUSTOM_PROMPTS",
                  payload: customPrompts.filter((p) => p !== prompt),
                });
              }}
              onAddPromptClick={() => {
                dispatch({
                  type: "TOGGLE_MODAL",
                  payload: { modal: "addPrompt", show: true },
                });
                dispatch({ type: "SET_NEW_PROMPT_TEXT", payload: "" });
              }}
              onStartAnalysis={handleAnalyze}
              detectServiceType={detectServiceType}
            />
          )}
          {dynamicPromptsError && (
            <div className="text-sm text-red-600 pt-4">
              {dynamicPromptsError}
            </div>
          )}
        </div>
      )}

      {analysis && brandData && (
        <div className="flex-1 flex justify-center animate-panel-in pt-8">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex gap-6 relative">
              <ResultsNavigation
                activeTab={activeResultsTab}
                onTabChange={(tab) =>
                  dispatch({ type: "SET_ACTIVE_RESULTS_TAB", payload: tab })
                }
                onRestart={handleRestart}
              />
              <div className="flex-1 flex flex-col">
                <div className="w-full flex-1 flex flex-col">
                  {activeResultsTab === "visibility" && (
                    <VisibilityScoreTab
                      competitors={analysis.competitors}
                      brandData={brandData}
                      identifiedCompetitors={identifiedCompetitors}
                    />
                  )}
                  {activeResultsTab === "matrix" && (
                    <Card className="p-2 bg-card text-card-foreground gap-6 rounded-xl border py-6 shadow-sm border-gray-200 h-full flex flex-col">
                      <CardHeader className="border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-xl font-semibold">
                              {t("matrix.title")}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 mt-1">
                              {t("matrix.description")}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {brandData.visibilityScore}%
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("matrix.averageScore")}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 overflow-auto">
                        {analysis.providerComparison ? (
                          <ProviderComparisonMatrix
                            data={analysis.providerComparison}
                            brandName={company?.name || ""}
                            competitors={identifiedCompetitors}
                          />
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <p>{t("matrix.noData")}</p>
                            <p className="text-sm mt-2">
                              {t("matrix.noDataDescription")}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                  {activeResultsTab === "rankings" &&
                    analysis.providerRankings && (
                      <div id="provider-rankings" className="h-full">
                        <ProviderRankingsTabs
                          providerRankings={analysis.providerRankings}
                          brandName={company?.name || t('brandNameDefault')}
                          shareOfVoice={brandData.shareOfVoice}
                          averagePosition={Math.round(
                            brandData.averagePosition,
                          )}
                          sentimentScore={brandData.sentimentScore}
                          weeklyChange={brandData.weeklyChange}
                        />
                      </div>
                    )}
                  {activeResultsTab === "prompts" && analysis.prompts && (
                    <Card className="p-2 bg-card text-card-foreground gap-6 rounded-xl border py-6 shadow-sm border-gray-200 h-full flex flex-col">
                      <CardHeader className="border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-xl font-semibold">
                              {t("promptsResponses.title")}
                            </CardTitle>
                            <CardDescription className="text-sm text-gray-600 mt-1">
                              {t("promptsResponses.description")}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-blue-600">
                              {analysis.prompts.length}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {t("promptsResponses.totalPrompts")}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 flex-1 overflow-auto">
                        <PromptsResponsesTab
                          prompts={analysis.prompts}
                          responses={analysis.responses}
                          expandedPromptIndex={expandedPromptIndex}
                          onToggleExpand={(index) =>
                            dispatch({
                              type: "SET_EXPANDED_PROMPT_INDEX",
                              payload: index,
                            })
                          }
                          brandName={analysis.company?.name || ""}
                          competitors={
                            analysis.competitors?.map((c) => c.name) || []
                          }
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <ErrorMessage
          error={error}
          onDismiss={() => dispatch({ type: "SET_ERROR", payload: null })}
        />
      )}

      <AddPromptModal
        isOpen={showAddPromptModal}
        promptText={newPromptText}
        onPromptTextChange={(text) =>
          dispatch({ type: "SET_NEW_PROMPT_TEXT", payload: text })
        }
        onAdd={() => {
          if (newPromptText.trim()) {
            dispatch({
              type: "ADD_CUSTOM_PROMPT",
              payload: newPromptText.trim(),
            });
            dispatch({
              type: "TOGGLE_MODAL",
              payload: { modal: "addPrompt", show: false },
            });
            dispatch({ type: "SET_NEW_PROMPT_TEXT", payload: "" });
          }
        }}
        onClose={() => {
          dispatch({
            type: "TOGGLE_MODAL",
            payload: { modal: "addPrompt", show: false },
          });
          dispatch({ type: "SET_NEW_PROMPT_TEXT", payload: "" });
        }}
      />

      <AddCompetitorModal
        isOpen={showAddCompetitorModal}
        competitorName={newCompetitorName}
        competitorUrl={newCompetitorUrl}
        onNameChange={(name) =>
          dispatch({ type: "SET_NEW_COMPETITOR", payload: { name } })
        }
        onUrlChange={(url) =>
          dispatch({ type: "SET_NEW_COMPETITOR", payload: { url } })
        }
        onAdd={async () => {
          if (newCompetitorName.trim()) {
            const rawUrl = newCompetitorUrl.trim();
            const validatedUrl = rawUrl
              ? validateCompetitorUrl(rawUrl)
              : undefined;
            const newCompetitor: IdentifiedCompetitor = {
              name: newCompetitorName.trim(),
              url: validatedUrl,
            };
            dispatch({ type: "ADD_COMPETITOR", payload: newCompetitor });
            dispatch({
              type: "TOGGLE_MODAL",
              payload: { modal: "addCompetitor", show: false },
            });
            dispatch({
              type: "SET_NEW_COMPETITOR",
              payload: { name: "", url: "" },
            });
          }
        }}
        onClose={() => {
          dispatch({
            type: "TOGGLE_MODAL",
            payload: { modal: "addCompetitor", show: false },
          });
          dispatch({
            type: "SET_NEW_COMPETITOR",
            payload: { name: "", url: "" },
          });
        }}
      />
    </div>
  );
}
