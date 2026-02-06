# MarketMind AI - Quick Setup Guide

## 🚨 Fix "Unexpected token" Error

If you're seeing the error: **"Unexpected token '<', "<!DOCTYPE "... is not valid JSON"**

This means the ANTHROPIC_API_KEY is missing. Follow these steps:

### Step 1: Get Your API Key

1. Go to [https://console.anthropic.com/](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to "API Keys"
4. Click "Create Key"
5. Copy your API key (starts with `sk-ant-...`)

### Step 2: Create Environment File

```bash
# In your project root, copy the example file
cp .env.example .env.local
```

### Step 3: Add Your API Key

Open `.env.local` and replace `your_api_key_here` with your actual key:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### Step 4: Restart Dev Server

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run dev
```

### Step 5: Test It

1. Go to [http://localhost:3000/analyze](http://localhost:3000/analyze)
2. Enter a competitor (e.g., "Slack")
3. Enter their website (e.g., "https://slack.com")
4. Click "Start Analysis"
5. You should see results! ✅

---

## 🌐 Deploying to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Add MarketMind AI"
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. **IMPORTANT**: Add Environment Variable
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your API key from Anthropic
5. Click "Deploy"

### Step 3: Verify

- Open your deployed URL
- Go to `/analyze` page
- Test with a competitor analysis
- Should work! ✅

---

## 📝 Common Issues

### Error: "API configuration error"
- **Solution**: Add `ANTHROPIC_API_KEY` to `.env.local`

### Error: "Failed to fetch website"
- **Solution**: Some websites block scraping. Try a different competitor URL.

### Error: "Module not found"
- **Solution**: Run `npm install` to install dependencies

### Changes not showing
- **Solution**:
  1. Clear Next.js cache: `rm -rf .next`
  2. Restart dev server
  3. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

---

## 🎯 Features Available

1. **Analyze Page** (`/analyze`)
   - Competitor website analysis
   - Extract pricing, features, positioning
   - AI-powered insights

2. **Chat Interface** (`/chat`)
   - Conversational ICP discovery
   - Market research conversations
   - Stage-adaptive questions

3. **Landing Page** (`/`)
   - Marketing site
   - Features showcase
   - Pricing information

---

## 💡 Pro Tips

1. **API Credits**: Monitor your Anthropic usage at [console.anthropic.com](https://console.anthropic.com/)
2. **Testing**: Start with simple websites (avoid heavily JS-rendered sites)
3. **Environment**: Never commit `.env.local` to Git (it's in `.gitignore`)
4. **Production**: Always set environment variables in Vercel settings

---

## 🆘 Still Having Issues?

1. Check the browser console (F12) for detailed errors
2. Check the terminal/server logs
3. Verify your API key is valid and has credits
4. Make sure you're using Node.js 18+ (`node --version`)

---

**Need more help?** Check the main [README.md](./README.md) for detailed documentation.
