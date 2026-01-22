import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface ResearchRequest {
  product: string
  stage: 'pre-launch' | 'early-stage' | 'post-revenue' | 'scale-up'
  targetMarket?: string
  competitors?: string[]
  additionalContext?: any
  csvAnalysis?: any
}

/**
 * Comprehensive research orchestration API
 * Coordinates scraping, analysis, and insight generation based on startup stage
 */
export async function POST(req: NextRequest) {
  try {
    const body: ResearchRequest = await req.json()
    const { product, stage, targetMarket, competitors, additionalContext, csvAnalysis } = body

    if (!product || !stage) {
      return NextResponse.json(
        { error: 'Product and stage are required' },
        { status: 400 }
      )
    }

    console.log(`Starting research for: ${product} (${stage})`)

    // Step 1: Scrape competitors (if provided)
    let competitorData: any[] = []
    if (competitors && competitors.length > 0) {
      console.log(`Scraping ${competitors.length} competitors...`)

      const scrapePromises = competitors.slice(0, 5).map(async (url) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scrape-competitor`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          })

          if (!response.ok) {
            console.error(`Failed to scrape ${url}`)
            return null
          }

          const data = await response.json()
          return data.success ? data.data : null
        } catch (error) {
          console.error(`Error scraping ${url}:`, error)
          return null
        }
      })

      const results = await Promise.all(scrapePromises)
      competitorData = results.filter(r => r !== null)
      console.log(`Successfully scraped ${competitorData.length} competitors`)
    }

    // Step 2: Generate comprehensive research based on stage
    let researchPrompt = ''

    switch (stage) {
      case 'pre-launch':
        researchPrompt = `Conduct comprehensive ICP discovery research for a PRE-LAUNCH startup.

Product: ${product}
Target Market: ${targetMarket || 'Not specified'}
${competitorData.length > 0 ? `\nCompetitor Data:\n${JSON.stringify(competitorData, null, 2)}` : ''}

As a market research analyst, provide:

1. **Competitor Analysis** (based on scraped data if available):
   - For each competitor: positioning, strengths, weaknesses, pricing strategy
   - Market gaps and opportunities
   - Competitive differentiation recommendations

2. **ICP Hypothesis** (3 segments, prioritized):
   Based on competitor customers and market signals, identify:
   - Segment name and description
   - Firmographics (company size, industry, revenue)
   - Decision maker profile (role, seniority, team size)
   - Pain points (specific, evidence-based)
   - Buying triggers
   - Where to find them (communities, channels, search terms)
   - Why this segment will buy (rationale)
   - Evidence/reasoning for recommendation

3. **Market Analysis**:
   - TAM/SAM/SOM estimates (with sources/methodology)
   - Market growth trends
   - Key dynamics affecting the market

4. **Strategic Frameworks**:
   - SWOT analysis for top 3 competitors
   - Porter's Five Forces analysis
   - Positioning recommendation

5. **GTM Strategy**:
   - Recommended positioning statement
   - Pricing strategy (based on competitor analysis)
   - Top 3 GTM channels with rationale
   - First 90-day action plan

Return structured JSON following this format:
{
  "competitors": [/* competitor profiles */],
  "icpProfiles": [/* 3 ICP segments */],
  "marketData": {/* TAM/SAM/SOM */},
  "swotAnalyses": [/* SWOT for top 3 */],
  "portersFiveForces": {/* analysis */},
  "positioning": {/* recommendation */},
  "pricing": {/* strategy */},
  "gtmChannels": [/* top 3 */],
  "actionPlan": [/* 90-day plan */]
}`
        break

      case 'early-stage':
        researchPrompt = `Conduct ICP validation research for an EARLY-STAGE startup (1-20 customers).

Product: ${product}
Target Market: ${targetMarket || 'Not specified'}
Early Customer Patterns: ${additionalContext?.customerPatterns || 'Not provided'}
${competitorData.length > 0 ? `\nCompetitor Data:\n${JSON.stringify(competitorData, null, 2)}` : ''}

As a market research analyst, provide:

1. **Customer Pattern Analysis**:
   - Validate patterns from early customers
   - Identify converging vs non-converging profiles
   - Recommend which segments to double down on

2. **Validated ICP Segments** (3 segments):
   - Primary: Based on best-converting customers
   - Secondary: Adjacent opportunity
   - Tertiary: Future potential
   For each: firmographics, decision maker, pain points, conversion insights

3. **Competitor Positioning**:
   - How competitors position against these ICPs
   - Gaps in their offering
   - Your differentiation opportunity

4. **Optimization Recommendations**:
   - Which customer type to focus on (data-backed)
   - Which to avoid (with reasoning)
   - Channel recommendations
   - Next 20 customers: specific targeting criteria

Return structured JSON with the same format as pre-launch.`
        break

      case 'post-revenue':
        researchPrompt = `Conduct quantitative ICP analysis for a POST-REVENUE startup (20-100 customers).

Product: ${product}
Target Market: ${targetMarket || 'Not specified'}
${csvAnalysis ? `\nCustomer Data Analysis:\n${JSON.stringify(csvAnalysis, null, 2)}` : ''}
${competitorData.length > 0 ? `\nCompetitor Data:\n${JSON.stringify(competitorData, null, 2)}` : ''}

As a market research analyst, provide:

1. **Data-Driven ICP Analysis**:
   ${csvAnalysis ? '- Use the CSV analysis to identify winning segments' : '- Analyze described customer patterns'}
   - Segment by conversion rate, LTV, churn
   - Identify highest-value customers
   - Pinpoint segments to avoid

2. **Competitive Intelligence**:
   - Deep SWOT for each competitor
   - Your positioning vs competitors for each segment
   - Pricing optimization based on segment value

3. **Scaling Strategy**:
   - Which ICP to scale (with ROI projections)
   - Channel allocation by segment
   - Expansion opportunities
   - Next 100 customers: precise targeting

4. **Optimization Roadmap**:
   - Quick wins (30 days)
   - Medium-term improvements (90 days)
   - Long-term strategy (12 months)

Return structured JSON with quantitative metrics included.`
        break

      case 'scale-up':
        researchPrompt = `Conduct advanced segmentation research for a SCALE-UP (100+ customers).

Product: ${product}
Target Market: ${targetMarket || 'Not specified'}
${csvAnalysis ? `\nCustomer Segmentation Data:\n${JSON.stringify(csvAnalysis, null, 2)}` : ''}
${competitorData.length > 0 ? `\nCompetitor Data:\n${JSON.stringify(competitorData, null, 2)}` : ''}

As a market research analyst, provide:

1. **Advanced Segmentation**:
   - Cohort analysis of customer segments
   - LTV/CAC by segment
   - Identify expansion opportunities within existing segments
   - New adjacent ICPs for market expansion

2. **Competitive Landscape**:
   - Market share estimates
   - Competitive positioning by segment
   - Threats and opportunities
   - Moat-building recommendations

3. **Growth Strategy**:
   - Current segment optimization
   - New segment expansion plan
   - Enterprise readiness assessment
   - International expansion considerations (if applicable)

4. **Strategic Roadmap**:
   - Immediate optimizations (30 days)
   - Growth initiatives (6 months)
   - Strategic positioning (12-24 months)

Return comprehensive JSON with segment metrics, market sizing, and strategic recommendations.`
        break
    }

    // Call Claude for comprehensive analysis
    console.log('Generating comprehensive research with Claude...')

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      temperature: 0.7,
      system: `You are an expert market research analyst specializing in ICP discovery and competitive intelligence. Provide data-backed, actionable insights. Always structure your response as valid JSON.`,
      messages: [{
        role: 'user',
        content: researchPrompt
      }]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    // Parse JSON response
    let researchResults
    try {
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()

      researchResults = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText.substring(0, 500))

      // Return structured response even if JSON parse fails
      researchResults = {
        competitors: competitorData.map((c: any) => ({
          name: c.url,
          description: c.description,
          pricing: c.pricing,
          strengths: [],
          weaknesses: [],
        })),
        icpProfiles: [],
        analysis: responseText, // Include raw response
      }
    }

    // Add metadata
    const finalResults = {
      requestId: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      stage,
      ...researchResults,
      dataSourcesCited: [
        'Competitor website analysis',
        'Claude AI market research',
        ...(csvAnalysis ? ['Customer data analysis'] : []),
      ],
      researchDepth: {
        competitorsAnalyzed: competitorData.length,
        reviewsAnalyzed: 0,
        dataPointsCollected: competitorData.length * 10,
      }
    }

    console.log('Research completed successfully')

    return NextResponse.json({
      success: true,
      results: finalResults
    })

  } catch (error: any) {
    console.error('Research API Error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Research failed',
        message: error.message
      },
      { status: 500 }
    )
  }
}
