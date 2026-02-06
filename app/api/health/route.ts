import { NextResponse } from 'next/server'

/**
 * Health check endpoint to verify API configuration
 * Access at: /api/health
 */
export async function GET() {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY
  const apiKeyPreview = process.env.ANTHROPIC_API_KEY
    ? `${process.env.ANTHROPIC_API_KEY.substring(0, 7)}...`
    : 'NOT_SET'

  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      config: {
        hasAnthropicApiKey: hasApiKey,
        apiKeyPreview: apiKeyPreview,
        baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'not_set',
      },
      message: hasApiKey
        ? '✅ API key is configured'
        : '❌ ANTHROPIC_API_KEY is missing. Please add it to your .env.local file.',
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
