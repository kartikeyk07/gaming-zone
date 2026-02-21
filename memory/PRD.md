# NeonNexus Gaming Zone Booking System - PRD

## Project Overview
A multi-zone gaming booking platform built with Next.js and Firebase.

## Original Problem Statement
Build a Gaming Zone Booking System with:
- Multi-gaming zone support across cities (Delhi, Bangalore, Mumbai)
- User roles: Normal Users and Admins
- Game booking (Pickleball, Snooker, Bowling, Table Tennis, Pool)
- Cafe menu integration (optional add-on)
- Firebase Authentication and Firestore
- Resend for email notifications
- Pay at venue + Mock payment gateway (95% success rate)

## User Personas

### Normal User (Customer)
- Browse gaming zones by location/city
- View available games and pricing
- Book game slots with date/time selection
- Add optional cafe items
- View booking history
- Cancel bookings (up to 2 hours before)

### Admin
- Manage gaming zones (CRUD)
- Manage games and pricing
- Manage cafe menu items
- View/manage all bookings
- View/manage users
- View analytics and reports

## Core Requirements (Static)

### Authentication
- [x] Firebase email/password authentication
- [x] Role-based access control (admin/user)
- [x] Secure session handling
- [x] User registration with profile

### Gaming Zones Module
- [x] Multiple zone support
- [x] Zone details (name, address, city, timing, rating)
- [x] City-based filtering
- [x] Search functionality

### Game Management Module
- [x] Game listings per zone
- [x] Pricing per hour
- [x] Game descriptions

### Booking Module
- [x] Date selection (7-day range)
- [x] Time slot selection
- [x] Duration selection (1-4 hours)
- [x] Real-time availability checking
- [x] Booking confirmation
- [x] Booking cancellation (2-hour rule)

### Cafe Module
- [x] Menu display by category
- [x] Add items to booking (optional)
- [x] Price calculation

### Payment Module
- [x] Pay at venue (cash)
- [x] Mock online payment (95% success)

### Email Notifications
- [x] Booking confirmation emails
- [x] Cancellation alerts

### Admin Dashboard
- [x] Overview with stats
- [x] Zone management
- [x] Game management
- [x] Cafe menu management
- [x] Booking management
- [x] User management

## What's Been Implemented (Jan 21, 2026)

### Frontend (Next.js 14)
- ✅ Landing page with neon cyberpunk design
- ✅ Gaming zones listing with search/filter
- ✅ Zone detail page with games
- ✅ Game booking flow with date/time selection
- ✅ Cafe modal for optional items
- ✅ Payment modal (mock + cash)
- ✅ User bookings page
- ✅ Login/Register pages
- ✅ Profile page
- ✅ Admin dashboard
- ✅ Admin zones management
- ✅ Admin games management
- ✅ Admin cafe management
- ✅ Admin bookings management
- ✅ Admin users management
- ✅ Database seeder page (/seed)

### Backend (Firebase)
- ✅ Firebase Authentication configured
- ✅ Firestore collections structure defined
- ✅ Resend email integration for notifications

### Design
- ✅ Dark neon cyberpunk theme
- ✅ Custom Orbitron/Rajdhani fonts
- ✅ Framer Motion animations
- ✅ Glass-morphism effects
- ✅ Responsive design
- ✅ Custom loading screens

## Prioritized Backlog

### P0 (Critical)
- [ ] Firebase security rules setup in console
- [ ] Test full booking flow with live data

### P1 (High Priority)
- [ ] Booking reminders (24hr before)
- [ ] Admin analytics dashboard
- [ ] Zone ratings/reviews

### P2 (Medium Priority)
- [ ] Loyalty points system
- [ ] Membership plans
- [ ] Booking QR codes
- [ ] SMS notifications via Twilio

### P3 (Future)
- [ ] Multi-branch analytics
- [ ] AI-based recommendations
- [ ] Social media integration
- [ ] Mobile app (React Native)

## Technical Stack
- Frontend: Next.js 14, Tailwind CSS, Framer Motion
- Backend: Firebase (Auth, Firestore)
- Email: Resend API
- Payment: Mock gateway (95% success rate)

## Setup Required
1. Firebase Console: Set up Firestore security rules
2. Visit /seed page to initialize sample data
3. Admin login: admin@neonnexus.com / admin123

## Next Tasks
1. Configure Firebase Firestore security rules
2. Complete end-to-end booking test
3. Add booking reminder emails
4. Implement analytics dashboard
