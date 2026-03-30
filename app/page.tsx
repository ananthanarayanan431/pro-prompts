'use client';

import React from 'react';
import Header from '@/components/Header';
import PromptEditor from '@/components/PromptEditor';
import HealthMetrics from '@/components/HealthMetrics';
import SuggestionsPanel from '@/components/SuggestionsPanel';
import AdvisoryPanel from '@/components/AdvisoryPanel';
import VersionHistory from '@/components/VersionHistory';
import ContextModal from '@/components/ContextModal';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePromptOptimizer } from '@/hooks/usePromptOptimizer';

export default function Home() {
  const {
    promptText,
    setPromptText,
    versions,
    currentVersion,
    currentHealthMetrics,
    overallScore,
    isOptimizing,
    isAnalyzingHealth,
    isAnalyzingAdvisory,
    suggestionsData,
    suggestionsLoading,
    suggestionsError,
    advisoryData,
    advisoryError,
    showAdvisory,
    showContextModal,
    setShowContextModal,
    showHealth,
    isPlateauing,
    editorHighlight,
    optimizePrompt,
    analyzePromptHealth,
    analyzePromptAdvisory,
    saveVersion,
    loadVersion,
    applyImprovedPrompt,
    applyAndReOptimize,
    applyAndRetest,
    submitContext,
  } = usePromptOptimizer();

  return (
    <>
      <div className="container">
        <Header
          onSaveVersion={saveVersion}
          onOptimize={optimizePrompt}
          isOptimizing={isOptimizing}
        />

        <div className="left-panel">
          <div className="panel-header">
            <div className="panel-title">Prompt Editor</div>
            <button className="button button-secondary" onClick={saveVersion}>
              Save Version
            </button>
          </div>
          <div className="panel-content">
            <PromptEditor
              value={promptText}
              onChange={setPromptText}
              highlight={editorHighlight}
            />

            <HealthMetrics
              metrics={currentHealthMetrics}
              overallScore={overallScore}
              isLoading={isAnalyzingHealth}
              isPlateauing={isPlateauing}
              visible={showHealth}
            />

            <div
              style={{
                marginTop: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <button
                className="button button-secondary"
                onClick={analyzePromptHealth}
                disabled={isAnalyzingHealth}
                id="analyzeButton"
              >
                {isAnalyzingHealth ? (
                  <>
                    <LoadingSpinner /> Analyzing...
                  </>
                ) : (
                  '🔍 Analyze Health'
                )}
              </button>
              <button
                className="button button-primary"
                onClick={analyzePromptAdvisory}
                disabled={isAnalyzingAdvisory}
                id="advisoryButtonMain"
              >
                {isAnalyzingAdvisory ? (
                  <>
                    <LoadingSpinner /> Analyzing...
                  </>
                ) : (
                  '🎓 Get Advisory'
                )}
              </button>
            </div>

            <VersionHistory
              versions={versions}
              currentVersion={currentVersion}
              onLoadVersion={loadVersion}
            />
          </div>
        </div>

        <div className="right-panel">
          <div className="panel-header">
            <div className="panel-title">Analysis &amp; Recommendations</div>
          </div>
          <div className="panel-content">
            <div id="suggestionsContainer">
              <SuggestionsPanel
                data={suggestionsData}
                isLoading={suggestionsLoading}
                error={suggestionsError}
                hasHealthMetrics={currentHealthMetrics !== null}
                onApply={applyImprovedPrompt}
                onApplyAndReOptimize={applyAndReOptimize}
                onApplyAndRetest={applyAndRetest}
              />
            </div>

            <AdvisoryPanel
              advisory={advisoryData}
              isLoading={isAnalyzingAdvisory}
              error={advisoryError}
              visible={showAdvisory}
              onRefresh={analyzePromptAdvisory}
            />
          </div>
        </div>
      </div>

      <ContextModal
        visible={showContextModal}
        plateauScore={overallScore}
        onClose={() => setShowContextModal(false)}
        onSubmit={submitContext}
      />
    </>
  );
}
