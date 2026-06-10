# Deployment Configuration Changes

## ⚠️ Important Change

**Removed `output: 'export'` from next.config.js**

### Why?

- Static exports (`output: 'export'`) **cannot use API routes**
- API routes require a Node.js server to run
- Your booking system uses `/api/bookings` which needs a server
- PostgreSQL database also requires a server

### What This Means

#### ❌ Before (Static Export):
- ✅ Could deploy to any static host (GitHub Pages, Netlify static, etc.)
- ❌ No API routes (no database functionality)
- ❌ All data stored in browser only

#### ✅ After (Server Mode):
- ✅ API routes work
- ✅ Database integration works
- ✅ Full booking functionality
- ⚠️ Requires Node.js server for deployment

## Deployment Options

Now you can deploy to platforms that support Node.js:

### 1. **Vercel** (Recommended - Made by Next.js team)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```
- ✅ Free tier available
- ✅ Automatic deployments from GitHub
- ✅ Built-in PostgreSQL support
- ✅ Environment variables management

### 2. **Railway** (You already have this!)
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```
- ✅ Your DATABASE_URL is already from Railway
- ✅ Can host both app + database together
- ✅ Free tier: $5 credit/month

### 3. **Netlify** (With Functions)
- Supports Next.js with API routes
- Free tier available
- Deploy from Git

### 4. **DigitalOcean App Platform**
- Full Next.js support
- $5/month starter tier

### 5. **Your Own VPS**
```bash
npm run build
npm start
```
- Requires Node.js 18+ installed
- Use PM2 for process management

## Local Development

### Start Dev Server:
```bash
npm run dev
```
Runs at: `http://localhost:3000`

### Build for Production:
```bash
npm run build
npm start
```

## Environment Variables

For deployment, set these environment variables:

### Required:
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@host:port/database
```

### Optional:
```env
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

## If You Need Static Export

If you absolutely need a static site (no database):

1. **Restore static export:**
   ```javascript
   // next.config.js
   output: 'export',
   distDir: './dist',
   ```

2. **Remove database functionality:**
   - Delete `app/api/` folder
   - Modify booking to save to localStorage only
   - No server-side booking storage

3. **Build:**
   ```bash
   npm run build
   ```
   Output in `dist/` folder

## Recommended: Use Vercel + Railway

1. **Deploy app to Vercel** (automatic from GitHub)
2. **Keep database on Railway** (you already have it)
3. **Connect them:**
   - Add DATABASE_URL to Vercel environment variables
   - Railway → Copy DATABASE_URL
   - Vercel → Settings → Environment Variables → Paste

This gives you:
- ✅ Free hosting for app (Vercel)
- ✅ Free database tier (Railway)
- ✅ Automatic deployments
- ✅ HTTPS included
- ✅ Global CDN
