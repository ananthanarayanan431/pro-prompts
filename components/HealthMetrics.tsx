'use client';

import React from 'react';
import type { HealthMetrics as HealthMetricsType } from '@/types';
import { getScoreClass } from '@/hooks/usePromptOptimizer';
import LoadingSpinner from './LoadingSpinner';

interface HealthMetricsProps {
  metrics: HealthMetricsType | null;
  overallScore: number | null;
  isLoading: boolean;
  isPlateauing: boolean;
  visible: boolean;
}

const METRIC_LABELS: Record<keyof HealthMetricsType, string> = {
  clarity: 'Clarity',
  specificity: 'Specificity',
  structure: 'Structure',
  examples: 'Examples',
  constraints: 'Constraints',
  outputFormat: 'Output Format',
};

export default function HealthMetrics({
  metrics,
  overallScore,
  isLoading,
  isPlateauing,
  visible,
}: HealthMetricsProps) {
  if (!visible) return null;

  return (
    <div className="health-section" style={{ marginTop: '20px' }}>
      <div className="health-header">
        <div className="health-title">📊 Prompt Health</div>
        <div
          className={`health-score-badge ${overallScore !== null ? getScoreClass(overallScore) : ''}`}
          id="overallScore"
        >
          {overallScore !== null ? (
            <>
              {overallScore}
              {isPlateauing && (
                <span className="plateau-badge">📊 Plateauing</span>
              )}
            </>
          ) : (
            '--'
          )}
        </div>
      </div>
      <div className="health-metrics" id="healthMetrics">
        {isLoading ? (
          <div className="health-loading" style={{ gridColumn: '1 / -1' }}>
            <LoadingSpinner />
            <div style={{ fontSize: '13px', marginTop: '12px' }}>
              Analyzing prompt structure, clarity, specificity...
            </div>
          </div>
        ) : metrics ? (
          (Object.entries(metrics) as [keyof HealthMetricsType, { score: number; explanation: string }][]).map(
            ([key, value]) => {
              const scoreClass = getScoreClass(value.score);
              return (
                <div className="health-metric" key={key}>
                  <div className="health-metric-header">
                    <span className="health-metric-name">{METRIC_LABELS[key]}</span>
                    <span className={`health-metric-score ${scoreClass}`}>{value.score}</span>
                  </div>
                  <div className="health-bar">
                    <div
                      className={`health-bar-fill ${scoreClass}`}
                      style={{ width: `${value.score}%` }}
                    />
                  </div>
                  <div className="health-metric-description">{value.explanation}</div>
                </div>
              );
            }
          )
        ) : null}
      </div>
    </div>
  );
}
