'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, ArrowLeft, Loader2, Mic, MicOff, Volume2, VolumeX, StopCircle } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hey! I'm Scout, your AI market research agent. I'm here to help you understand your market and find your ideal customers. What are you building?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Voice state
  const [isVoiceMode, setIsVoiceMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech synthesis
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
  useEffect(() => {
    if (typeof window !== 'undefined' && isVoiceMode) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [isVoiceMode])

  // Toggle listening
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge.')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  // Speak text
  const speakText = (text: string) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
      currentUtteranceRef.current = utterance
    }

    utterance.onend = () => {
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    }

    utterance.onerror = () => {
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    }

    synthRef.current.speak(utterance)
  }

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
      currentUtteranceRef.current = null
    }
  }

  // Send message to Claude API
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: input }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      // Call the API with full conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: updatedMessages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
      }

      // Read the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantMessage += chunk

          // Update the message in real-time
          setMessages([...updatedMessages, { role: 'assistant', content: assistantMessage }])
        }
      }

      // Auto-speak in voice mode
      if (isVoiceMode && assistantMessage) {
        speakText(assistantMessage)
      }

      setIsLoading(false)
    } catch (error: any) {
      console.error('Chat error:', error)

      const errorMessage = error.message.includes('API key')
        ? "⚠️ API key not configured. Please add your ANTHROPIC_API_KEY to the .env.local file and restart the server."
        : error.message.includes('Rate limit')
        ? "⚠️ Rate limit exceeded. Please wait a moment and try again."
        : `⚠️ Error: ${error.message || 'Failed to get response from Scout. Please try again.'}`;

      setMessages([...updatedMessages, {
        role: 'assistant',
        content: errorMessage
      }])
      setIsLoading(false)
    }
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
          {/* Voice Mode Toggle */}
          <button
            onClick={() => {
              setIsVoiceMode(!isVoiceMode)
              if (isVoiceMode) {
                stopSpeaking()
                if (recognitionRef.current) {
                  recognitionRef.current.stop()
                }
              }
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
              isVoiceMode
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isVoiceMode ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="text-sm font-medium">Voice {isVoiceMode ? 'On' : 'Off'}</span>
          </button>
        </div>
      </header>

      {/* Voice Status Banner */}
      {isVoiceMode && (isListening || isSpeaking) && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {isListening && (
                <>
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-6 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-purple-700 font-medium">🎤 Listening...</span>
                </>
              )}
              {isSpeaking && (
                <>
                  <div className="flex space-x-1">
                    <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1 h-6 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-purple-700 font-medium">🔊 Scout is speaking...</span>
                </>
              )}
            </div>
            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="flex items-center space-x-2 px-3 py-1 bg-white rounded-lg hover:bg-gray-50 transition"
              >
                <StopCircle className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Stop</span>
              </button>
            )}
          </div>
        </div>
      )}

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
            {/* Voice Input Button */}
            {isVoiceMode && (
              <button
                onClick={toggleListening}
                disabled={isLoading || isSpeaking}
                className={`p-3 rounded-xl transition flex-shrink-0 ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}

            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isVoiceMode ? "Click the mic or type your answer..." : "Type your answer here..."}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '200px' }}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 flex-shrink-0"
            >
              <span>Send</span>
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            {isVoiceMode
              ? '🎤 Voice mode active. Click the mic to speak or type your response.'
              : '💬 Powered by Claude AI. Scout remembers your conversation context.'}
          </p>
        </div>
      </div>
    </div>
  )
}
