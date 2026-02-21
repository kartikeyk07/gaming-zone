# NeonNexus Gaming Zone Booking System

A modern gaming zone booking platform built with Next.js and Firebase.

## Features

- **Multi-Zone Support**: Browse and book games across multiple gaming zones in different cities
- **Game Booking**: Book Pickleball, Snooker, Bowling, and more with real-time slot availability
- **Cafe Menu**: Add optional food and beverages to your booking
- **User Authentication**: Secure login and registration with Firebase Auth
- **Admin Dashboard**: Full management of zones, games, bookings, and users
- **Payment Options**: Pay at venue (cash) or online (mock payment gateway)
- **Email Notifications**: Booking confirmations and cancellations via Resend

## Setup Instructions

### 1. Firebase Configuration

The app is pre-configured with Firebase credentials. However, you need to set up Firestore security rules in your Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (gaming-zone-c86a8)
3. Navigate to Firestore Database
4. Click on "Rules" tab
5. Set up the following rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    // Allow read for public data
    match /gamingZones/{zoneId} {
      allow read: if true;
    }
    match /games/{gameId} {
      allow read: if true;
    }
  }
}
```

### 2. Initialize Database

1. Visit `/seed` page
2. Click "Seed Database" to create sample data
3. This creates:
   - 3 Gaming Zones (Delhi, Bangalore, Mumbai)
   - 5 Games (Pickleball, Snooker, Bowling, etc.)
   - 10 Cafe Menu Items
   - Admin Account (admin@neonnexus.com / admin123)

### 3. Test Accounts

**Admin Account:**
- Email: admin@neonnexus.com
- Password: admin123

**User Account:**
- Register a new account via the Register page

## Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with hero section |
| Gaming Zones | `/zones` | Browse all gaming zones |
| Zone Details | `/zones/[id]` | View zone details and games |
| Book Game | `/book/[gameId]` | Book a slot with date/time selection |
| My Bookings | `/bookings` | View and manage your bookings |
| Login | `/login` | User login |
| Register | `/register` | New user registration |
| Profile | `/profile` | User profile management |
| Seed Database | `/seed` | Initialize sample data |
| Admin Dashboard | `/admin` | Admin overview |
| Admin Zones | `/admin/zones` | Manage gaming zones |
| Admin Games | `/admin/games` | Manage games |
| Admin Cafe | `/admin/cafe` | Manage cafe menu |
| Admin Bookings | `/admin/bookings` | Manage all bookings |
| Admin Users | `/admin/users` | Manage users |

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore)
- **Email**: Resend API
- **UI**: Framer Motion, Lucide Icons, Sonner

## Environment Variables

Create a `.env.local` file with:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
RESEND_API_KEY=your_resend_api_key
SENDER_EMAIL=onboarding@resend.dev
```

## Payment Gateway

The app includes a mock payment gateway with:
- 95% success rate simulation
- Pay at venue (cash) option
- Demo card inputs (any values work)

## Booking Rules

- Cancellation allowed up to 2 hours before slot time
- Cafe items are optional add-ons
- Real-time slot availability checking
- Email confirmations for all bookings
