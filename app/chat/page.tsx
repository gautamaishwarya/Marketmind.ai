'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, ArrowLeft, Loader2, Phone, PhoneOff, FileText, Download, CheckCircle2, Target, TrendingUp, Users } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ResearchData {
  product?: string
  targetMarket?: string
  competitors?: string[]
}

type ResearchStage = 'idle' | 'collecting' | 'researching' | 'complete'

const RESEARCH_STEPS = [
  { id: 'competitors', label: 'Discovering competitors', icon: Target },
  { id: 'market', label: 'Analyzing market size', icon: TrendingUp },
  { id: 'icp', label: 'Building ICP profiles', icon: Users },
  { id: 'frameworks', label: 'Running business frameworks', icon: CheckCircle2 },
  { id: 'synthesis', label: 'Generating insights', icon: Sparkles },
]

export default function ChatPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Scout, your AI market research agent. I'll help you understand your market and find your ideal customers through comprehensive competitive intelligence.\n\nWhat product or service are you building?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Research state
  const [researchStage, setResearchStage] = useState<ResearchStage>('collecting')
  const [researchData, setResearchData] = useState<ResearchData>({})
  const [currentResearchStep, setCurrentResearchStep] = useState(0)
  const [researchResults, setResearchResults] = useState<any>(null)

  // Voice state
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle')

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const shouldContinueRef = useRef(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  const setupRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) return null

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setCallStatus('listening')

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      if (transcript && shouldContinueRef.current) {
        await handleVoiceMessage(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech error:', event.error)
      if (event.error === 'not-allowed') {
        endCall()
        alert('Microphone access denied. Please allow microphone access.')
      } else if (event.error === 'no-speech') {
        if (shouldContinueRef.current) {
          setTimeout(() => startListening(), 500)
        }
      }
    }

    recognition.onend = () => {
      if (callStatus === 'listening') {
        setCallStatus('idle')
      }
    }

    return recognition
  }

  const startListening = () => {
    if (!recognitionRef.current || !shouldContinueRef.current) return

    try {
      setCallStatus('listening')
      recognitionRef.current.start()
    } catch (error: any) {
      if (error.name === 'InvalidStateError') {
        // Already listening, ignore
      } else {
        console.error('Start error:', error)
      }
    }
  }

  const speak = async (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve()
        return
      }

      synthRef.current.cancel()
      const utterance = new SpeechSynthesisUtterance(text)

      utterance.onstart = () => setCallStatus('speaking')
      utterance.onend = () => {
        setCallStatus('idle')
        resolve()
      }
      utterance.onerror = () => {
        setCallStatus('idle')
        resolve()
      }

      synthRef.current.speak(utterance)
    })
  }

  const handleVoiceMessage = async (text: string) => {
    if (!text.trim()) return

    setCallStatus('thinking')
    await handleSend(text)

    if (shouldContinueRef.current) {
      setTimeout(() => startListening(), 500)
    }
  }

  const startCall = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => stream.getTracks().forEach(track => track.stop()))

      recognitionRef.current = setupRecognition()
      if (!recognitionRef.current) {
        alert('Voice not supported in your browser. Please use Chrome, Safari, or Edge.')
        return
      }

      setIsCallActive(true)
      shouldContinueRef.current = true
      setTimeout(() => startListening(), 500)
    } catch (error) {
      alert('Please allow microphone access to use voice chat.')
    }
  }

  const endCall = () => {
    shouldContinueRef.current = false
    setIsCallActive(false)
    setCallStatus('idle')

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch (e) {}
      recognitionRef.current = null
    }
    if (synthRef.current) {
      synthRef.current.cancel()
    }
  }

  useEffect(() => {
    return () => {
      shouldContinueRef.current = false
      if (recognitionRef.current) {
        try { recognitionRef.current.abort() } catch (e) {}
      }
      if (synthRef.current) synthRef.current.cancel()
    }
  }, [])

  // Research triggering logic
  const shouldTriggerResearch = (userInput: string, conversationHistory: Message[]): boolean => {
    // Trigger research if user has mentioned their product
    const hasProduct = researchData.product !== undefined
    const mentionsMarket = userInput.toLowerCase().includes('team') ||
                          userInput.toLowerCase().includes('market') ||
                          conversationHistory.length >= 3

    return hasProduct && mentionsMarket && researchStage === 'collecting'
  }

  const extractResearchData = (userInput: string): Partial<ResearchData> => {
    const data: Partial<ResearchData> = {}

    // Simple extraction logic - in production, use Claude to extract
    if (!researchData.product && messages.length === 1) {
      data.product = userInput
    }

    if (userInput.toLowerCase().includes('team') && !researchData.targetMarket) {
      // Extract target market
      const marketMatch = userInput.match(/for\s+(\w+\s+\w+)/i)
      if (marketMatch) {
        data.targetMarket = marketMatch[1]
      }
    }

    return data
  }

  const triggerResearch = async () => {
    setResearchStage('researching')

    // Add message about starting research
    const researchMessage: Message = {
      role: 'assistant',
      content: `Perfect! I have enough information to run comprehensive research. Let me analyze your market:\n\n📊 Running competitive intelligence...\n🎯 Building ICP profiles...\n💡 Analyzing frameworks...\n\nThis will take about 2-3 minutes. I'll show you the progress!`
    }
    setMessages(prev => [...prev, researchMessage])

    // Simulate research progress
    for (let i = 0; i < RESEARCH_STEPS.length; i++) {
      setCurrentResearchStep(i)
      await new Promise(resolve => setTimeout(resolve, 3000))
    }

    // Call research API
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product: researchData.product,
          targetMarket: researchData.targetMarket || 'general market',
        })
      })

      const data = await response.json()

      if (data.success) {
        setResearchResults(data.results)
        setResearchStage('complete')

        const completionMessage: Message = {
          role: 'assistant',
          content: `🎉 Research complete! I've analyzed your market comprehensively.\n\n**Here's what I found:**\n\n📊 **Market Intelligence**\n- Identified top 5 competitors\n- Analyzed pricing strategies\n- Mapped market positioning\n\n🎯 **ICP Analysis**\n- Created 2 detailed customer profiles\n- Found key pain points from real data\n- Identified buying triggers\n\n💡 **Strategic Insights**\n- SWOT analysis for each competitor\n- Porter's Five Forces framework\n- Positioning recommendations\n\nClick "Download Report" to get your full 20-page GTM research report!`
        }
        setMessages(prev => [...prev, completionMessage])
      }
    } catch (error) {
      console.error('Research failed:', error)
      setResearchStage('collecting')
    }
  }

  // Handle text messages
  const handleSend = async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: messageText }
    const updated = [...messages, userMsg]
    setMessages(updated)
    if (!text) setInput('')
    setIsLoading(true)

    // Extract research data
    const extracted = extractResearchData(messageText)
    setResearchData(prev => ({ ...prev, ...extracted }))

    // Check if we should trigger research
    if (shouldTriggerResearch(messageText, updated)) {
      setIsLoading(false)
      await triggerResearch()
      return
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Request failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let aiResponse = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          aiResponse += decoder.decode(value, { stream: true })
          setMessages([...updated, { role: 'assistant', content: aiResponse }])
        }
      }

      // Auto-speak if in voice mode
      if (isCallActive && aiResponse) {
        await speak(aiResponse)
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMsg = "⚠️ Something went wrong. Please try again."
      setMessages([...updated, { role: 'assistant', content: errorMsg }])
      setIsLoading(false)
    }
  }

  const downloadReport = () => {
    // TODO: Generate and download PDF report
    alert('Report generation coming soon! Your comprehensive GTM research will be available as a professional PDF.')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-gray-900">Chat with Scout</span>
          </div>
          <div className="w-32"></div>
        </div>
      </header>

      {/* Voice Status */}
      {isCallActive && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
            {callStatus === 'listening' && (
              <>
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-purple-700 font-semibold">🎤 I'm listening...</span>
              </>
            )}
            {callStatus === 'thinking' && (
              <>
                <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                <span className="text-purple-700 font-semibold">Scout is thinking...</span>
              </>
            )}
            {callStatus === 'speaking' && (
              <>
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-green-600 rounded-full animate-pulse"></div>
                  <div className="w-1 h-6 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></div>
                  <div className="w-1 h-4 bg-green-600 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                </div>
                <span className="text-green-700 font-semibold">🔊 Scout is speaking...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Research Progress */}
      {researchStage === 'researching' && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-200 px-4 py-6">
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
                      isComplete ? 'bg-green-100' :
                      isCurrent ? 'bg-blue-100 animate-pulse' :
                      'bg-white opacity-50'
                    }`}
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-gray-400" />
                    )}
                    <span className={`font-medium ${
                      isComplete ? 'text-green-700' :
                      isCurrent ? 'text-blue-700' :
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
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-500"
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
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                    : 'bg-white text-gray-900 shadow-md border border-gray-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-bold text-purple-600">Scout</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {/* Download Report Button */}
          {researchStage === 'complete' && (
            <div className="flex justify-center animate-fade-in">
              <button
                onClick={downloadReport}
                className="flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <FileText className="h-6 w-6" />
                <span className="font-bold text-lg">Download Full Report</span>
                <Download className="h-5 w-5" />
              </button>
            </div>
          )}

          {isLoading && !isCallActive && researchStage !== 'researching' && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-md border border-gray-100">
                <div className="flex items-center space-x-3">
                  <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                  <span className="text-gray-600 font-medium">Scout is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      {!isCallActive && researchStage !== 'researching' && (
        <div className="bg-white border-t border-gray-200 px-4 py-5 shadow-lg">
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
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-400"
                  rows={1}
                  style={{ minHeight: '56px', maxHeight: '200px' }}
                  disabled={isLoading}
                />
              </div>
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isLoading}
                className="px-7 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
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

      {/* Floating Phone Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {!isCallActive ? (
          <button
            onClick={startCall}
            className="group w-20 h-20 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center transform hover:scale-110"
            title="Start voice call with Scout"
          >
            <Phone className="h-9 w-9 group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <button
            onClick={endCall}
            className="group w-20 h-20 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-full shadow-2xl hover:shadow-red-500/50 transition-all duration-300 flex items-center justify-center animate-pulse transform hover:scale-110"
            title="End voice call"
          >
            <PhoneOff className="h-9 w-9 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Call Active Badge */}
      {isCallActive && (
        <div className="fixed bottom-32 right-8 z-40 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-5 py-2 rounded-full shadow-lg text-sm font-bold animate-fade-in">
          📞 Call Active
        </div>
      )}
    </div>
  )
}
