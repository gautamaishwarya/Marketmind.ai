'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, ArrowLeft, Loader2 } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const DISCOVERY_QUESTIONS = [
  "Hey! I'm Scout, your AI market research agent. I'm here to help you understand your market and find your ideal customers. What are you building?",
  "Great! Tell me more about the problem you're solving. Who currently struggles with this problem the most?",
  "Interesting! What's your target market? Are you focused on B2B, B2C, or both?",
  "Got it. Do you have any idea who your main competitors are? Or what alternatives people currently use?",
  "Perfect! Based on what you've shared, I can help you with:\n\n1. Detailed ICP personas with pain points\n2. Competitive analysis\n3. Market size estimation\n4. Go-to-market channel recommendations\n\nWhat would you like to dive into first?"
]

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: DISCOVERY_QUESTIONS[0] }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [questionIndex, setQuestionIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Simulate Scout's response
    setTimeout(() => {
      const nextIndex = questionIndex + 1
      if (nextIndex < DISCOVERY_QUESTIONS.length) {
        const scoutResponse: Message = {
          role: 'assistant',
          content: DISCOVERY_QUESTIONS[nextIndex]
        }
        setMessages(prev => [...prev, scoutResponse])
        setQuestionIndex(nextIndex)
      } else {
        // Final response with insights
        const finalResponse: Message = {
          role: 'assistant',
          content: `Thanks for sharing all that! Based on our conversation, here's a quick summary:\n\n📊 **What I learned:**\n- Your product targets a specific pain point\n- You have a clear value proposition\n- There's competition but also opportunity\n\n💡 **Next Steps:**\n\nTo give you a complete market research report with detailed ICP personas, competitive analysis, and market sizing, I'll need to do a deep dive. This typically includes:\n\n1. Analyzing 50+ competitors\n2. Generating 3-5 detailed personas\n3. Calculating TAM/SAM/SOM\n4. Identifying best distribution channels\n\n**Note:** This demo shows Scout's conversational approach. In the full version, Scout uses real AI (Claude API) to generate comprehensive market research based on your specific business.\n\nWant to upgrade to get your full research report? 🚀`
        }
        setMessages(prev => [...prev, finalResponse])
      }
      setIsLoading(false)
    }, 1000 + Math.random() * 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <span className="font-semibold text-gray-900">Chat with Scout</span>
          </div>
          <div className="w-24"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-900 shadow-sm border border-gray-200'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-semibold text-purple-600">Scout</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-6 py-4 shadow-sm border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 text-purple-600 animate-spin" />
                  <span className="text-gray-600">Scout is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your answer here..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '200px' }}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This is a demo with simulated responses. The full version uses real AI for market research.
          </p>
        </div>
      </div>
    </div>
  )
}
