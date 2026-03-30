'use client';

import React from 'react';
import type { Version } from '@/types';
import { getScoreColor } from '@/hooks/usePromptOptimizer';

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: number;
  onLoadVersion: (index: number) => void;
}

export default function VersionHistory({
  versions,
  currentVersion,
  onLoadVersion,
}: VersionHistoryProps) {
  if (versions.length === 0) return null;

  return (
    <div className="version-history" id="versionHistory" style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '14px', marginBottom: '12px', color: '#fff' }}>
        Version History
      </h3>
      <div id="versionList">
        {versions.map((v, index) => {
          const healthScore = v.healthMetrics
            ? Math.round(
                Object.values(v.healthMetrics).reduce((sum, m) => sum + m.score, 0) / 6
              )
            : null;

          return (
            <div
              className={`version-item ${index === currentVersion ? 'active' : ''}`}
              key={v.id}
              onClick={() => onLoadVersion(index)}
            >
              <div>
                <div style={{ fontSize: '13px', color: '#fff', marginBottom: '4px' }}>
                  Iteration {v.iteration}
                </div>
                <div className="version-info">{v.timestamp}</div>
              </div>
              {healthScore !== null && (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                    Health
                  </div>
                  <div className="version-score" style={{ color: getScoreColor(healthScore) }}>
                    {healthScore}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
