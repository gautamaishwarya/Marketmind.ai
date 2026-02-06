import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ScrapeResult {
  url: string
  success: boolean
  data?: {
    description: string
    pricing: Array<{
      tier: string
      price: string
      features: string[]
    }>
    features: string[]
    targetMarket: string
    positioning: string
    testimonials: Array<{
      quote: string
      company?: string
      role?: string
    }>
  }
  error?: string
}

/**
 * Scrapes competitor website data using HTML parsing and AI extraction
 * For serverless/Vercel deployment, we use fetch + Claude for content extraction
 * In production, consider using a service like browserless.io for JS-heavy sites
 */
export async function POST(req: NextRequest) {
  try {
    // Validate API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY is not set')
      return NextResponse.json(
        {
          success: false,
          error: 'API configuration error',
          message: 'ANTHROPIC_API_KEY environment variable is not set. Please add it to your .env.local file.'
        },
        { status: 500 }
      )
    }

    const { url } = await req.json()

    if (!url) {
      return NextResponse.json(
        {
          success: false,
          error: 'URL is required',
          message: 'Please provide a URL to scrape'
        },
        { status: 400 }
      )
    }

    // Validate URL
    let competitorUrl: URL
    try {
      competitorUrl = new URL(url)
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid URL format',
          message: 'Please provide a valid URL (e.g., https://example.com)'
        },
        { status: 400 }
      )
    }

    console.log(`Scraping competitor: ${competitorUrl.href}`)

    // Fetch the website content
    let htmlContent = ''
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout

      const response = await fetch(competitorUrl.href, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
      })

      clearTimeout(timeout)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      htmlContent = await response.text()

      // Truncate HTML to avoid token limits (keep first 50k chars)
      if (htmlContent.length > 50000) {
        htmlContent = htmlContent.substring(0, 50000)
      }

    } catch (error: any) {
      console.error(`Failed to fetch ${competitorUrl.href}:`, error.message)

      return NextResponse.json({
        url: competitorUrl.href,
        success: false,
        error: `Failed to fetch website: ${error.message}`,
      } as ScrapeResult)
    }

    // Use Claude to extract structured data from HTML
    try {
      const extractionPrompt = `Extract key information from this competitor's website HTML.

URL: ${competitorUrl.href}

HTML Content (truncated):
${htmlContent}

Extract and return a JSON object with:
{
  "description": "Brief 1-2 sentence company description",
  "pricing": [
    {
      "tier": "Tier name (e.g., Free, Pro, Enterprise)",
      "price": "Price (e.g., $0/mo, $49/mo, Contact sales)",
      "features": ["Key feature 1", "Key feature 2", ...]
    }
  ],
  "features": ["Core feature 1", "Core feature 2", ...],
  "targetMarket": "Who they target (e.g., 'SMBs', 'Enterprise teams', 'Developers')",
  "positioning": "How they position themselves (1-2 sentences)",
  "testimonials": [
    {
      "quote": "Testimonial text",
      "company": "Company name (if available)",
      "role": "Person's role (if available)"
    }
  ]
}

IMPORTANT:
- Only extract data that is clearly visible in the HTML
- If pricing is not found, return empty array
- If testimonials not found, return empty array
- Keep features concise (max 10)
- Base everything on actual content, don't make assumptions
- Return valid JSON only, no markdown formatting`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: extractionPrompt
        }]
      })

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      // Parse the JSON response
      let extractedData
      try {
        // Remove markdown code blocks if present
        const jsonText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        extractedData = JSON.parse(jsonText)
      } catch (parseError) {
        console.error('Failed to parse Claude response:', responseText)
        throw new Error('Failed to parse extracted data')
      }

      return NextResponse.json({
        url: competitorUrl.href,
        success: true,
        data: extractedData,
      } as ScrapeResult)

    } catch (error: any) {
      console.error(`Failed to extract data from ${competitorUrl.href}:`, error.message)

      return NextResponse.json({
        url: competitorUrl.href,
        success: false,
        error: `Failed to extract data: ${error.message}`,
      } as ScrapeResult)
    }

  } catch (error: any) {
    console.error('Scrape API Error:', error)

    // Ensure we always return JSON, never HTML
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error.message || 'An unexpected error occurred while processing your request',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    )
  }
}
