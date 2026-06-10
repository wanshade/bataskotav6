# Quick Start - Database Setup

## The Error You're Seeing

If you see this error when clicking "Konfirmasi Pemesanan":
```
Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```

**This means the database is not configured yet!**

## Quick Fix (3 Steps)

### Step 1: Configure Database URL

Open `.env.local` and add your PostgreSQL connection string:

```env
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/bataskota
```

Replace:
- `YOUR_USER` - your PostgreSQL username (usually `postgres`)
- `YOUR_PASSWORD` - your PostgreSQL password
- `localhost` - your database host
- `5432` - PostgreSQL port (default)
- `bataskota` - database name

**Example:**
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/bataskota
```

### Step 2: Create Database

Open your PostgreSQL terminal and run:

```bash
createdb bataskota
```

Or using psql:
```sql
CREATE DATABASE bataskota;
```

### Step 3: Push Database Schema

Run this command to create the tables:

```bash
npm run db:push
```

## Done!

Now try booking again - it should work!

## Alternative: Skip Database (Temporary)

If you want to test without database first, you can modify the booking flow to skip database saving temporarily. The booking will still show the success page, but won't be saved.

## Need Help?

See `DATABASE_SETUP.md` for detailed instructions and troubleshooting.

## Using Online Database (Recommended for Production)

Instead of local PostgreSQL, you can use:

1. **Supabase** (Free tier: supabase.com)
   - Create project → Get connection string → Paste in .env.local

2. **Neon** (Free tier: neon.tech)
   - Create project → Copy connection string → Paste in .env.local

3. **Railway** (Free tier: railway.app)
   - Create PostgreSQL service → Copy DATABASE_URL → Paste in .env.local

These services provide a `DATABASE_URL` that you just copy-paste into `.env.local` - no local PostgreSQL installation needed!
