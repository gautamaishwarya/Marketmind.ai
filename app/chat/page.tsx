'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Send, ArrowLeft, Loader2, Phone, PhoneOff } from 'lucide-react'

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

  // Voice state - simplified
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
        // Restart listening if still in call
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
    const userMsg: Message = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        }),
      })

      if (!response.ok) throw new Error('API request failed')

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

      // Speak the response
      if (aiResponse && shouldContinueRef.current) {
        await speak(aiResponse)

        // Restart listening after speaking
        if (shouldContinueRef.current) {
          setTimeout(() => startListening(), 500)
        }
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMsg = "Sorry, I had trouble connecting. Let's try again."
      setMessages([...updated, { role: 'assistant', content: errorMsg }])

      if (shouldContinueRef.current) {
        setTimeout(() => startListening(), 1000)
      }
    }
  }

  const startCall = async () => {
    try {
      // Request mic permission
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

  // Handle text messages
  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg: Message = { role: 'user', content: input }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsLoading(true)

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

      setIsLoading(false)
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMsg = error.message.includes('API key')
        ? "⚠️ API key not configured. Please add ANTHROPIC_API_KEY to environment variables."
        : error.message.includes('credit')
        ? "⚠️ API credits are low. Please add credits to your Anthropic account."
        : "⚠️ Something went wrong. Please try again."

      setMessages([...updated, { role: 'assistant', content: errorMsg }])
      setIsLoading(false)
    }
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

          {isLoading && !isCallActive && (
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

      {/* Input Area - Hidden during call */}
      {!isCallActive && (
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
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-7 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold"
              >
                <span>Send</span>
                <Send className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3 text-center">
              💬 Powered by Claude AI • Click the phone icon to start a voice conversation
            </p>
          </div>
        </div>
      )}

      {/* Large Floating Phone Button */}
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
