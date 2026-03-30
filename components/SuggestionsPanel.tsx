'use client';

import React from 'react';
import type { SuggestionsData } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface SuggestionsPanelProps {
  data: SuggestionsData | null;
  isLoading: boolean;
  error: string | null;
  hasHealthMetrics: boolean;
  onApply: (prompt: string) => void;
  onApplyAndReOptimize: (prompt: string) => void;
  onApplyAndRetest: (prompt: string) => void;
}

export default function SuggestionsPanel({
  data,
  isLoading,
  error,
  hasHealthMetrics,
  onApply,
  onApplyAndReOptimize,
  onApplyAndRetest,
}: SuggestionsPanelProps) {
  if (isLoading) {
    return (
      <div className="suggestions">
        <div className="suggestion-title">
          <LoadingSpinner />
          {data?.isContextEnhanced
            ? 'Enhancing prompt with your context...'
            : 'Analyzing and improving prompt...'}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="suggestions">
        <div className="suggestion-title">⚠️ Could not generate improvements</div>
        <div className="suggestion-item">Error: {error}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">💡</div>
        <p>Click &quot;Optimize Prompt&quot; to get AI-powered improvements</p>
      </div>
    );
  }

  return (
    <>
      <div className="suggestions">
        <div className="suggestion-title">
          {data.isContextEnhanced ? '🎯 Context-Enhanced Improvements' : '🔍 Analysis'}
        </div>
        <div className="suggestion-item" style={{ whiteSpace: 'pre-wrap' }}>
          {data.analysis}
        </div>
      </div>

      {data.improvedPrompt && (
        <div className="suggestions">
          <div className="suggestion-title">
            {data.isContextEnhanced
              ? '✨ Enhanced Prompt (Tailored to Your Use Case)'
              : `✨ Improved Prompt ${hasHealthMetrics ? '(Targeting Health Scores)' : ''}`}
          </div>
          <div
            className="suggestion-item"
            style={{
              whiteSpace: 'pre-wrap',
              background: '#0a2a0a',
              border: '1px solid #1a4a1a',
            }}
          >
            {data.improvedPrompt}
          </div>
          <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
            <button
              className="button button-primary"
              onClick={() => onApply(data.improvedPrompt)}
            >
              {data.isContextEnhanced ? '✓ Apply Enhanced Prompt' : '✓ Apply This Prompt'}
            </button>
            <button
              className="button button-secondary"
              onClick={() =>
                data.isContextEnhanced
                  ? onApplyAndRetest(data.improvedPrompt)
                  : onApplyAndReOptimize(data.improvedPrompt)
              }
            >
              {data.isContextEnhanced ? 'Apply & Re-test' : 'Apply & Re-optimize'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
