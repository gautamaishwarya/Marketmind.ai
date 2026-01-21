// Research data type definitions

export interface ResearchRequest {
  product: string
  targetMarket: string
  additionalContext?: string
}

export interface CompetitorProfile {
  name: string
  website: string
  description: string
  pricing: {
    model: string
    tiers: Array<{
      name: string
      price: string
      features: string[]
    }>
  }
  features: string[]
  strengths: string[]
  weaknesses: string[]
  reviewData: {
    platform: string
    rating: number
    reviewCount: number
    topComplaints: string[]
    topPraises: string[]
  }[]
}

export interface ICPProfile {
  name: string
  priority: 'primary' | 'secondary' | 'tertiary'
  firmographics: {
    companySize: string
    revenue: string
    industry: string[]
    geography: string[]
    growthStage: string
  }
  decisionMaker: {
    title: string[]
    ageRange: string
    experience: string
    teamSize: string
    reportsTo: string
  }
  painPoints: Array<{
    problem: string
    frequency: number
    severity: 'high' | 'medium' | 'low'
    realQuotes: string[]
    impact: string
  }>
  currentSolutions: Record<string, number>
  buyingTriggers: Array<{
    trigger: string
    frequency: number
    timeToDecision: string
  }>
  buyingProcess: {
    timeline: string
    stages: string[]
    stakeholders: string[]
    dealSize: string
    commonObjections: string[]
  }
  whereToFind: {
    online: Array<{
      platform: string
      community: string
      members: number
    }>
    searchTerms: string[]
  }
}

export interface MarketData {
  tam: {
    value: string
    source: string
    year: number
  }
  sam: {
    value: string
    calculation: string
  }
  som: {
    value: string
    calculation: string
  }
  growthRate: {
    value: string
    source: string
  }
  trends: string[]
}

export interface SWOTAnalysis {
  competitor: string
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
}

export interface PortersFiveForces {
  competitiveRivalry: {
    rating: 'low' | 'medium' | 'high'
    analysis: string
  }
  supplierPower: {
    rating: 'low' | 'medium' | 'high'
    analysis: string
  }
  buyerPower: {
    rating: 'low' | 'medium' | 'high'
    analysis: string
  }
  threatOfNewEntrants: {
    rating: 'low' | 'medium' | 'high'
    analysis: string
  }
  threatOfSubstitutes: {
    rating: 'low' | 'medium' | 'high'
    analysis: string
  }
}

export interface ResearchResults {
  requestId: string
  timestamp: string

  // Core Research
  competitors: CompetitorProfile[]
  icpProfiles: ICPProfile[]
  marketData: MarketData

  // Framework Analysis
  swotAnalyses: SWOTAnalysis[]
  portersFiveForces: PortersFiveForces

  // Strategic Recommendations
  positioning: {
    recommendation: string
    rationale: string
  }
  pricing: {
    recommended: string
    rationale: string
    competitiveRange: string
  }
  gtmChannels: Array<{
    channel: string
    priority: number
    rationale: string
  }>
  actionPlan: Array<{
    phase: string
    timeframe: string
    actions: string[]
  }>

  // Metadata
  dataSourcesCited: string[]
  researchDepth: {
    competitorsAnalyzed: number
    reviewsAnalyzed: number
    dataPointsCollected: number
  }
}

export interface ResearchProgress {
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  progress: number
  currentStep: string
  completedSteps: string[]
  eta: number
}
