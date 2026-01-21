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

  // Voice call state
  const [isCallActive, setIsCallActive] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceError, setVoiceError] = useState<string | null>(null)

  // Voice refs
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const shouldContinueListeningRef = useRef(false)
  const isProcessingRef = useRef(false)

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
  const initializeSpeechRecognition = () => {
    if (typeof window === 'undefined') return null

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in your browser. Please use Chrome, Safari, or Edge.')
      return null
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setVoiceError(null)
    }

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript
      setIsListening(false)

      // Only process if we're in an active call and not already processing
      if (shouldContinueListeningRef.current && !isProcessingRef.current) {
        isProcessingRef.current = true
        await handleVoiceInput(transcript)
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)

      if (event.error === 'not-allowed') {
        setVoiceError('Microphone access denied. Please allow microphone access and try again.')
        endCall()
      } else if (event.error === 'no-speech') {
        // No speech detected, restart listening if call is still active
        if (shouldContinueListeningRef.current && !isProcessingRef.current) {
          setTimeout(() => startListening(), 500)
        }
      } else {
        // For other errors, try to restart listening
        if (shouldContinueListeningRef.current && !isProcessingRef.current) {
          setTimeout(() => startListening(), 1000)
        }
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      // Don't auto-restart here - we handle it after Scout finishes speaking
    }

    return recognition
  }

  // Start listening
  const startListening = () => {
    if (!recognitionRef.current || isProcessingRef.current) return

    try {
      recognitionRef.current.start()
    } catch (error) {
      console.error('Error starting recognition:', error)
      // If already started, stop and restart
      try {
        recognitionRef.current.stop()
        setTimeout(() => {
          if (shouldContinueListeningRef.current && recognitionRef.current) {
            recognitionRef.current.start()
          }
        }, 500)
      } catch (e) {
        console.error('Error restarting recognition:', e)
      }
    }
  }

  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (error) {
        console.error('Error stopping recognition:', error)
      }
    }
    setIsListening(false)
  }

  // Speak text with voice
  const speakText = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      if (!synthRef.current) {
        resolve()
        return
      }

      // Cancel any ongoing speech
      synthRef.current.cancel()

      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onstart = () => {
        setIsSpeaking(true)
      }

      utterance.onend = () => {
        setIsSpeaking(false)
        resolve()
      }

      utterance.onerror = () => {
        setIsSpeaking(false)
        resolve()
      }

      synthRef.current.speak(utterance)
    })
  }

  // Handle voice input
  const handleVoiceInput = async (transcript: string) => {
    if (!transcript.trim()) {
      isProcessingRef.current = false
      return
    }

    // Add user message
    const userMessage: Message = { role: 'user', content: transcript }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      // Call Claude API
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

      setIsLoading(false)

      // Speak Scout's response
      if (assistantMessage && shouldContinueListeningRef.current) {
        await speakText(assistantMessage)

        // After speaking, restart listening if call is still active
        isProcessingRef.current = false
        if (shouldContinueListeningRef.current) {
          setTimeout(() => startListening(), 500)
        }
      } else {
        isProcessingRef.current = false
      }

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
      isProcessingRef.current = false

      // Continue listening even after error
      if (shouldContinueListeningRef.current) {
        setTimeout(() => startListening(), 1000)
      }
    }
  }

  // Start voice call
  const startCall = async () => {
    // Request microphone permission
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(track => track.stop()) // Stop immediately, we just needed permission

      // Initialize speech recognition
      recognitionRef.current = initializeSpeechRecognition()

      if (!recognitionRef.current) {
        return // Error message already set
      }

      // Activate call
      setIsCallActive(true)
      shouldContinueListeningRef.current = true
      isProcessingRef.current = false
      setVoiceError(null)

      // Start listening
      setTimeout(() => startListening(), 500)

    } catch (error: any) {
      console.error('Microphone permission error:', error)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setVoiceError('Microphone access denied. Please allow microphone access in your browser settings.')
      } else {
        setVoiceError('Could not access microphone. Please check your browser settings.')
      }
    }
  }

  // End voice call
  const endCall = () => {
    shouldContinueListeningRef.current = false
    isProcessingRef.current = false

    // Stop listening
    stopListening()

    // Stop speaking
    if (synthRef.current) {
      synthRef.current.cancel()
    }
    setIsSpeaking(false)

    // Cleanup recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch (e) {
        console.error('Error aborting recognition:', e)
      }
      recognitionRef.current = null
    }

    setIsCallActive(false)
    setVoiceError(null)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldContinueListeningRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch (e) {}
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  // Handle text message send
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
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
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
          <div className="w-32"></div> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Voice Status Banner */}
      {isCallActive && (isListening || isSpeaking || isLoading) && (
        <div className="bg-purple-50 border-b border-purple-200 px-4 py-3 animate-fade-in">
          <div className="max-w-4xl mx-auto flex items-center justify-center space-x-3">
            {isListening && !isLoading && (
              <>
                <div className="flex space-x-1">
                  <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1 h-6 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1 h-4 bg-purple-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-purple-700 font-medium">🎤 Listening...</span>
              </>
            )}
            {isLoading && (
              <>
                <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                <span className="text-purple-700 font-medium">Scout is thinking...</span>
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
        </div>
      )}

      {/* Voice Error Banner */}
      {voiceError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-center">
            <span className="text-red-700 font-medium">⚠️ {voiceError}</span>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8 pb-32">
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

          {isLoading && !isCallActive && (
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

      {/* Input Area - Only show when NOT in call */}
      {!isCallActive && (
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
              💬 Powered by Claude AI. Click the phone icon to start a voice call with Scout.
            </p>
          </div>
        </div>
      )}

      {/* Floating Phone Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {!isCallActive ? (
          <button
            onClick={startCall}
            className="w-16 h-16 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
            title="Start voice call with Scout"
          >
            <Phone className="h-7 w-7 group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <button
            onClick={endCall}
            className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group animate-pulse"
            title="End voice call"
          >
            <PhoneOff className="h-7 w-7 group-hover:scale-110 transition-transform" />
          </button>
        )}
      </div>

      {/* Call Active Overlay (optional visual indicator) */}
      {isCallActive && (
        <div className="fixed bottom-28 right-8 z-40 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium">
          📞 Call Active
        </div>
      )}
    </div>
  )
}
