import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import Papa from 'papaparse'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface CustomerSegment {
  name: string
  count: number
  avgDealSize: number
  conversionRate: string
  ltv: number
  churnRate: string
  traits: string[]
}

interface AnalysisResult {
  segments: CustomerSegment[]
  insights: string[]
  recommendations: string[]
  winningProfile: string
  segmentToAvoid?: string
}

/**
 * Analyzes uploaded customer CSV data to identify patterns and segments
 * Used in Post-Revenue and Scale-Up modes
 */
export async function POST(req: NextRequest) {
  try {
    const { csvData } = await req.json()

    if (!csvData || typeof csvData !== 'string') {
      return NextResponse.json(
        { error: 'CSV data is required as a string' },
        { status: 400 }
      )
    }

    // Parse CSV
    let parsedData: any[]
    try {
      const result = Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      })

      if (result.errors.length > 0) {
        console.error('CSV parse errors:', result.errors)
      }

      parsedData = result.data

      if (!parsedData || parsedData.length === 0) {
        throw new Error('No data found in CSV')
      }

    } catch (error: any) {
      return NextResponse.json(
        { error: `Failed to parse CSV: ${error.message}` },
        { status: 400 }
      )
    }

    console.log(`Parsed ${parsedData.length} customer records`)

    // Use Claude to analyze the customer data
    try {
      const analysisPrompt = `Analyze this customer data and identify segments with distinct characteristics.

Customer Data (${parsedData.length} records):
${JSON.stringify(parsedData.slice(0, 100), null, 2)}
${parsedData.length > 100 ? '\n... (showing first 100 records)' : ''}

Perform comprehensive segmentation analysis:

1. Identify 3-5 customer segments based on:
   - Role/Title patterns
   - Company size/industry patterns
   - Deal value patterns
   - Usage/behavior patterns (if data available)
   - Churn patterns (if status/churn data available)

2. For each segment, calculate/estimate:
   - Number of customers
   - Average deal size
   - Conversion rate (if data supports it)
   - Estimated LTV
   - Churn rate (if status data available)
   - Key traits that define this segment

3. Provide insights:
   - Which segment is most valuable?
   - Which segment should be avoided (high churn, low value)?
   - What patterns predict success?

Return a JSON object:
{
  "segments": [
    {
      "name": "Segment name (e.g., 'Mid-Market SaaS CTOs')",
      "count": number,
      "avgDealSize": number,
      "conversionRate": "XX%",
      "ltv": number,
      "churnRate": "XX%",
      "traits": ["Trait 1", "Trait 2", ...]
    }
  ],
  "insights": [
    "Key insight 1",
    "Key insight 2",
    ...
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    ...
  ],
  "winningProfile": "Description of the highest-value customer profile",
  "segmentToAvoid": "Description of segment to avoid (if applicable)"
}

IMPORTANT:
- Base analysis on actual data patterns
- If certain metrics aren't available in the data, make reasonable estimates based on patterns
- Be specific and quantitative
- Provide actionable insights
- Return valid JSON only`

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        messages: [{
          role: 'user',
          content: analysisPrompt
        }]
      })

      const responseText = message.content[0].type === 'text'
        ? message.content[0].text
        : ''

      // Parse the JSON response
      let analysisResult: AnalysisResult
      try {
        const jsonText = responseText
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim()

        analysisResult = JSON.parse(jsonText)
      } catch (parseError) {
        console.error('Failed to parse Claude response:', responseText)
        throw new Error('Failed to parse analysis result')
      }

      return NextResponse.json({
        success: true,
        totalRecords: parsedData.length,
        analysis: analysisResult,
      })

    } catch (error: any) {
      console.error('Failed to analyze CSV:', error.message)

      return NextResponse.json(
        {
          error: 'Analysis failed',
          message: error.message
        },
        { status: 500 }
      )
    }

  } catch (error: any) {
    console.error('CSV Analysis API Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}
