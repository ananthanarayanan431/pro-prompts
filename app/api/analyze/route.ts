import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, maxTokens, model } = body;

    if (!prompt) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: 'OPENROUTER_API_KEY is not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'Prompt Optimizer Studio',
      },
      body: JSON.stringify({
        model: model || 'anthropic/claude-haiku-4.5',
        max_tokens: maxTokens || 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return Response.json(
        { error: errorData.error?.message || `API request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Map OpenRouter (OpenAI-compatible) response to the format the frontend expects
    const mappedResponse = {
      content: data.choices?.map((choice: { message?: { content?: string } }) => ({
        type: 'text',
        text: choice.message?.content || '',
      })) || [],
    };

    return Response.json(mappedResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return Response.json(
      { error: message },
      { status: 500 }
    );
  }
}
