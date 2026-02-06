'use client'

import Link from 'next/link'
import { CheckCircle2, ArrowRight, MessageCircle, Search, FileText, Target, TrendingUp, Users, Sparkles } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[70px]">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-7 w-7 text-primary-300" />
              <span className="text-xl font-bold text-gray-900">MarketMind</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition">
                Home
              </Link>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">
                Why MarketMind AI
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">
                About
              </a>
              <Link href="/analyze" className="text-gray-600 hover:text-gray-900 transition">
                Analyze
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-gray-900 transition">
                Idea Validator
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Link
                href="/chat"
                className="bg-primary-300 text-white px-4 py-2 rounded-button text-sm font-semibold"
              >
                Start Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 gradient-hero">
        <div className="max-w-7xl mx-auto">
          <div className="text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Discover Your Real ICP with<br />
              <span className="text-primary-600">AI-Powered Research</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Scout analyzes your market, competitors, and customer data to reveal your ideal customer profile—whether you're pre-launch or scaling to millions.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link
                href="/chat"
                className="inline-flex items-center justify-center bg-primary-300 hover:bg-primary-400 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-card hover:shadow-lift group"
              >
                Start Free Research
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-secondary-300 mr-2" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-secondary-300 mr-2" />
                <span>2-3 minute research</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="h-4 w-4 text-secondary-300 mr-2" />
                <span>Professional PDF report</span>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16">
              <p className="text-sm text-gray-500 mb-4">Trusted by 500+ founders</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              AI Research in 3 Simple Steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Chat with Scout</h3>
              <p className="text-gray-600 leading-relaxed">
                Tell Scout about your product and stage. Pre-launch or scaling, Scout adapts to your needs.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-secondary-700" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Deep Dive</h3>
              <p className="text-gray-600 leading-relaxed">
                Scout analyzes competitors, scrapes market data, and identifies ICP patterns in 2-3 minutes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Strategic Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Download a comprehensive PDF with ICP personas, competitor SWOT, and GTM recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Founders Choose MarketMind
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-card shadow-soft hover:shadow-card transition-all">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Adapts to Your Stage</h3>
              <p className="text-gray-600 leading-relaxed">
                Whether you're pre-launch, early-stage, post-revenue, or scaling—Scout personalizes research to your reality.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-card shadow-soft hover:shadow-card transition-all">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Real Competitor Analysis</h3>
              <p className="text-gray-600 leading-relaxed">
                Actual web scraping, pricing extraction, SWOT analysis—not generic AI guesses. We analyze 3-5 competitors in depth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-card shadow-soft hover:shadow-card transition-all">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Evidence-Based Personas</h3>
              <p className="text-gray-600 leading-relaxed">
                ICP recommendations based on real market data, competitor customers, and strategic frameworks.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-8 rounded-card shadow-soft hover:shadow-card transition-all">
              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-secondary-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Boardroom-Ready Deliverables</h3>
              <p className="text-gray-600 leading-relaxed">
                Download comprehensive PDF reports with Porter's Five Forces, SWOT matrices, and actionable GTM plans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Trial */}
            <div className="bg-white p-8 rounded-card border-2 border-gray-200 hover:border-primary-300 transition-all">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">1 Free Research Session</h3>
              <p className="text-gray-600 mb-6">Try before you buy</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-gray-900">$0</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-secondary-300 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Full access to all features</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-secondary-300 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Comprehensive PDF report</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-secondary-300 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">No credit card required</span>
                </li>
              </ul>

              <Link
                href="/chat"
                className="block w-full text-center bg-secondary-300 hover:bg-secondary-400 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all"
              >
                Start Free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-primary-300 p-8 rounded-card shadow-lift relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-secondary-300 text-gray-900 px-4 py-1 rounded-full text-sm font-bold">
                Recommended
              </div>

              <h3 className="text-2xl font-bold text-white mb-2">Pro</h3>
              <p className="text-primary-100 mb-6">For serious founders</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$99</span>
                <span className="text-primary-100"> per session</span>
              </div>
              <p className="text-primary-100 mb-6">or $299/month unlimited</p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Unlimited research sessions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-white mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-white">Early access to new features</span>
                </li>
              </ul>

              <Link
                href="/chat"
                className="block w-full text-center bg-white text-primary-600 px-6 py-3 rounded-lg font-bold transition-all hover:bg-gray-50"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Understand Your Market?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of founders who use Scout to validate ideas and find product-market fit.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-50 transition-all group shadow-lift"
          >
            Talk to Scout Now
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-6 w-6 text-primary-300" />
                <span className="text-xl font-bold text-white">MarketMind</span>
              </div>
              <p className="text-sm text-gray-400">
                AI-powered market research for founders.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#how-it-works" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><Link href="/chat" className="hover:text-white transition">Talk to Scout</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-sm text-center text-gray-400">
            <p>&copy; 2026 MarketMind. All rights reserved.</p>
            <p className="mt-2">
              Email: <a href="mailto:hello@marketmind.ai" className="text-primary-300 hover:text-primary-200">hello@marketmind.ai</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
