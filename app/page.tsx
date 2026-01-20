'use client'

import Link from 'next/link'
import { Sparkles, Target, TrendingUp, Users, CheckCircle2, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-purple-600" />
              <span className="text-xl font-bold text-gray-900">MarketMind AI</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">Features</a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">Pricing</a>
              <Link href="/chat" className="bg-purple-600 text-white px-6 py-2 rounded-full hover:bg-purple-700 transition">
                Talk to Scout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-block mb-4 px-4 py-2 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
              🚀 AI-Powered Market Research
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 animate-fade-in">
              Meet <span className="gradient-bg bg-clip-text text-transparent">Scout</span>,<br />
              Your Market Research AI
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Talk to Scout and discover your market. Get instant insights, competitive analysis, 
              and strategic guidance for your startup - all in one conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/chat"
                className="inline-flex items-center justify-center bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition group"
              >
                Start Free Research
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
              </Link>
              <a 
                href="#features"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-full text-lg font-semibold hover:border-gray-400 transition"
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Animated gradient blob */}
          <div className="mt-16 relative">
            <div className="gradient-bg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-20 blur-3xl"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-600 italic">
                    "Hey Scout! I'm building a SaaS tool for remote teams. Can you help me understand 
                    my target market and who my main competitors are?"
                  </p>
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg">
                    <p className="text-gray-700">
                      <strong className="text-purple-600">Scout:</strong> Absolutely! Let's dive in. 
                      First, tell me a bit more about what problem your SaaS solves for remote teams...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Scout Does For You</h2>
            <p className="text-xl text-gray-600">Everything you need to understand your market</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">ICP Discovery</h3>
              <p className="text-gray-600">
                Generate detailed ideal customer personas with pain points, buying triggers, 
                and demographic insights.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Competitive Analysis</h3>
              <p className="text-gray-600">
                Scout analyzes your competitors' strengths, weaknesses, pricing, and positioning 
                to find your edge.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Market Sizing</h3>
              <p className="text-gray-600">
                Get TAM, SAM, and SOM estimates with data-backed market size calculations 
                for your specific niche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Founders Love Scout</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "Scout helped me validate my idea in under an hour. The ICP insights were spot-on!",
                author: "Sarah Chen",
                role: "Founder, TechFlow"
              },
              {
                quote: "Better than hiring a market research consultant. Fast, accurate, and affordable.",
                author: "Michael Rodriguez",
                role: "CEO, DataSync"
              },
              {
                quote: "The competitive analysis saved us months of manual research. Game changer!",
                author: "Emily Watson",
                role: "Co-founder, CloudNest"
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl">
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.author}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Start free, upgrade when you need more</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <p className="text-gray-600 mb-6">Perfect for validating your idea</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['3 research reports/month', '3 ICP personas', 'Basic competitor analysis', 'Email delivery'].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/chat" className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="bg-purple-600 p-8 rounded-xl shadow-lg border-2 border-purple-600 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-purple-100 mb-6">For serious founders</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$49</span>
                <span className="text-purple-100">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Unlimited research reports', '10+ ICP personas', 'Deep competitor intelligence', 'Real-time monitoring', 'Priority support'].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-purple-200 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-white">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/chat" className="block w-full text-center bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition font-semibold">
                Start Free Trial
              </Link>
            </div>

            {/* Agency Tier */}
            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Agency</h3>
              <p className="text-gray-600 mb-6">For teams and agencies</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">$199</span>
                <span className="text-gray-600">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'White-label reports', 'Team collaboration', 'Done-for-you research', 'Direct support'].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href="/chat" className="block w-full text-center bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Understand Your Market?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join hundreds of founders who use Scout to validate ideas and find product-market fit.
          </p>
          <Link href="/chat" className="inline-flex items-center justify-center bg-white text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition group">
            Talk to Scout Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">MarketMind AI</span>
              </div>
              <p className="text-sm">
                AI-powered market research for founders.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white">Features</a></li>
                <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
                <li><Link href="/chat" className="hover:text-white">Talk to Scout</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; 2026 MarketMind AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
