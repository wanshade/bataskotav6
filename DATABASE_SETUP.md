# Database Setup Guide

This guide will help you set up PostgreSQL database for Batas Kota booking system using Drizzle ORM.

## Prerequisites

- PostgreSQL installed on your system
- Node.js and npm installed

## Setup Steps

### 1. Install PostgreSQL

If you don't have PostgreSQL installed:
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download/windows/)
- **Mac**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql`

### 2. Create Database

Open PostgreSQL terminal (psql) and run:

```sql
CREATE DATABASE bataskota;
```

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and update the DATABASE_URL:

```
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/bataskota
```

Replace:
- `YOUR_USER` with your PostgreSQL username (default: `postgres`)
- `YOUR_PASSWORD` with your PostgreSQL password
- `localhost` with your database host if different
- `5432` with your PostgreSQL port if different

### 4. Generate and Run Migrations

Generate the migration files:

```bash
npm run db:generate
```

Push the schema to the database:

```bash
npm run db:push
```

Alternatively, you can run migrations:

```bash
npm run db:migrate
```

### 5. Verify Database Setup

You can use Drizzle Studio to view your database:

```bash
npm run db:studio
```

This will open a web interface at `https://local.drizzle.studio`

## Database Schema

### Bookings Table

| Column       | Type      | Description                          |
|--------------|-----------|--------------------------------------|
| id           | serial    | Primary key (auto-increment)         |
| team_name    | text      | Name of the team/customer            |
| phone        | text      | WhatsApp phone number                |
| booking_date | text      | Formatted date string (Indonesian)   |
| time_slot    | text      | Selected time slot (e.g., "06.00 - 08.00") |
| price        | integer   | Price in smallest currency unit      |
| status       | text      | Status: pending, confirmed, cancelled|
| created_at   | timestamp | Auto-generated creation timestamp    |

## Troubleshooting

### Connection Issues

If you get connection errors:

1. Check if PostgreSQL is running:
   ```bash
   # Windows
   pg_isready
   
   # Mac/Linux
   sudo systemctl status postgresql
   ```

2. Verify your DATABASE_URL is correct
3. Check PostgreSQL logs for detailed errors

### Permission Issues

If you get permission denied errors:

```sql
-- Grant privileges to your user
GRANT ALL PRIVILEGES ON DATABASE bataskota TO your_username;
```

### Reset Database

To reset the database:

```bash
# Drop and recreate the database
dropdb bataskota
createdb bataskota

# Re-run migrations
npm run db:push
```

## Development Commands

- `npm run db:generate` - Generate migration files from schema
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema directly to database (development)
- `npm run db:studio` - Open Drizzle Studio UI

## Production Deployment

For production deployment:

1. Use a managed PostgreSQL service (e.g., Supabase, Neon, Railway)
2. Set the `DATABASE_URL` environment variable in your hosting platform
3. Run migrations in production:
   ```bash
   npm run db:migrate
   ```

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for database users
- In production, use SSL connections
- Regularly backup your database
