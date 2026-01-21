# MarketMind AI Setup Guide 🚀

Welcome to your upgraded MarketMind AI with real Claude AI integration and voice chat! This guide will help you get everything up and running.

---

## 🎯 What's New

Your MarketMind AI now includes:

✅ **Real AI Conversations** - Powered by Claude Sonnet 4
✅ **Voice Chat** - Speak with Scout using your microphone
✅ **Smart Context Memory** - Scout remembers your entire conversation
✅ **Streaming Responses** - See Scout's thoughts in real-time
✅ **Professional Market Research** - Expert-level insights and guidance

---

## 📋 Prerequisites

Before you start, make sure you have:

- **Node.js 18+** installed
- **An Anthropic API key** (get one at https://console.anthropic.com/settings/keys)
- **A modern browser** (Chrome, Safari, or Edge for voice features)

---

## ⚡ Quick Start (5 minutes)

### Step 1: Get Your API Key

1. Go to https://console.anthropic.com/settings/keys
2. Sign up or log in to your Anthropic account
3. Click "Create Key" and give it a name (e.g., "MarketMind AI")
4. Copy your API key (it starts with `sk-ant-`)

### Step 2: Add Your API Key

1. Open the file `.env.local` in your project root
2. Replace `your_api_key_here` with your actual API key:

```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

3. Save the file

**⚠️ IMPORTANT:** Never commit `.env.local` to version control. It's already in `.gitignore` to protect your key.

### Step 3: Start the Development Server

```bash
# Install dependencies (if you haven't already)
npm install

# Start the development server
npm run dev
```

The app will be available at http://localhost:3000

### Step 4: Test Scout

1. Open http://localhost:3000
2. Click "Try Scout for Free"
3. Start chatting with Scout about your business idea!

---

## 🎤 Using Voice Chat

Voice chat lets you have natural conversations with Scout:

### How to Enable Voice Mode

1. Click the **"Voice Off"** button in the top-right corner of the chat
2. It will turn purple and say **"Voice On"**
3. Click the **microphone button** to start speaking
4. Speak naturally - Scout will transcribe your words
5. Scout will automatically read responses aloud

### Voice Controls

- **Mic Button (Purple)** - Click to start recording your voice
- **Mic Button (Red)** - Currently listening - click to stop
- **Stop Button** - Appears when Scout is speaking - click to interrupt

### Browser Compatibility

| Feature | Chrome | Safari | Firefox | Edge |
|---------|--------|--------|---------|------|
| Speech-to-Text | ✅ | ✅ | ❌ | ✅ |
| Text-to-Speech | ✅ | ✅ | ✅ | ✅ |

**Note:** Firefox doesn't support Web Speech API. Users on Firefox can still type and hear responses.

---

## 🧠 How Scout Works

### Scout's Personality

Scout is designed to be your expert market research consultant who:

- Asks thoughtful, focused questions (one at a time)
- Listens carefully and asks relevant follow-ups
- Uses startup terminology naturally (ICP, TAM/SAM/SOM, PMF, GTM)
- Provides actionable insights based on your answers
- Challenges assumptions constructively
- Keeps responses concise (2-3 sentences unless explaining something complex)

### Discovery Flow

Scout follows a structured discovery process:

1. **Product Understanding** - What are you building?
2. **Problem Analysis** - What problem are you solving? Who struggles with it?
3. **Target Market** - Who are your ideal customers?
4. **Competition** - What alternatives exist? Who are your competitors?
5. **Insights & Recommendations** - Actionable market insights

### Conversation Memory

Scout remembers your entire conversation, so you can:
- Reference things you said earlier
- Build on previous answers
- Get increasingly specific insights
- Have natural, flowing conversations

---

## 🛠️ Technical Details

### Architecture

```
MarketMind AI/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Claude API integration
│   ├── chat/
│   │   └── page.tsx              # Chat interface with voice
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── .env.local                     # Your API key (DO NOT COMMIT!)
├── .gitignore                     # Protects sensitive files
├── package.json                   # Dependencies
└── SETUP.md                       # This file!
```

### API Route Details

**File:** `app/api/chat/route.ts`

- **Model:** `claude-sonnet-4-20250514` (Claude Sonnet 4)
- **Max Tokens:** 1024 tokens per response
- **Streaming:** Yes (responses appear in real-time)
- **Context:** Full conversation history sent with each request

### Chat Interface Features

**File:** `app/chat/page.tsx`

- **Real-time Streaming** - See responses as they're generated
- **Voice Integration** - Web Speech API for browser-based voice
- **Error Handling** - Graceful handling of API errors and rate limits
- **Loading States** - Visual feedback during all operations
- **Auto-scroll** - Automatically scrolls to newest messages

---

## 🚨 Troubleshooting

### "API key not configured" Error

**Problem:** Scout says the API key isn't configured.

**Solution:**
1. Make sure `.env.local` exists in the project root
2. Verify your API key starts with `sk-ant-`
3. Restart the development server: `npm run dev`
4. Clear your browser cache

### "Rate limit exceeded" Error

**Problem:** You're making too many requests.

**Solution:**
- Anthropic has rate limits based on your plan
- Wait a minute and try again
- Check your usage at https://console.anthropic.com/settings/usage

### Voice Chat Not Working

**Problem:** Mic button doesn't work or no voice output.

**Solution:**
1. **Check Browser:** Use Chrome, Safari, or Edge (not Firefox)
2. **Allow Microphone:** Grant microphone permissions when prompted
3. **Check Settings:** Ensure your system microphone is enabled
4. **Test in Incognito:** Rule out browser extensions interfering

### Build Errors

**Problem:** Build fails with errors.

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

---

## 📊 API Usage & Costs

### Current Configuration

- **Model:** Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Max Tokens:** 1024 per response
- **Pricing:** See https://www.anthropic.com/pricing

### Typical Costs (Estimates)

A typical conversation with Scout (10-15 exchanges):
- **Input:** ~2,000 tokens
- **Output:** ~1,000 tokens
- **Estimated Cost:** $0.03 - $0.10 per conversation

### Monitoring Usage

Check your usage at: https://console.anthropic.com/settings/usage

---

## 🔐 Security Best Practices

### Protecting Your API Key

✅ **DO:**
- Keep `.env.local` in `.gitignore`
- Use environment variables for sensitive data
- Rotate your API keys periodically
- Monitor your API usage for anomalies

❌ **DON'T:**
- Commit `.env.local` to Git
- Share your API key in screenshots or videos
- Hardcode API keys in your code
- Use the same key across multiple projects

### When to Rotate Your Key

Rotate your API key if:
- You accidentally commit it to version control
- You share it publicly (screenshot, video, etc.)
- You suspect unauthorized access
- As a security best practice (every 90 days)

---

## 🚀 Deploying to Production

### Environment Variables

When deploying to Vercel, Netlify, or other platforms:

1. Add `ANTHROPIC_API_KEY` to your platform's environment variables
2. Make sure to restart your deployment after adding the key
3. Test in production to ensure the key is working

### Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Add environment variable
vercel env add ANTHROPIC_API_KEY
```

### Security Considerations

For production apps:
- Add rate limiting to prevent abuse
- Implement user authentication
- Monitor API usage and costs
- Set up error tracking (Sentry, LogRocket, etc.)

---

## 💡 Customization Ideas

### Modify Scout's Personality

Edit the `SCOUT_SYSTEM_PROMPT` in `app/api/chat/route.ts` to:
- Change Scout's tone (more formal, casual, technical, etc.)
- Add industry-specific knowledge
- Customize the discovery flow
- Add company-specific context

### Adjust Response Length

Change `max_tokens` in `app/api/chat/route.ts`:
- **512 tokens** - Shorter, more concise responses
- **1024 tokens** - Current setting (balanced)
- **2048 tokens** - Longer, more detailed responses

### Add More Features

Ideas for extending Scout:
- Save conversation history to a database
- Export conversations to PDF
- Add document upload for context
- Integrate with CRM systems
- Add analytics and insights tracking

---

## 📚 Resources

### Anthropic Documentation
- **API Reference:** https://docs.anthropic.com/claude/reference/
- **Best Practices:** https://docs.anthropic.com/claude/docs/
- **Prompt Engineering:** https://docs.anthropic.com/claude/docs/prompt-engineering

### Next.js Documentation
- **App Router:** https://nextjs.org/docs/app
- **API Routes:** https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- **Deployment:** https://nextjs.org/docs/deployment

### Web Speech API
- **MDN Documentation:** https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **Browser Support:** https://caniuse.com/speech-recognition

---

## 🐛 Getting Help

If you run into issues:

1. **Check this guide** - Most common issues are covered above
2. **Review error messages** - They often contain helpful information
3. **Check browser console** - Look for JavaScript errors
4. **Verify API key** - Ensure it's valid and has credit
5. **Test in different browser** - Rule out browser-specific issues

---

## ✨ What's Next?

Now that Scout is running with real AI:

1. **Test the conversation flow** - Ask Scout about different business ideas
2. **Try voice mode** - Experience hands-free market research
3. **Customize Scout** - Adjust the personality and discovery flow
4. **Deploy to production** - Share Scout with real users

**Congratulations! Your MarketMind AI is now powered by real artificial intelligence.** 🎉

Scout is ready to help founders understand their market and build successful businesses.

---

## 📝 Version History

**v2.0.0** - Real AI Integration
- ✅ Claude Sonnet 4 API integration
- ✅ Voice chat (speech-to-text & text-to-speech)
- ✅ Streaming responses
- ✅ Context memory
- ✅ Professional error handling

**v1.0.0** - Initial Release
- Demo version with simulated responses

---

**Built with ❤️ using Claude Sonnet 4, Next.js 14, and TypeScript**
