'use client';

import React from 'react';
import type { Advisory } from '@/types';
import LoadingSpinner from './LoadingSpinner';

interface AdvisoryPanelProps {
  advisory: Advisory | null;
  isLoading: boolean;
  error: string | null;
  visible: boolean;
  onRefresh: () => void;
}

export default function AdvisoryPanel({
  advisory,
  isLoading,
  error,
  visible,
  onRefresh,
}: AdvisoryPanelProps) {
  if (!visible) return null;

  const strengthCount = advisory?.strengths?.length || 0;
  const improvementCount = advisory?.improvements?.length || 0;
  const missingCount = advisory?.missing?.length || 0;

  return (
    <div className="advisory-section" id="promptAdvisory">
      <div className="advisory-header">
        <div className="advisory-title">🎓 Prompt Advisory</div>
        <button
          className="button button-secondary"
          onClick={onRefresh}
          disabled={isLoading}
          id="advisoryButton"
          style={{ padding: '6px 14px', fontSize: '12px' }}
        >
          {isLoading ? (
            <>
              <LoadingSpinner /> Analyzing...
            </>
          ) : (
            'Refresh Analysis'
          )}
        </button>
      </div>
      <div id="advisoryContent">
        {isLoading ? (
          <div className="advisory-loading">
            <LoadingSpinner />
            <div style={{ fontSize: '13px', marginTop: '12px' }}>
              Performing deep analysis of your prompt...
            </div>
          </div>
        ) : error ? (
          <div className="advisory-loading">
            <div style={{ color: '#f87171' }}>⚠️ Analysis failed: {error}</div>
          </div>
        ) : advisory ? (
          <>
            <div className="advisory-summary">
              <div className="advisory-summary-title">📋 Overall Assessment</div>
              <div className="advisory-summary-text">{advisory.summary}</div>
            </div>

            <div className="advisory-stats">
              <div className="advisory-stat">
                <div className="advisory-stat-value strength">{strengthCount}</div>
                <div className="advisory-stat-label">Strengths</div>
              </div>
              <div className="advisory-stat">
                <div className="advisory-stat-value improvement">{improvementCount}</div>
                <div className="advisory-stat-label">Can Improve</div>
              </div>
              <div className="advisory-stat">
                <div className="advisory-stat-value missing">{missingCount}</div>
                <div className="advisory-stat-label">Missing</div>
              </div>
            </div>

            {strengthCount > 0 && (
              <div className="advisory-category">
                <div className="advisory-category-header">
                  <div className="advisory-category-icon strength">✓</div>
                  <div className="advisory-category-title">Strengths (What&apos;s Working Well)</div>
                </div>
                <div className="advisory-items">
                  {advisory.strengths.map((item, idx) => (
                    <div className="advisory-item strength" key={idx}>
                      <div className="advisory-item-title">{item.aspect}</div>
                      <div className="advisory-item-description">{item.description}</div>
                      {item.impact && (
                        <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '6px' }}>
                          💡 Impact: {item.impact}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {improvementCount > 0 && (
              <div className="advisory-category">
                <div className="advisory-category-header">
                  <div className="advisory-category-icon improvement">⚡</div>
                  <div className="advisory-category-title">Opportunities for Improvement</div>
                </div>
                <div className="advisory-items">
                  {advisory.improvements.map((item, idx) => (
                    <div className="advisory-item improvement" key={idx}>
                      <div className="advisory-item-title">{item.aspect}</div>
                      <div className="advisory-item-description">{item.description}</div>
                      {item.suggestion && (
                        <div className="advisory-item-suggestion">
                          💡 Suggestion: {item.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {missingCount > 0 && (
              <div className="advisory-category">
                <div className="advisory-category-header">
                  <div className="advisory-category-icon missing">⚠</div>
                  <div className="advisory-category-title">Missing Elements</div>
                </div>
                <div className="advisory-items">
                  {advisory.missing.map((item, idx) => (
                    <div className="advisory-item missing" key={idx}>
                      <div className="advisory-item-title">{item.aspect}</div>
                      <div className="advisory-item-description">{item.description}</div>
                      {item.suggestion && (
                        <div className="advisory-item-suggestion">
                          💡 How to add: {item.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
