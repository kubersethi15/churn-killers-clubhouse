// Chart data types for CS Analyzer visualizations

export interface StakeholderDataPoint {
  id: string;
  x: number; // Sentiment: -5 to +5
  y: number; // Power: 1 to 5
  role: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface RiskDataPoint {
  metric: string;
  value: number; // 0-100
}

export interface SentimentDataPoint {
  id: string;
  value: number;
  color?: string;
}

export interface ActionDataPoint {
  priority: string;
  count: number;
}

export interface ChartInsights {
  summary: string;
  keyMetric?: {
    label: string;
    value: string;
    trend: 'positive' | 'negative' | 'neutral';
  };
}

export interface ChartConfig {
  stakeholderQuadrant: {
    enabled: boolean;
    data: StakeholderDataPoint[];
  };
  riskRadar: {
    enabled: boolean;
    data: RiskDataPoint[];
  };
  sentimentDonut: {
    enabled: boolean;
    data: SentimentDataPoint[];
  };
  actionTimeline: {
    enabled: boolean;
    data: ActionDataPoint[];
  };
  insights: ChartInsights | null;
}

// Brand colors for charts
export const CHART_COLORS = {
  navy: '#1E3A5F',
  navyLight: '#2D4A6F',
  red: '#E63946',
  cream: '#F8F5F0',
  positive: '#10B981',
  neutral: '#6B7280',
  negative: '#EF4444',
  amber: '#F59E0B',
  blue: '#3B82F6',
};

// Sentiment color mapping
export const SENTIMENT_COLORS: Record<string, string> = {
  positive: CHART_COLORS.positive,
  neutral: CHART_COLORS.neutral,
  negative: CHART_COLORS.negative,
  Positive: CHART_COLORS.positive,
  Neutral: CHART_COLORS.neutral,
  Concerning: CHART_COLORS.negative,
};
