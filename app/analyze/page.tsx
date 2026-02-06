'use client'

import { useState } from 'react'
import Link from 'next/link'

interface CompetitorAnalysis {
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

export default function AnalyzePage() {
  const [competitorName, setCompetitorName] = useState('')
  const [website, setWebsite] = useState('')
  const [industry, setIndustry] = useState('')
  const [additionalContext, setAdditionalContext] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<CompetitorAnalysis | null>(null)

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setResults(null)
    setIsAnalyzing(true)

    try {
      // Validate inputs
      if (!competitorName.trim()) {
        throw new Error('Please enter a competitor name')
      }
      if (!website.trim()) {
        throw new Error('Please enter a website URL')
      }

      // Ensure URL has protocol
      let formattedUrl = website.trim()
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl
      }

      // Validate URL format
      try {
        new URL(formattedUrl)
      } catch {
        throw new Error('Please enter a valid website URL')
      }

      console.log('Analyzing competitor:', { competitorName, website: formattedUrl })

      // Call the scrape-competitor API
      const response = await fetch('/api/scrape-competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: formattedUrl }),
      })

      // Check if response is JSON BEFORE trying to parse
      const contentType = response.headers.get('content-type')

      if (!contentType || !contentType.includes('application/json')) {
        // Server returned HTML or other non-JSON response
        const textResponse = await response.text()
        console.error('Non-JSON response:', textResponse.substring(0, 500))

        if (textResponse.includes('<!DOCTYPE') || textResponse.includes('<html')) {
          throw new Error(
            '⚠️ Server Error: The API returned an HTML error page instead of JSON. ' +
            'This usually means:\n\n' +
            '1. ANTHROPIC_API_KEY is not set in your environment variables\n' +
            '2. There\'s a server configuration issue\n' +
            '3. The route failed to load\n\n' +
            'Please check your .env.local file and restart the server.'
          )
        }

        throw new Error('Server returned an invalid response: ' + textResponse.substring(0, 200))
      }

      // Now safe to parse JSON
      let data
      try {
        data = await response.json()
      } catch (parseError: any) {
        console.error('JSON parse error:', parseError)
        throw new Error(
          '⚠️ Failed to parse server response. ' +
          'The server might be returning an error page. ' +
          'Please check if ANTHROPIC_API_KEY is set and restart the server.'
        )
      }

      // Check response status and data
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to analyze competitor')
      }

      if (!data.success) {
        throw new Error(data.message || data.error || 'Analysis failed')
      }

      setResults(data)
    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              MarketMind AI
            </Link>
            <div className="flex gap-8 items-center">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Why MarketMind AI
              </Link>
              <Link href="/#about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link href="/analyze" className="text-[#D9FB60] font-semibold">
                Analyze
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-gray-900 transition-colors">
                Idea Validator
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Competitor Analysis
          </h1>
          <p className="text-xl text-gray-600">
            Get AI-powered insights about your competitors
          </p>
        </div>

        {/* Analysis Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleAnalyze} className="space-y-6">
            <div>
              <label htmlFor="competitorName" className="block text-sm font-semibold text-gray-900 mb-2">
                Competitor Name
              </label>
              <input
                type="text"
                id="competitorName"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                placeholder="e.g., SLACK"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-gray-900 mb-2">
                Website
              </label>
              <input
                type="text"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://slack.com/"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Required - Enter competitor's website to analyze
              </p>
            </div>

            <div>
              <label htmlFor="industry" className="block text-sm font-semibold text-gray-900 mb-2">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g., Productivity SaaS, FinTech"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="additionalContext" className="block text-sm font-semibold text-gray-900 mb-2">
                Additional Context (Optional)
              </label>
              <textarea
                id="additionalContext"
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="Recent funding, product launches, pivot info..."
                rows={4}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-300 focus:border-transparent outline-none transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-[#D9FB60] hover:bg-[#c8ea4f] text-gray-900 font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Start Analysis'
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-1">Error</h3>
                <p className="text-red-700 whitespace-pre-line">{error}</p>
                <div className="mt-4 text-sm text-red-600">
                  <p className="font-semibold mb-2">Common issues:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Missing ANTHROPIC_API_KEY environment variable</li>
                    <li>Website is blocking automated access</li>
                    <li>Invalid URL format</li>
                    <li>Network connectivity issues</li>
                  </ul>
                  <div className="mt-4">
                    <a
                      href="/api/health"
                      target="_blank"
                      className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                    >
                      🔍 Check API Configuration
                    </a>
                    <p className="text-xs text-red-500 mt-2">
                      Click above to verify your API key is configured correctly
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Display */}
        {results && results.success && results.data && (
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            <div className="border-b pb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{competitorName}</h2>
              <a href={results.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">
                {results.url}
              </a>
            </div>

            {/* Description */}
            {results.data.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{results.data.description}</p>
              </div>
            )}

            {/* Target Market */}
            {results.data.targetMarket && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Target Market</h3>
                <p className="text-gray-700">{results.data.targetMarket}</p>
              </div>
            )}

            {/* Positioning */}
            {results.data.positioning && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Positioning</h3>
                <p className="text-gray-700">{results.data.positioning}</p>
              </div>
            )}

            {/* Features */}
            {results.data.features && results.data.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {results.data.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pricing */}
            {results.data.pricing && results.data.pricing.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pricing</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {results.data.pricing.map((tier, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-purple-50">
                      <h4 className="font-semibold text-gray-900 mb-1">{tier.tier}</h4>
                      <p className="text-2xl font-bold text-purple-600 mb-3">{tier.price}</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {tier.features.slice(0, 5).map((feature, fidx) => (
                          <li key={fidx} className="flex items-start gap-1">
                            <span className="text-purple-500">•</span>
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Testimonials */}
            {results.data.testimonials && results.data.testimonials.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Testimonials</h3>
                <div className="space-y-4">
                  {results.data.testimonials.map((testimonial, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400">
                      <p className="text-gray-700 italic mb-2">"{testimonial.quote}"</p>
                      {(testimonial.company || testimonial.role) && (
                        <p className="text-sm text-gray-600">
                          {testimonial.role && <span>{testimonial.role}</span>}
                          {testimonial.company && testimonial.role && <span> at </span>}
                          {testimonial.company && <span className="font-semibold">{testimonial.company}</span>}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
