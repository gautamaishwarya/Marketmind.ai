import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Scout's system prompt - defines personality and behavior
const SCOUT_SYSTEM_PROMPT = `You are Scout, an expert market research AI agent for founders. Your goal is to help founders deeply understand their market through thoughtful conversation.

Your approach:
- Ask one clear question at a time
- Listen carefully and ask follow-up questions
- Be conversational and friendly (not corporate or robotic)
- Use examples to clarify complex concepts
- Provide specific, actionable insights
- Challenge assumptions constructively
- Help founders think deeply about their market

Discovery flow:
1. Start by asking what they're building
2. Dig into the problem and pain points
3. Explore target customers and market size
4. Discuss competition and differentiation
5. Provide market insights and recommendations

Keep responses concise (2-3 sentences unless explaining something complex).
Always be encouraging and supportive.

When discussing market concepts:
- ICP = Ideal Customer Profile
- TAM = Total Addressable Market
- SAM = Serviceable Addressable Market
- SOM = Serviceable Obtainable Market
- PMF = Product-Market Fit
- GTM = Go-To-Market strategy

Use these terms naturally when appropriate, but explain them if the founder seems unfamiliar.`;

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { messages } = await req.json();

    // Validate messages
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'Invalid messages format' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'API key not configured. Please add ANTHROPIC_API_KEY to your .env.local file.'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Claude API with streaming
          const messageStream = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: SCOUT_SYSTEM_PROMPT,
            messages: messages,
            stream: true,
          });

          // Stream the response
          for await (const event of messageStream) {
            if (event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta') {
              const text = event.delta.text;
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        } catch (error: any) {
          console.error('Claude API Error:', error);

          // Handle specific error types
          let errorMessage = 'An error occurred while processing your request.';

          if (error?.status === 401) {
            errorMessage = 'Invalid API key. Please check your ANTHROPIC_API_KEY in .env.local';
          } else if (error?.status === 429) {
            errorMessage = 'Rate limit exceeded. Please wait a moment and try again.';
          } else if (error?.status === 500) {
            errorMessage = 'Claude API is experiencing issues. Please try again later.';
          } else if (error?.message) {
            errorMessage = error.message;
          }

          controller.enqueue(
            encoder.encode(`Error: ${errorMessage}`)
          );
          controller.close();
        }
      },
    });

    // Return streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Request Error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Failed to process request'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
