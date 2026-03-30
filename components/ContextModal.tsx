'use client';

import React, { useState } from 'react';

interface ContextModalProps {
  visible: boolean;
  plateauScore: number | null;
  onClose: () => void;
  onSubmit: (useCase: string, audience: string, edgeCases: string, requirements: string) => void;
}

export default function ContextModal({
  visible,
  plateauScore,
  onClose,
  onSubmit,
}: ContextModalProps) {
  const [useCase, setUseCase] = useState('');
  const [audience, setAudience] = useState('');
  const [edgeCases, setEdgeCases] = useState('');
  const [requirements, setRequirements] = useState('');

  const handleSubmit = () => {
    onSubmit(useCase.trim(), audience.trim(), edgeCases.trim(), requirements.trim());
    setUseCase('');
    setAudience('');
    setEdgeCases('');
    setRequirements('');
  };

  return (
    <div className={`context-modal ${visible ? 'show' : ''}`} id="contextModal">
      <div className="context-modal-content">
        <div className="context-modal-header">
          <div className="context-modal-title">🎯 Your prompt is plateauing</div>
          <div className="context-modal-subtitle">
            Your health scores have stabilized around{' '}
            <span id="plateauScore">{plateauScore ?? '--'}</span>/100. To push beyond this, I
            need to understand your specific use case better.
          </div>
        </div>

        <div className="context-questions">
          <div className="context-question">
            <label className="context-question-label">What are you building?</label>
            <div className="context-question-helper">
              e.g., &quot;A news summarizer for our internal newsletter&quot;, &quot;Customer
              support bot for SaaS product&quot;
            </div>
            <textarea
              className="context-input"
              id="contextUseCase"
              placeholder="Describe your use case..."
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
            />
          </div>

          <div className="context-question">
            <label className="context-question-label">Who is your target audience?</label>
            <div className="context-question-helper">
              e.g., &quot;Busy executives&quot;, &quot;Technical developers&quot;, &quot;General
              consumers&quot;
            </div>
            <textarea
              className="context-input"
              id="contextAudience"
              placeholder="Who will consume these outputs?"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div className="context-question">
            <label className="context-question-label">
              What edge cases or failure modes worry you?
            </label>
            <div className="context-question-helper">
              e.g., &quot;Too technical for non-experts&quot;, &quot;Misses key numbers&quot;,
              &quot;Inconsistent tone&quot;
            </div>
            <textarea
              className="context-input"
              id="contextEdgeCases"
              placeholder="What could go wrong?"
              value={edgeCases}
              onChange={(e) => setEdgeCases(e.target.value)}
            />
          </div>

          <div className="context-question">
            <label className="context-question-label">
              Any domain-specific requirements?
            </label>
            <div className="context-question-helper">
              e.g., &quot;Must cite sources&quot;, &quot;Medical accuracy critical&quot;,
              &quot;Keep legal disclaimers&quot;
            </div>
            <textarea
              className="context-input"
              id="contextRequirements"
              placeholder="Special constraints or requirements..."
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
            />
          </div>
        </div>

        <div className="context-modal-actions">
          <button className="button button-secondary" onClick={onClose}>
            Skip for Now
          </button>
          <button className="button button-primary" onClick={handleSubmit}>
            Enhance Prompt with Context
          </button>
        </div>
      </div>
    </div>
  );
}
