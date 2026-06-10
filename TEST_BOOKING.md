# Test Booking Flow

## Quick Test Steps

1. **Clear cache and restart:**
   ```bash
   # Delete .next cache (already done)
   npm run dev
   ```

2. **Open browser console** (F12)

3. **Go to booking section** and fill form:
   - Select a date
   - Select a time slot
   - Enter team name: "Test Team"
   - Enter phone: "08123456789"

4. **Click "Konfirmasi Pemesanan"**

## Expected Results

### ✅ Success (What should happen):
- Button shows "Memproses..."
- Browser console shows:
  ```
  Booking created: {success: true, ...}
  ⚠️ Database not configured. This booking is stored temporarily...
  💡 Tip: Set up database to persist bookings
  ```
- Redirects to success page with booking details

### ❌ Error (If you still see):
- Check browser console for actual error
- Check terminal/server console for errors
- Make sure dev server restarted after changes

## What's Different Now

### Before (Old Code):
```typescript
// This crashed immediately when imported
import { db } from '@/lib/db';
```

### After (New Code):
```typescript
// This only runs when actually used
const { db } = await import('@/lib/db'); // Inside try-catch
```

### Database Module (lib/db.ts):
```typescript
// Before: Crashed on import if DATABASE_URL invalid
const client = postgres(connectionString); // ❌ Ran immediately

// After: Only initializes when first used
export const db = new Proxy(...); // ✅ Lazy loading
```

## Troubleshooting

### If you still get 500 error:

1. **Check server logs** (terminal where npm run dev is running)
   - Look for actual error message
   - Copy full error stack trace

2. **Try accessing API directly:**
   - Open: `http://localhost:3000/api/bookings`
   - Should return: `{"bookings":[],"usingDatabase":false}`
   - If returns HTML, check server console for error

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

4. **Verify .env.local:**
   - Comment out DATABASE_URL line temporarily:
     ```
     # DATABASE_URL=postgresql://...
     ```
   - Restart server
   - Try again

## Current Setup

You have DATABASE_URL configured to Railway:
```
postgresql://postgres:YOUR_PASSWORD@interchange.proxy.rlwy.net:PORT/railway
```

But tables probably don't exist yet. The code should handle this gracefully now by falling back to temporary storage.

## Next Steps

Once booking works:
1. Keep temporary storage for now (no setup needed)
2. Later, set up database properly:
   ```bash
   npm run db:push  # Creates tables in Railway database
   ```
