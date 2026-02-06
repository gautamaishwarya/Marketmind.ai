# MarketMind AI

An AI-powered market research tool that helps founders understand their market through conversational AI.

## 🚀 Features

- **AI-Powered Competitor Analysis**: Scrape and analyze competitor websites with Claude AI
- **Conversational AI Agent**: Talk to Scout and get market insights
- **Competitor Intelligence**: Extract pricing, features, positioning, and testimonials
- **ICP Discovery**: Identify ideal customer profiles based on data
- **PDF Report Generation**: Download professional research reports
- **CSV Analysis**: Upload customer data for segmentation analysis
- **Landing Page**: Beautiful marketing site with features, pricing, and testimonials
- **Chat Interface**: Real-time chat with typing indicators
- **Modern Design**: Built with Tailwind CSS and animated components
- **Responsive**: Works on all devices

## 📦 What's Included

This is a **demo version** with simulated AI responses. The full version would include:
- Real AI integration (Claude API or OpenAI)
- Market research data APIs
- Database for storing conversations
- User authentication
- Payment integration

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📋 Setup Instructions

### Option 1: Deploy to Vercel (Recommended - Easiest!)

1. **Set up Environment Variables**:
   - Get your API key from [Anthropic Console](https://console.anthropic.com/)
   - Copy `.env.example` to `.env.local`
   - Add your API key: `ANTHROPIC_API_KEY=your_key_here`

2. **Push to GitHub**:
   - Create a new repository on GitHub
   - Upload all these files to the repository

3. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Add environment variable: `ANTHROPIC_API_KEY`
   - Click "Deploy"
   - Done! Your app will be live in 2 minutes

### Option 2: Run Locally

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment Variables**:
   ```bash
   # Copy the example env file
   cp .env.example .env.local

   # Edit .env.local and add your API key
   # ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. **Get Your API Key**:
   - Sign up at [Anthropic Console](https://console.anthropic.com/)
   - Create an API key
   - Copy it to your `.env.local` file

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

5. **Open Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
marketmind-ai/
├── app/
│   ├── page.tsx          # Landing page
│   ├── chat/
│   │   └── page.tsx      # Chat interface
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static assets
├── package.json          # Dependencies
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts` to change the color scheme:

```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-color',
    }
  }
}
```

### Modify Content

- **Landing Page**: Edit `app/page.tsx`
- **Chat Interface**: Edit `app/chat/page.tsx`
- **Metadata**: Edit `app/layout.tsx`

## 🔄 Next Steps to Make It Production-Ready

1. **Add Real AI**:
   - Integrate Claude API or OpenAI
   - Create API routes in `app/api/`
   - Handle streaming responses

2. **Add Authentication**:
   - Use Clerk, Auth0, or Supabase Auth
   - Protect chat routes
   - Store user data

3. **Add Database**:
   - Use Supabase or PostgreSQL
   - Store conversations
   - Track usage limits

4. **Add Payments**:
   - Integrate Stripe
   - Implement tier limits
   - Handle subscriptions

5. **Add Real Market Research**:
   - Integrate market data APIs
   - Web scraping for competitor analysis
   - Data enrichment services

## 📝 Environment Variables

For the full version, you'll need:

```env
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_URL=your_database_url
NEXT_PUBLIC_STRIPE_KEY=your_stripe_key
```

## 🐛 Troubleshooting

### "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" Error

This error occurs when the API returns HTML instead of JSON. Common causes:

1. **Missing API Key** (Most Common):
   - Make sure `ANTHROPIC_API_KEY` is set in your `.env.local` file
   - Restart your dev server after adding the API key
   - In Vercel, add the environment variable in project settings

2. **Invalid API Key**:
   - Verify your API key is correct
   - Check if it has expired
   - Generate a new key from [Anthropic Console](https://console.anthropic.com/)

3. **Environment Variable Not Loading**:
   - File must be named `.env.local` (not `.env` in development)
   - Restart the Next.js dev server
   - Clear `.next` folder: `rm -rf .next`

### Build Errors

If you get build errors on Vercel:
1. Check that all dependencies are in `package.json`
2. Ensure TypeScript files have no errors
3. Check the build logs for specific issues
4. Verify `ANTHROPIC_API_KEY` is set in Vercel environment variables

### Deployment Issues

If deployment fails:
1. Make sure `.gitignore` is properly configured
2. Check that `next.config.js` is correct
3. Verify all environment variables are set in Vercel
4. Ensure API key has sufficient credits

## 📄 License

MIT License - feel free to use this for your own projects!

## 🙋‍♂️ Support

This is a demo/starter template. For questions:
- Check the code comments
- Review Next.js documentation
- Search for similar issues on GitHub

## 🎉 You Built This!

Congratulations! You now have a working AI-powered market research tool. 

**What you learned:**
- How to structure a Next.js app
- How to create responsive UIs with Tailwind
- How to build chat interfaces
- How to deploy to Vercel

Keep building! 🚀
