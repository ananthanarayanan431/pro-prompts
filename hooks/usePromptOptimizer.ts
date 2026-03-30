'use client';

import { useState, useCallback, useRef } from 'react';
import type { HealthMetrics, HealthMetric, Advisory, Version, SuggestionsData, METRIC_LABELS } from '@/types';

function parseMetric(text: string, metricName: string): HealthMetric {
  const regex = new RegExp(`${metricName}:\\s*(\\d+)\\s*\\n?Explanation:\\s*(.+?)(?=\\n\\n|\\n[A-Z_]+:|$)`, 's');
  const match = text.match(regex);

  if (match) {
    return {
      score: parseInt(match[1]),
      explanation: match[2].trim(),
    };
  }

  return { score: 0, explanation: 'Could not parse metric' };
}

export function getScoreClass(score: number): string {
  if (score >= 75) return 'excellent';
  if (score >= 50) return 'good';
  return 'poor';
}

export function getScoreColor(score: number): string {
  if (score >= 75) return '#4ade80';
  if (score >= 50) return '#fbbf24';
  return '#f87171';
}

async function callApi(prompt: string, maxTokens: number): Promise<string> {
  const response = await fetch('/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, maxTokens }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }

  const data = await response.json();
  const fullResponse = data.content
    .filter((item: { type: string }) => item.type === 'text')
    .map((item: { text: string }) => item.text)
    .join('\n');

  return fullResponse;
}

export function usePromptOptimizer() {
  const [promptText, setPromptText] = useState('');
  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState(0);
  const [iterationCount, setIterationCount] = useState(0);
  const [currentHealthMetrics, setCurrentHealthMetrics] = useState<HealthMetrics | null>(null);
  const [healthScoreHistory, setHealthScoreHistory] = useState<number[]>([]);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isAnalyzingHealth, setIsAnalyzingHealth] = useState(false);
  const [isAnalyzingAdvisory, setIsAnalyzingAdvisory] = useState(false);
  const [suggestionsData, setSuggestionsData] = useState<SuggestionsData | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [advisoryData, setAdvisoryData] = useState<Advisory | null>(null);
  const [advisoryError, setAdvisoryError] = useState<string | null>(null);
  const [showAdvisory, setShowAdvisory] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [showHealth, setShowHealth] = useState(false);
  const [isPlateauing, setIsPlateauing] = useState(false);
  const [editorHighlight, setEditorHighlight] = useState(false);

  const healthMetricsRef = useRef<HealthMetrics | null>(null);

  const checkForPlateau = useCallback((history: number[]): boolean => {
    if (history.length < 3) return false;

    const recent = history.slice(-3);
    const improvements: number[] = [];
    for (let i = 1; i < recent.length; i++) {
      improvements.push(recent[i] - recent[i - 1]);
    }

    const isPlateau = improvements.every(imp => imp < 5 && imp >= -5);
    const currentScore = recent[recent.length - 1];
    const inPlateauRange = currentScore >= 65 && currentScore <= 85;

    return isPlateau && inPlateauRange;
  }, []);

  const analyzePromptHealth = useCallback(async (): Promise<HealthMetrics | null> => {
    const prompt = promptText.trim();
    if (!prompt) {
      alert('Please enter a prompt first');
      return null;
    }

    setIsAnalyzingHealth(true);
    setShowHealth(true);

    try {
      const analysisPrompt = `You are a prompt engineering expert. Analyze this prompt and score it on the following metrics. Provide scores from 0-100 for each metric and a brief explanation.

PROMPT TO ANALYZE:
${prompt}

Provide your analysis in this EXACT format:

CLARITY: [0-100 score]
Explanation: [1 sentence]

SPECIFICITY: [0-100 score]
Explanation: [1 sentence]

STRUCTURE: [0-100 score]
Explanation: [1 sentence]

EXAMPLES: [0-100 score]
Explanation: [1 sentence]

CONSTRAINTS: [0-100 score]
Explanation: [1 sentence]

OUTPUT_FORMAT: [0-100 score]
Explanation: [1 sentence]

Be strict in your scoring. Most prompts should score 40-70, not 80-100.`;

      const analysisText = await callApi(analysisPrompt, 1500);

      const metrics: HealthMetrics = {
        clarity: parseMetric(analysisText, 'CLARITY'),
        specificity: parseMetric(analysisText, 'SPECIFICITY'),
        structure: parseMetric(analysisText, 'STRUCTURE'),
        examples: parseMetric(analysisText, 'EXAMPLES'),
        constraints: parseMetric(analysisText, 'CONSTRAINTS'),
        outputFormat: parseMetric(analysisText, 'OUTPUT_FORMAT'),
      };

      const scores = Object.values(metrics).map(m => m.score);
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      setCurrentHealthMetrics(metrics);
      healthMetricsRef.current = metrics;
      setOverallScore(overall);

      const newHistory = [...healthScoreHistory, overall];
      setHealthScoreHistory(newHistory);

      const plateauing = checkForPlateau(newHistory);
      setIsPlateauing(plateauing);

      if (plateauing) {
        setTimeout(() => setShowContextModal(true), 1000);
      }

      setIsAnalyzingHealth(false);
      return metrics;
    } catch (error) {
      setIsAnalyzingHealth(false);
      setOverallScore(null);
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setSuggestionsError(message);
      return null;
    }
  }, [promptText, healthScoreHistory, checkForPlateau]);

  const generateSuggestions = useCallback(async (prompt: string, healthMetrics: HealthMetrics | null = null) => {
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setSuggestionsData(null);

    try {
      const metricLabels: Record<string, string> = {
        clarity: 'Clarity',
        specificity: 'Specificity',
        structure: 'Structure',
        examples: 'Examples',
        constraints: 'Constraints',
        outputFormat: 'Output Format',
      };

      let healthContext = '';
      if (healthMetrics) {
        healthContext = `\n\nPROMPT HEALTH ANALYSIS:
${Object.entries(healthMetrics).map(([key, value]) =>
  `${metricLabels[key]}: ${value.score}/100 - ${value.explanation}`
).join('\n')}

FOCUS YOUR IMPROVEMENTS ON THE LOWEST SCORING METRICS ABOVE.`;
      }

      const analysisPrompt = `You are a prompt engineering expert. Analyze this prompt and provide:

1. A brief analysis of what's working and what's not (2-3 sentences)
2. An IMPROVED VERSION of the prompt that fixes the issues

CURRENT PROMPT:
${prompt}${healthContext}

Format your response EXACTLY like this:

ANALYSIS:
[Your 2-3 sentence analysis]

IMPROVED PROMPT:
[The complete rewritten prompt - aim to score 80+ on all health metrics]`;

      const fullResponse = await callApi(analysisPrompt, 2000);

      const analysisMatch = fullResponse.match(/ANALYSIS:\s*([\s\S]*?)(?=IMPROVED PROMPT:|$)/i);
      const improvedPromptMatch = fullResponse.match(/IMPROVED PROMPT:\s*([\s\S]*?)$/i);

      const analysis = analysisMatch ? analysisMatch[1].trim() : 'Analysis not available';
      const improvedPrompt = improvedPromptMatch ? improvedPromptMatch[1].trim() : '';

      setSuggestionsData({ analysis, improvedPrompt });
      setSuggestionsLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not generate improvements';
      setSuggestionsError(message);
      setSuggestionsLoading(false);
    }
  }, []);

  const optimizePrompt = useCallback(async () => {
    const prompt = promptText.trim();
    if (!prompt) {
      alert('Please enter a prompt first');
      return;
    }

    setIsOptimizing(true);
    setIterationCount(prev => prev + 1);

    const healthMetrics = await analyzePromptHealth();
    await generateSuggestions(prompt, healthMetrics);
    await analyzePromptAdvisoryInternal();

    setIsOptimizing(false);
  }, [promptText, analyzePromptHealth, generateSuggestions]);

  const analyzePromptAdvisoryInternal = useCallback(async () => {
    const prompt = promptText.trim();
    if (!prompt) {
      alert('Please enter a prompt first');
      return;
    }

    setIsAnalyzingAdvisory(true);
    setShowAdvisory(true);
    setAdvisoryError(null);
    setAdvisoryData(null);

    try {
      const advisoryPrompt = `You are a prompt engineering expert. Perform a comprehensive analysis of this prompt and provide detailed feedback.

PROMPT TO ANALYZE:
${prompt}

Analyze the prompt across these dimensions and provide your response in this EXACT JSON format:

{
  "summary": "1-2 sentence overall assessment of the prompt",
  "strengths": [
    {
      "aspect": "Name of strength (e.g., 'Clear Persona', 'Well-defined Examples')",
      "description": "What makes this good",
      "impact": "Why this matters for prompt quality"
    }
  ],
  "improvements": [
    {
      "aspect": "Area needing improvement",
      "description": "What's currently lacking or could be better",
      "suggestion": "Specific actionable recommendation"
    }
  ],
  "missing": [
    {
      "aspect": "What's completely absent",
      "description": "Why this is important",
      "suggestion": "How to add this element"
    }
  ]
}

Be specific and actionable. Analyze:
- Persona definition (role, expertise level)
- Task clarity (what to do, how to do it)
- Examples and demonstrations
- Output format specifications
- Constraints and guardrails
- Context and background
- Edge case handling
- Tone and style guidance

Return ONLY valid JSON, no markdown formatting.`;

      const analysisText = await callApi(advisoryPrompt, 2500);

      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse advisory response');
      }

      const advisory: Advisory = JSON.parse(jsonMatch[0]);
      setAdvisoryData(advisory);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      setAdvisoryError(message);
    } finally {
      setIsAnalyzingAdvisory(false);
    }
  }, [promptText]);

  const analyzePromptAdvisory = useCallback(async () => {
    await analyzePromptAdvisoryInternal();
  }, [analyzePromptAdvisoryInternal]);

  const saveVersion = useCallback(() => {
    const prompt = promptText.trim();
    if (!prompt) {
      alert('Please enter a prompt first');
      return;
    }

    const newVersion: Version = {
      id: Date.now(),
      prompt,
      timestamp: new Date().toLocaleString(),
      iteration: iterationCount,
      healthMetrics: currentHealthMetrics ? { ...currentHealthMetrics } : null,
    };

    setVersions(prev => [...prev, newVersion]);
  }, [promptText, iterationCount, currentHealthMetrics]);

  const loadVersion = useCallback((index: number) => {
    const version = versions[index];
    if (!version) return;

    setPromptText(version.prompt);
    setCurrentHealthMetrics(version.healthMetrics);
    setCurrentVersion(index);

    if (version.healthMetrics) {
      const scores = Object.values(version.healthMetrics).map(m => m.score);
      const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      setOverallScore(overall);
      setShowHealth(true);
    }
  }, [versions]);

  const applyImprovedPrompt = useCallback((improvedPrompt: string) => {
    const currentPrompt = promptText.trim();
    if (currentPrompt && currentPrompt !== improvedPrompt) {
      saveVersion();
    }
    setPromptText(improvedPrompt);
    setEditorHighlight(true);
    setTimeout(() => setEditorHighlight(false), 1000);
  }, [promptText, saveVersion]);

  const applyAndReOptimize = useCallback(async (improvedPrompt: string) => {
    applyImprovedPrompt(improvedPrompt);
    setTimeout(() => {
      optimizePrompt();
    }, 500);
  }, [applyImprovedPrompt, optimizePrompt]);

  const submitContext = useCallback(async (
    useCase: string,
    audience: string,
    edgeCases: string,
    requirements: string,
  ) => {
    if (!useCase && !audience && !edgeCases && !requirements) {
      alert('Please provide at least one piece of context');
      return;
    }

    setShowContextModal(false);
    saveVersion();

    const currentPrompt = promptText.trim();
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setSuggestionsData(null);

    try {
      const contextInfo = `
USE CASE: ${useCase || 'Not specified'}
TARGET AUDIENCE: ${audience || 'Not specified'}
EDGE CASES/CONCERNS: ${edgeCases || 'Not specified'}
DOMAIN REQUIREMENTS: ${requirements || 'Not specified'}`;

      const metricsContext = healthMetricsRef.current
        ? Object.entries(healthMetricsRef.current).map(([key, value]) =>
          `${key}: ${value.score}/100 - ${value.explanation}`
        ).join('\n')
        : 'Not available';

      const enhancementPrompt = `You are a prompt engineering expert. The user's prompt has plateaued at a good but not excellent level. They've provided additional context about their use case. Use this context to create a SIGNIFICANTLY ENHANCED version that addresses their specific needs.

CURRENT PROMPT:
${currentPrompt}

CURRENT HEALTH METRICS:
${metricsContext}

USER CONTEXT:
${contextInfo}

Create an ENHANCED prompt that:
1. Incorporates the use case and audience into the instructions
2. Addresses the specific edge cases they mentioned
3. Includes domain-specific requirements
4. Adds concrete examples relevant to their use case
5. Defines success criteria specific to their needs

Format your response EXACTLY like this:

ENHANCEMENTS MADE:
[Brief 2-3 sentence summary of key improvements]

ENHANCED PROMPT:
[The complete enhanced prompt - aim for 90+ health score]`;

      const fullResponse = await callApi(enhancementPrompt, 3000);

      const enhancementsMatch = fullResponse.match(/ENHANCEMENTS MADE:\s*([\s\S]*?)(?=ENHANCED PROMPT:|$)/i);
      const enhancedPromptMatch = fullResponse.match(/ENHANCED PROMPT:\s*([\s\S]*?)$/i);

      const enhancements = enhancementsMatch ? enhancementsMatch[1].trim() : 'See below';
      const enhancedPrompt = enhancedPromptMatch ? enhancedPromptMatch[1].trim() : '';

      setSuggestionsData({ analysis: enhancements, improvedPrompt: enhancedPrompt, isContextEnhanced: true });
      setSuggestionsLoading(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not enhance prompt';
      setSuggestionsError(message);
      setSuggestionsLoading(false);
    }
  }, [promptText, saveVersion]);

  const applyAndRetest = useCallback(async (improvedPrompt: string) => {
    applyImprovedPrompt(improvedPrompt);
    setTimeout(() => {
      analyzePromptHealth();
    }, 500);
  }, [applyImprovedPrompt, analyzePromptHealth]);

  return {
    promptText,
    setPromptText,
    versions,
    currentVersion,
    iterationCount,
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
  };
}
