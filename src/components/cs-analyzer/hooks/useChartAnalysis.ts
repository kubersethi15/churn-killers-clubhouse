import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ChartConfig } from '../charts/types';

interface UseChartAnalysisOptions {
  analysisResult: string;
  scenario?: string;
  enabled?: boolean;
}

export const useChartAnalysis = ({ analysisResult, scenario, enabled = true }: UseChartAnalysisOptions) => {
  const [charts, setCharts] = useState<ChartConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !analysisResult || analysisResult.length < 100) {
      return;
    }

    const fetchChartData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('Fetching chart analysis...');
        const { data, error: fnError } = await supabase.functions.invoke('chart-analyzer', {
          body: { analysisReport: analysisResult, scenario },
        });

        if (fnError) {
          console.error('Chart analyzer error:', fnError);
          setError(fnError.message);
          return;
        }

        if (data?.charts) {
          console.log('Chart data received:', Object.keys(data.charts).filter(k => data.charts[k]?.enabled));
          setCharts(data.charts);
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [analysisResult, scenario, enabled]);

  return { charts, isLoading, error };
};
