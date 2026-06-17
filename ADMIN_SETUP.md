# Admin Authentication Setup Guide

This guide explains how to set up and use the admin authentication system for booking approvals.

## Installation Complete ✅

The admin system has been successfully implemented with:
- NextAuth.js for authentication
- JWT-based sessions
- Admin login page at `/admin/login`
- Admin dashboard at `/admin/dashboard`
- API endpoints for approving/rejecting bookings
- Database schema updates for approval tracking

## Environment Variables Setup

Add these to your `.env.local` file:

```env
# Admin Authentication
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

# NextAuth.js Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### Generate NextAuth Secret

Run this command in your terminal:
```bash
openssl rand -base64 32
```

Or use an online generator if openssl is not available.

## Usage Instructions

### 1. Access Admin Login
Navigate to: `http://localhost:3000/admin/login`

### 2. Login Credentials
- **Email**: The email you set in `ADMIN_EMAIL`
- **Password**: The password you set in `ADMIN_PASSWORD`

### 3. Admin Dashboard Features
- View all bookings with search/filter capabilities
- Approve bookings (status changes to `confirmed`)
- Reject bookings (status changes to `cancelled`)
- Real-time status updates
- Admin session management

### 4. Booking Approval Process
1. Customer makes booking → Status: `pending`
2. Admin reviews booking in dashboard
3. Admin clicks "Approve" or "Reject"
4. Status updates in database with timestamp and admin email
5. Customer can be notified (implementation optional)

## Security Features

- **JWT Sessions**: Secure token-based authentication
- **Protected Routes**: Middleware protects all admin routes
- **Role-Based Access**: Only users with `admin` role can access dashboard
- **Session Timeout**: Configurable session duration
- **Environment Variables**: Sensitive credentials not in code

## Database Schema Updates

The `bookings` table now includes:
- `approvedAt`: Timestamp when booking was approved
- `approvedBy`: Email of admin who approved/rejected booking

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - Login/Logout/Session management

### Admin Operations
- `POST /api/admin/bookings/[bookingId]/approve` - Approve booking
- `POST /api/admin/bookings/[bookingId]/reject` - Reject booking

## Development Notes

### Middleware Warning
The build shows a middleware deprecation warning. This is normal for Next.js 16 and doesn't affect functionality.

### Database Required
For full functionality, ensure your PostgreSQL database is configured. Without a database, bookings are stored temporarily and approval actions will return an error.

## File Structure

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx          # Admin login page
│   └── dashboard/
│       └── page.tsx          # Admin dashboard
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   │       └── route.ts      # NextAuth configuration
│   └── admin/
│       └── bookings/
│           └── [bookingId]/
│               ├── approve/
│               │   └── route.ts
│               └── reject/
│                   └── route.ts
components/
├── providers.tsx             # SessionProvider wrapper
lib/
├── auth.ts                   # NextAuth configuration
└── schema.ts                 # Updated database schema
middleware.ts                 # Route protection
types/
└── next-auth.d.ts            # TypeScript declarations
```

## Testing

1. Set environment variables
2. Run `npm run dev`
3. Navigate to `/admin/login`
4. Login with admin credentials
5. Access `/admin/dashboard`
6. Test approve/reject functionality

## Production Deployment

For production deployment:
1. Set environment variables in your hosting platform
2. Ensure database is configured and schema is updated
3. Test admin access and booking approval workflow

The system is now ready for administrative booking management!
