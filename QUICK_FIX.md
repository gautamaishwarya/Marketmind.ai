# 🚨 QUICK FIX for "Unexpected token" and 404 Errors

## The Problem
You're getting:
1. **404 error** when accessing `/api/health`
2. **"Unexpected token '<!DOCTYPE'"** when using the Analyze page

This means the Next.js API routes aren't being served properly.

---

## ✅ Solution: Restart Everything Fresh

### Step 1: Stop Any Running Servers
```bash
# Press Ctrl+C to stop the dev server if it's running
# Or kill any Next.js processes
pkill -f "next"
```

### Step 2: Clear Next.js Cache
```bash
cd /home/user/Marketmind.ai
rm -rf .next
```

### Step 3: Verify Environment Variables
```bash
# Check if .env.local exists
ls -la .env.local

# If it doesn't exist, create it:
cat > .env.local << 'EOF'
ANTHROPIC_API_KEY=your_api_key_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF

# Then edit it with your REAL API key:
nano .env.local
# Or use any editor to add your actual Anthropic API key
```

### Step 4: Install Dependencies (if needed)
```bash
npm install
```

### Step 5: Start Fresh Dev Server
```bash
npm run dev
```

### Step 6: Test API Routes
Once the server starts (usually on http://localhost:3000), test these URLs:

1. **Test endpoint**: http://localhost:3000/api/test
   - Should show: `{"status":"success","message":"✅ API routes are working!"...}`

2. **Health endpoint**: http://localhost:3000/api/health
   - Should show API key configuration status

3. **Analyze page**: http://localhost:3000/analyze
   - Should load the competitor analysis form

---

## 🔍 Debugging Steps

### If you STILL get 404 errors:

**Check if Next.js is running:**
```bash
ps aux | grep next
```

**Check what port it's using:**
```bash
# The terminal should show something like:
# - Local: http://localhost:3000
```

**Make sure you're accessing the correct URL:**
- If using **ngrok** or a tunnel: Use the ngrok URL (e.g., https://abc123.ngrok.io/api/test)
- If **local**: Use http://localhost:3000/api/test
- If **Vercel**: Use your Vercel URL

### If API routes work but Analyze page fails:

1. **Check if ANTHROPIC_API_KEY is set:**
   ```bash
   # Visit: http://localhost:3000/api/health
   # Look for: "hasAnthropicApiKey": true
   ```

2. **If false, add your API key:**
   - Get key from: https://console.anthropic.com/
   - Add to `.env.local`: `ANTHROPIC_API_KEY=sk-ant-api03-...`
   - **RESTART THE SERVER** (Ctrl+C then `npm run dev`)

3. **Test again**

---

## 📋 Quick Verification Checklist

- [ ] Stopped old servers (`pkill -f "next"`)
- [ ] Cleared cache (`rm -rf .next`)
- [ ] Created `.env.local` with API key
- [ ] Ran `npm install`
- [ ] Started server (`npm run dev`)
- [ ] Tested `/api/test` (shows success?)
- [ ] Tested `/api/health` (shows API key?)
- [ ] Tried `/analyze` page (loads form?)
- [ ] Submitted analysis (works?)

---

## 🆘 If Nothing Works

### Are you testing on Vercel/deployed version?
If you deployed to Vercel BEFORE adding the health endpoint:
1. Go to Vercel Dashboard
2. Your project → Settings → Environment Variables
3. Add `ANTHROPIC_API_KEY` with your key
4. Go to Deployments → Redeploy the latest one
5. Wait for redeployment to finish
6. Test again on your Vercel URL

### Are you using ngrok or a tunnel?
Make sure:
1. The Next.js dev server is running locally first
2. Then start ngrok: `ngrok http 3000`
3. Use the ngrok URL (https://xxxx.ngrok.io) not localhost

### Still broken?
Check browser console (F12 → Console tab) and share:
1. The full error message
2. The URL you're accessing
3. The response from `/api/test`

---

## 🎯 Expected Results

After following these steps:

✅ `/api/test` returns:
```json
{
  "status": "success",
  "message": "✅ API routes are working!",
  "timestamp": "2024-..."
}
```

✅ `/api/health` returns:
```json
{
  "status": "ok",
  "config": {
    "hasAnthropicApiKey": true,
    "apiKeyPreview": "sk-ant-..."
  },
  "message": "✅ API key is configured"
}
```

✅ `/analyze` page loads the form

✅ Submitting analysis works without JSON errors
