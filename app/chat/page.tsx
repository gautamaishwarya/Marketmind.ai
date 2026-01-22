'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, ArrowLeft, Loader2, FileText, Download, CheckCircle2, Target, TrendingUp, Users, Upload } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

type Stage = 'pre-launch' | 'early-stage' | 'post-revenue' | 'scale-up' | null
type ResearchPhase = 'stage-selection' | 'collecting' | 'researching' | 'complete'

interface CollectedData {
  stage: Stage
  product?: string
  targetICP?: string
  problem?: string
  competitors?: string[]
  differentiation?: string
  customerPatterns?: string
  csvData?: string
}

const STAGE_OPTIONS = [
  {
    value: 'pre-launch',
    emoji: '🚀',
    label: 'Pre-Launch',
    description: 'No customers yet, still building'
  },
  {
    value: 'early-stage',
    emoji: '🌱',
    label: 'Early Stage',
    description: '1-20 customers/users'
  },
  {
    value: 'post-revenue',
    emoji: '💰',
    label: 'Post-Revenue',
    description: '20-100 customers, generating revenue'
  },
  {
    value: 'scale-up',
    emoji: '📈',
    label: 'Scale-Up',
    description: '100+ customers, looking to optimize'
  }
]

const RESEARCH_STEPS = [
  { id: 'scraping', label: 'Scraping competitor websites', icon: Target },
  { id: 'analysis', label: 'Analyzing market data', icon: TrendingUp },
  { id: 'icp', label: 'Building ICP profiles', icon: Users },
  { id: 'frameworks', label: 'Running business frameworks', icon: CheckCircle2 },
  { id: 'synthesis', label: 'Generating strategic insights', icon: Sparkles },
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Scout 👋, your AI market research analyst.\n\nI help founders like you discover their real ICP and understand their competitive landscape—whether you're just starting out or scaling fast.\n\nFirst question: **Where are you at with your startup?**"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Research state
  const [phase, setPhase] = useState<ResearchPhase>('stage-selection')
  const [collectedData, setCollectedData] = useState<CollectedData>({ stage: null })
  const [questionIndex, setQuestionIndex] = useState(0)
  const [currentResearchStep, setCurrentResearchStep] = useState(0)
  const [researchResults, setResearchResults] = useState<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get questions based on stage
  const getQuestionsForStage = (stage: Stage): string[] => {
    switch (stage) {
      case 'pre-launch':
        return [
          "Got it! What are you building? (Give me a quick overview)",
          "Who do you think your ideal customer is? (Role, industry, company size—best guess is fine)",
          "What problem are you solving, and why will people pay for it?",
          "Who are your 3-5 main competitors? (Just names or websites)",
          "What makes you different from them?"
        ]
      case 'early-stage':
        return [
          "Awesome! What's your product?",
          "Tell me about your first 5-20 customers/users:\n- What roles do they have?\n- What companies/industries?\n- Any patterns you're seeing?",
          "Who's converting vs. who's ghosting you? Any patterns?",
          "Who are your 3-5 main competitors?",
          "What's working in your GTM so far? What's not?"
        ]
      case 'post-revenue':
        return [
          "Nice! What does your product do?",
          "You have 20-100 customers—do you have data you can share?\n\nOption A: Upload a CSV with customer data\nOption B: I'll describe the patterns I'm seeing",
          "What segments are you seeing? Which convert best? Which have highest LTV? Which churn fastest?",
          "Who are your 3-5 main competitors?",
          "What's your biggest uncertainty right now? (ICP, pricing, channels, positioning?)"
        ]
      case 'scale-up':
        return [
          "Impressive! Tell me about your product.",
          "With 100+ customers, you likely have segments. What are you seeing?\n- Which segments are most valuable?\n- Which scale best?\n- Which are you unsure about?",
          "Upload customer data (CSV) or describe your top 3 segments",
          "Main competitors? (Up to 5)",
          "What's your growth goal? (Expand current ICP, find new segments, optimize, or prepare for enterprise?)"
        ]
      default:
        return []
    }
  }

  // Handle stage selection
  const handleStageSelection = (stage: Stage) => {
    setCollectedData({ stage })
    setPhase('collecting')
    setQuestionIndex(0)

    const stageLabel = STAGE_OPTIONS.find(opt => opt.value === stage)?.label || stage

    // Add user message
    const userMsg: Message = {
      role: 'user',
      content: `${STAGE_OPTIONS.find(opt => opt.value === stage)?.emoji} ${stageLabel}`
    }

    // Add Scout's next question
    const questions = getQuestionsForStage(stage)
    const scoutMsg: Message = {
      role: 'assistant',
      content: questions[0]
    }

    setMessages([...messages, userMsg, scoutMsg])
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvData = event.target?.result as string
      setCollectedData(prev => ({ ...prev, csvData }))

      const userMsg: Message = {
        role: 'user',
        content: `✅ Uploaded CSV file: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      }
      setMessages(prev => [...prev, userMsg])

      // Move to next question
      proceedToNextQuestion()
    }

    reader.readAsText(file)
  }

  const proceedToNextQuestion = async () => {
    const questions = getQuestionsForStage(collectedData.stage!)
    const nextIndex = questionIndex + 1

    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex)

      const scoutMsg: Message = {
        role: 'assistant',
        content: questions[nextIndex]
      }

      setMessages(prev => [...prev, scoutMsg])
    } else {
      // All questions answered, trigger research
      await triggerResearch()
    }
  }

  const triggerResearch = async () => {
    setPhase('researching')

    const researchMessage: Message = {
      role: 'assistant',
      content: `Perfect! I have everything I need. Let me analyze your market and competitors.\n\nI'll:\n- Scrape your competitors' websites for positioning, pricing, and target customers\n- Analyze market data and identify ICP patterns\n- Run SWOT analysis and Porter's Five Forces\n- Generate strategic recommendations\n\nThis takes 2-3 minutes. Watch the progress below! 👇`
    }
    setMessages(prev => [...prev, researchMessage])

    // Simulate research progress
    for (let i = 0; i < RESEARCH_STEPS.length; i++) {
      setCurrentResearchStep(i)
      await new Promise(resolve => setTimeout(resolve, i === 0 ? 5000 : 3000))
    }

    // Call research API
    try {
      // First, analyze CSV if provided (post-revenue or scale-up)
      let csvAnalysis = null
      if (collectedData.csvData && (collectedData.stage === 'post-revenue' || collectedData.stage === 'scale-up')) {
        const csvResponse = await fetch('/api/analyze-csv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csvData: collectedData.csvData })
        })

        if (csvResponse.ok) {
          const csvResult = await csvResponse.json()
          csvAnalysis = csvResult.analysis
        }
      }

      // Call main research API
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: collectedData.product,
          stage: collectedData.stage,
          targetMarket: collectedData.targetICP,
          competitors: collectedData.competitors,
          additionalContext: {
            problem: collectedData.problem,
            differentiation: collectedData.differentiation,
            customerPatterns: collectedData.customerPatterns,
          },
          csvAnalysis,
        })
      })

      const data = await response.json()

      if (data.success) {
        setResearchResults(data.results)
        setPhase('complete')

        const completionMessage: Message = {
          role: 'assistant',
          content: `🎉 **Research Complete!**\n\nI've analyzed your market comprehensively. Here's what I found:\n\n📊 **Market Intelligence**\n- Identified ${data.results.competitors?.length || 'top'} competitors\n- Analyzed pricing strategies and positioning\n- Mapped competitive landscape\n\n🎯 **ICP Analysis**\n- Created ${data.results.icpProfiles?.length || 3} detailed customer profiles\n- Identified key pain points from real market data\n- Pinpointed buying triggers and channels\n\n💡 **Strategic Insights**\n- SWOT analysis for each competitor\n- Porter's Five Forces framework\n- Positioning and pricing recommendations\n\nClick "Download Report" below to get your full GTM research report! 📄`
        }
        setMessages(prev => [...prev, completionMessage])
      }
    } catch (error) {
      console.error('Research failed:', error)
      setPhase('collecting')

      const errorMsg: Message = {
        role: 'assistant',
        content: "⚠️ Oops! Something went wrong with the research. Let's try again. Can you provide the competitor URLs one more time?"
      }
      setMessages(prev => [...prev, errorMsg])
    }
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')

    // Store the collected data based on question index
    const questions = getQuestionsForStage(collectedData.stage!)
    const currentQuestion = questions[questionIndex]

    if (questionIndex === 0) {
      setCollectedData(prev => ({ ...prev, product: input }))
    } else if (currentQuestion.toLowerCase().includes('ideal customer') || currentQuestion.toLowerCase().includes('who do you think')) {
      setCollectedData(prev => ({ ...prev, targetICP: input }))
    } else if (currentQuestion.toLowerCase().includes('problem')) {
      setCollectedData(prev => ({ ...prev, problem: input }))
    } else if (currentQuestion.toLowerCase().includes('competitors')) {
      // Parse competitors from input
      const competitors = input.split(/[,\n]/).map(c => {
        let url = c.trim()
        if (!url.startsWith('http')) {
          url = 'https://' + url.replace(/^(www\.)?/, 'www.')
        }
        return url
      }).filter(c => c.length > 0)
      setCollectedData(prev => ({ ...prev, competitors }))
    } else if (currentQuestion.toLowerCase().includes('different')) {
      setCollectedData(prev => ({ ...prev, differentiation: input }))
    } else if (currentQuestion.toLowerCase().includes('customers') || currentQuestion.toLowerCase().includes('patterns')) {
      setCollectedData(prev => ({ ...prev, customerPatterns: input }))
    }

    // If in collecting phase, ask next question or trigger research
    if (phase === 'collecting') {
      await proceedToNextQuestion()
    } else {
      // Regular chat mode (after research complete)
      setIsLoading(true)

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
          }),
        })

        if (!response.ok) {
          throw new Error('Chat request failed')
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        let aiResponse = ''

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            aiResponse += decoder.decode(value, { stream: true })
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMsg = newMessages[newMessages.length - 1]
              if (lastMsg?.role === 'assistant') {
                newMessages[newMessages.length - 1] = { role: 'assistant', content: aiResponse }
              } else {
                newMessages.push({ role: 'assistant', content: aiResponse })
              }
              return newMessages
            })
          }
        }

        setIsLoading(false)
      } catch (error: any) {
        console.error('Chat error:', error)
        const errorMsg: Message = {
          role: 'assistant',
          content: "⚠️ Something went wrong. Please try again."
        }
        setMessages(prev => [...prev, errorMsg])
        setIsLoading(false)
      }
    }
  }

  const downloadReport = async () => {
    if (!researchResults) return

    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchData: researchResults,
          userInfo: {
            product: collectedData.product,
            stage: collectedData.stage,
            targetMarket: collectedData.targetICP,
          }
        })
      })

      if (!response.ok) {
        throw new Error('PDF generation failed')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `MarketMind-Report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download report. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-soft">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-primary-300" />
            <span className="font-semibold text-gray-900">Chat with Scout</span>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      {/* Research Progress */}
      {phase === 'researching' && (
        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-b border-primary-200 px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔍 Running Comprehensive Research...</h3>
              <p className="text-sm text-gray-600">Analyzing competitors, market data, and building ICP profiles</p>
            </div>

            <div className="space-y-3">
              {RESEARCH_STEPS.map((step, index) => {
                const isComplete = index < currentResearchStep
                const isCurrent = index === currentResearchStep
                const Icon = step.icon

                return (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                      isComplete ? 'bg-secondary-100' :
                      isCurrent ? 'bg-primary-100 animate-pulse' :
                      'bg-white opacity-50'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-secondary-700" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={`font-medium ${
                      isComplete ? 'text-secondary-900' :
                      isCurrent ? 'text-primary-700' :
                      'text-gray-500'
                    }`}>
                      {step.label}
                      {isComplete && ' ✓'}
                    </span>
                  </div>
                )
              })}
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-primary-400 to-secondary-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentResearchStep / RESEARCH_STEPS.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-primary-300 text-white shadow-card'
                    : 'bg-white text-gray-900 shadow-soft border border-gray-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary-600" />
                    </div>
                    <span className="text-sm font-bold text-primary-600">Scout</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Stage Selection Buttons */}
          {phase === 'stage-selection' && messages.length === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
              {STAGE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStageSelection(option.value as Stage)}
                  className="p-6 bg-white hover:bg-primary-50 border-2 border-gray-200 hover:border-primary-300 rounded-xl transition-all text-left group shadow-soft hover:shadow-card"
                >
                  <div className="text-4xl mb-3">{option.emoji}</div>
                  <div className="font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </button>
              ))}
            </div>
          )}

          {/* CSV Upload Option */}
          {phase === 'collecting' && questionIndex === 1 &&
           (collectedData.stage === 'post-revenue' || collectedData.stage === 'scale-up') && (
            <div className="flex justify-center animate-fade-in">
              <label className="flex items-center space-x-3 px-6 py-3 bg-secondary-100 hover:bg-secondary-200 border-2 border-secondary-300 rounded-lg cursor-pointer transition-all group">
                <Upload className="h-5 w-5 text-secondary-700" />
                <span className="font-semibold text-secondary-900">Upload CSV File</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {/* Download Report Button */}
          {phase === 'complete' && (
            <div className="flex justify-center animate-fade-in">
              <button
                onClick={downloadReport}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-secondary-300 to-secondary-400 hover:from-secondary-400 hover:to-secondary-500 text-gray-900 rounded-xl transition-all shadow-card hover:shadow-lift transform hover:scale-105 font-bold"
              >
                <FileText className="h-6 w-6" />
                <span className="text-lg">Download Full Report</span>
                <Download className="h-5 w-5" />
              </button>
            </div>
          )}

          {isLoading && phase !== 'researching' && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white rounded-xl px-6 py-4 shadow-soft border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 text-primary-600 animate-spin" />
                  <span className="text-gray-600 font-medium">Scout is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {phase !== 'researching' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-5 shadow-lift">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-4">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSend()
                    }
                  }}
                  placeholder="Type your answer here..."
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                  disabled={isLoading || phase === 'stage-selection'}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading || phase === 'stage-selection'}
                className="px-7 py-4 bg-primary-300 hover:bg-primary-400 text-white rounded-xl transition-all shadow-soft hover:shadow-card disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
              >
                <span>Send</span>
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              💬 Powered by Claude AI • Comprehensive GTM research in minutes
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
