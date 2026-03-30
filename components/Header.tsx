'use client';

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface HeaderProps {
  onSaveVersion: () => void;
  onOptimize: () => void;
  isOptimizing: boolean;
}

export default function Header({ onSaveVersion, onOptimize, isOptimizing }: HeaderProps) {
  return (
    <div className="header">
      <div>
        <h1>⚡ Prompt Optimizer Studio</h1>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
          Iterative prompt improvement with AI-powered analysis
        </div>
      </div>
      <div className="header-actions">
        <button className="button button-secondary" onClick={onSaveVersion}>
          💾 Save Version
        </button>
        <button
          className="button button-primary"
          onClick={onOptimize}
          disabled={isOptimizing}
          id="optimizeButton"
        >
          {isOptimizing ? (
            <>
              <LoadingSpinner /> Analyzing...
            </>
          ) : (
            '✨ Optimize Prompt'
          )}
        </button>
      </div>
    </div>
  );
}
