'use client';

import { BrandMonitor } from '@/components/brand-monitor/brand-monitor';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Menu, X, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCustomer, useRefreshCustomer } from '@/hooks/useAutumnCustomer';
import { useBrandAnalyses, useBrandAnalysis, useDeleteBrandAnalysis } from '@/hooks/useBrandAnalyses';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { useSession } from '@/lib/auth-client';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useTranslations } from 'next-intl';

// Separate component that uses Autumn hooks
function BrandMonitorContent({ session }: { session: any }) {
  const router = useRouter();
  const t = useTranslations('brandMonitor');
  const { customer, isLoading, error } = useCustomer();
  const refreshCustomer = useRefreshCustomer();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null);

  // Queries and mutations
  const { data: analyses, isLoading: analysesLoading } = useBrandAnalyses();
  const { data: currentAnalysis } = useBrandAnalysis(selectedAnalysisId);
  const deleteAnalysis = useDeleteBrandAnalysis();

  // Get credits from customer data
  const messageUsage = customer?.features?.messages ?? customer?.features?.['pro-messages'] ?? customer?.features?.['free-messages'];
  const credits = messageUsage ? (messageUsage.balance || 0) : 0;

  useEffect(() => {
    // If there's an auth error, redirect to login
    if (error?.code === 'UNAUTHORIZED' || error?.code === 'AUTH_ERROR') {
      router.push('/login');
    }
  }, [error, router]);

  const handleCreditsUpdate = async () => {
    await refreshCustomer();
  };

  const handleDeleteAnalysis = async (analysisId: string) => {
    setAnalysisToDelete(analysisId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (analysisToDelete) {
      await deleteAnalysis.mutateAsync(analysisToDelete);
      if (selectedAnalysisId === analysisToDelete) {
        setSelectedAnalysisId(null);
      }
      setAnalysisToDelete(null);
    }
  };

  const handleNewAnalysis = () => {
    setSelectedAnalysisId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-[calc(100vh-12rem)] relative">
        {/* Sidebar Toggle Button - Always visible */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`absolute top-2 z-10 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 ${
            sidebarOpen ? 'left-[324px]' : 'left-4'
          }`}
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="h-5 w-5 text-gray-600" />
          ) : (
            <Menu className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} bg-white border-r overflow-hidden flex flex-col transition-all duration-200`}>
          <div className="p-4 border-b">
            <Button
              onClick={handleNewAnalysis}
              className="w-full btn-firecrawl-blue"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('sidebar.new')}
            </Button>
          </div>

          <div className="overflow-y-auto flex-1">
            {analysesLoading ? (
              <div className="p-4 text-center text-gray-500">{t('sidebar.loading')}</div>
            ) : analyses?.length === 0 ? (
              <div className="p-4 text-center text-gray-500">{t('sidebar.empty')}</div>
            ) : (
              <div className="space-y-1 p-2">
                {analyses?.map((analysis) => (
                  <div
                    key={analysis.id}
                    className={`p-3 rounded-lg cursor-pointer hover:bg-gray-100 ${
                      selectedAnalysisId === analysis.id ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setSelectedAnalysisId(analysis.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {analysis.companyName || t('analysis.untitled')}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {analysis.url}
                        </p>
                        <p className="text-xs text-gray-400">
                          {analysis.createdAt && format(new Date(analysis.createdAt), t('analysis.dateFormat'))}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAnalysis(analysis.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 sm:px-8 lg:px-12 py-8">
            <BrandMonitor 
              creditsAvailable={credits} 
              onCreditsUpdate={handleCreditsUpdate}
              selectedAnalysis={selectedAnalysisId ? currentAnalysis : null}
              onSaveAnalysis={() => {
                // Optionnel : callback à ajouter ici
              }}
            />
          </div>
        </div>
      </div>

      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t('delete.title')}
        description={t('delete.description')}
        confirmText={t('delete.confirm')}
        cancelText={t('delete.cancel')}
        onConfirm={confirmDelete}
        isLoading={deleteAnalysis.isPending}
      />
    </div>
  );
}

export default function BrandMonitorPage() {
  const { data: session, isPending } = useSession();
  const t = useTranslations('brandMonitor');

  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t('notLoggedIn')}</p>
        </div>
      </div>
    );
  }

  return <BrandMonitorContent session={session} />;
}
