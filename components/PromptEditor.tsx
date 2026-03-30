'use client';

import React from 'react';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  highlight: boolean;
}

export default function PromptEditor({ value, onChange, highlight }: PromptEditorProps) {
  return (
    <textarea
      id="promptEditor"
      placeholder={`Enter your prompt here...

Example:
You are a helpful assistant that summarizes articles. Keep summaries under 100 words and focus on key points.`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        borderColor: highlight ? '#4ade80' : undefined,
        transition: 'border-color 0.2s',
      }}
    />
  );
}
