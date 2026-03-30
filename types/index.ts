export interface HealthMetric {
  score: number;
  explanation: string;
}

export interface HealthMetrics {
  clarity: HealthMetric;
  specificity: HealthMetric;
  structure: HealthMetric;
  examples: HealthMetric;
  constraints: HealthMetric;
  outputFormat: HealthMetric;
}

export interface AdvisoryStrength {
  aspect: string;
  description: string;
  impact?: string;
}

export interface AdvisoryImprovement {
  aspect: string;
  description: string;
  suggestion?: string;
}

export interface AdvisoryMissing {
  aspect: string;
  description: string;
  suggestion?: string;
}

export interface Advisory {
  summary: string;
  strengths: AdvisoryStrength[];
  improvements: AdvisoryImprovement[];
  missing: AdvisoryMissing[];
}

export interface Version {
  id: number;
  prompt: string;
  timestamp: string;
  iteration: number;
  healthMetrics: HealthMetrics | null;
}

export interface AnalyzeRequest {
  prompt: string;
  maxTokens: number;
  model?: string;
}

export interface SuggestionsData {
  analysis: string;
  improvedPrompt: string;
  isContextEnhanced?: boolean;
}

export const METRIC_LABELS: Record<keyof HealthMetrics, string> = {
  clarity: 'Clarity',
  specificity: 'Specificity',
  structure: 'Structure',
  examples: 'Examples',
  constraints: 'Constraints',
  outputFormat: 'Output Format',
};
