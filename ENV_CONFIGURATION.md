# Environment Configuration Guide

## Overview

All configurable settings for Batas Kota booking system can now be easily changed via environment variables in `.env.local`.

## Environment Variables

### 1. Admin WhatsApp Number ✅
**Variable:** `NEXT_PUBLIC_ADMIN_WHATSAPP`

**Purpose:** The WhatsApp number that will receive booking confirmation messages

**Format:** Indonesian phone number (08xxx or 628xxx)

**Example:**
```env
NEXT_PUBLIC_ADMIN_WHATSAPP=085157606400
```

**Usage:**
- Customer clicks "Konfirmasi via WhatsApp" on success page
- Opens WhatsApp to this admin number
- Pre-filled message includes: team name, phone, booking ID

---

### 2. Bank Account Information ✅

#### Bank Name
**Variable:** `NEXT_PUBLIC_BANK_NAME`

**Example:**
```env
NEXT_PUBLIC_BANK_NAME="Bank Mandiri"
```

#### Account Number
**Variable:** `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER`

**Example:**
```env
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=1610016475977
```

#### Account Name
**Variable:** `NEXT_PUBLIC_BANK_ACCOUNT_NAME`

**Example:**
```env
NEXT_PUBLIC_BANK_ACCOUNT_NAME="CV BATAS KOTA POINT"
```

**Usage:**
- Displayed on booking success page
- Shows payment instructions to customers
- Copy button available for account number

---

### 3. Database Connection
**Variable:** `DATABASE_URL`

**Format:** PostgreSQL connection string

**Example:**
```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@host:port/database
```

**Current:** Connected to Railway PostgreSQL

---

### 4. API Keys
**Variable:** `GEMINI_API_KEY`

**Purpose:** Google Gemini AI API key (if using AI features)

**Example:**
```env
GEMINI_API_KEY=your_api_key_here
```

---

## How to Update Configuration

### Step 1: Edit `.env.local`

Open the file:
```bash
notepad .env.local
```

### Step 2: Change Values

Update any of the variables:

```env
# Change admin WhatsApp number
NEXT_PUBLIC_ADMIN_WHATSAPP=081234567890

# Change bank information
NEXT_PUBLIC_BANK_NAME="Bank BCA"
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=1234567890
NEXT_PUBLIC_BANK_ACCOUNT_NAME="CV BATAS KOTA POINT"
```

### Step 3: Restart Dev Server

Changes take effect after restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Configuration in Production

When deploying to production (Vercel, Railway, etc.), add these environment variables in the platform's settings:

### Vercel:
1. Go to Project Settings → Environment Variables
2. Add each variable:
   - `NEXT_PUBLIC_ADMIN_WHATSAPP` = `085157606400`
   - `NEXT_PUBLIC_BANK_NAME` = `Bank Mandiri`
   - `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` = `1610016475977`
   - `NEXT_PUBLIC_BANK_ACCOUNT_NAME` = `CV BATAS KOTA POINT`
   - `DATABASE_URL` = `postgresql://...`
3. Redeploy

### Railway:
1. Go to Project → Variables
2. Click "+ New Variable"
3. Add each variable with its value
4. Railway auto-redeploys

---

## Important Notes

### `NEXT_PUBLIC_` Prefix

Variables with `NEXT_PUBLIC_` prefix are:
- ✅ Available in browser (client-side)
- ✅ Can be used in React components
- ⚠️ Visible in browser source code (don't use for secrets!)

Variables WITHOUT `NEXT_PUBLIC_`:
- ✅ Server-side only (API routes)
- ✅ Hidden from browser
- ✅ Safe for sensitive data (DATABASE_URL)

### Security Best Practices

**Safe to expose (use NEXT_PUBLIC_):**
- Admin phone numbers
- Bank account numbers (public anyway)
- Bank names
- Site URLs

**Keep secret (no NEXT_PUBLIC_):**
- Database URLs
- API keys
- Private credentials

---

## Default Values

If environment variables are not set, the system uses these defaults:

| Variable | Default |
|----------|---------|
| `NEXT_PUBLIC_ADMIN_WHATSAPP` | `08123456789` |
| `NEXT_PUBLIC_BANK_NAME` | `Bank Mandiri` |
| `NEXT_PUBLIC_BANK_ACCOUNT_NUMBER` | `1610016475977` |
| `NEXT_PUBLIC_BANK_ACCOUNT_NAME` | `CV BATAS KOTA POINT` |

---

## Quick Change Checklist

When updating contact information:

### Change Admin WhatsApp:
- [ ] Update `NEXT_PUBLIC_ADMIN_WHATSAPP` in `.env.local`
- [ ] Restart dev server
- [ ] Test: Make a booking and check WhatsApp link
- [ ] Update in production environment variables

### Change Bank Account:
- [ ] Update all three bank variables in `.env.local`
- [ ] Restart dev server
- [ ] Test: Check success page shows new info
- [ ] Update in production environment variables

### Verify Changes:
- [ ] Make a test booking
- [ ] Check success page displays correct info
- [ ] Click WhatsApp button → Opens correct number
- [ ] Check bank details shown correctly

---

## Troubleshooting

### Changes not appearing?
1. Make sure you restarted the dev server
2. Clear browser cache (Ctrl+Shift+R)
3. Check `.env.local` file saved correctly

### WhatsApp opens wrong number?
1. Check `NEXT_PUBLIC_ADMIN_WHATSAPP` value
2. Format should be: `08xxx` or `628xxx`
3. Restart server after changing

### Bank info not updating?
1. Verify all three bank variables are set
2. Check for typos in variable names
3. Restart dev server
4. Hard refresh browser

---

## Example Complete Configuration

```env
# Batas Kota Environment Configuration

# Gemini API Key
GEMINI_API_KEY=your_api_key_here

# Next.js Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Batas Kota | The Town Space"

# Database
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@host:port/database

# Admin Contact
NEXT_PUBLIC_ADMIN_WHATSAPP=085157606400

# Bank Account
NEXT_PUBLIC_BANK_NAME="Bank Mandiri"
NEXT_PUBLIC_BANK_ACCOUNT_NUMBER=1610016475977
NEXT_PUBLIC_BANK_ACCOUNT_NAME="CV BATAS KOTA POINT"
```

---

## Need Help?

If you need to add more configurable settings:
1. Add variable to `.env.local`
2. Add `NEXT_PUBLIC_` prefix if needed in browser
3. Access in code: `process.env.VARIABLE_NAME`
4. Add default value with `||` operator

**Example:**
```typescript
const myValue = process.env.NEXT_PUBLIC_MY_SETTING || 'default';
```
