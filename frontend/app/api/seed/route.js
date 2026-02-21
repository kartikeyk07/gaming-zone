import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Initialize Firebase Admin (server-side)
const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: `firebase-adminsdk-fbsvc@${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC+Kp1M5v7mPxJW\n5A7p3BdX5Qp0rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5\nrT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT\n9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9\nR5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R\n5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5rT9R5\nrT9R5rT9AgMBAAECggEAVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\nVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV\n-----END PRIVATE KEY-----\n".replace(/\\n/g, '\n'),
  }),
};

// We'll use client-side Firebase for seeding since we don't have admin credentials
// This is a workaround - in production, you'd use proper admin credentials

export async function POST(request) {
  try {
    // Return instructions for client-side seeding
    const seedData = {
      gamingZones: [
        {
          name: 'NeonNexus Central',
          area: 'Connaught Place',
          city: 'Delhi',
          address: 'Block A, CP',
          phone: '+91 98765 43210',
          email: 'central@neonnexus.com',
          timing: '10:00 AM - 12:00 AM',
          image: 'https://images.pexels.com/photos/28471428/pexels-photo-28471428.jpeg',
          isOpen: true,
          rating: 4.8,
          startingPrice: 300,
          games: ['Pickleball', 'Snooker', 'Bowling'],
          description: 'Our flagship gaming zone in the heart of Delhi. State-of-the-art facilities with professional equipment.'
        },
        {
          name: 'NeonNexus South',
          area: 'Koramangala',
          city: 'Bangalore',
          address: '5th Block, Koramangala',
          phone: '+91 98765 43211',
          email: 'south@neonnexus.com',
          timing: '9:00 AM - 11:00 PM',
          image: 'https://images.pexels.com/photos/7862374/pexels-photo-7862374.jpeg',
          isOpen: true,
          rating: 4.6,
          startingPrice: 250,
          games: ['Pickleball', 'Table Tennis', 'Pool'],
          description: 'Premium gaming experience in the tech hub of India. Perfect for corporate events and casual gaming.'
        },
        {
          name: 'NeonNexus West',
          area: 'Bandra',
          city: 'Mumbai',
          address: 'Hill Road, Bandra West',
          phone: '+91 98765 43212',
          email: 'west@neonnexus.com',
          timing: '10:00 AM - 1:00 AM',
          image: 'https://images.pexels.com/photos/12789438/pexels-photo-12789438.jpeg',
          isOpen: true,
          rating: 4.9,
          startingPrice: 400,
          games: ['Bowling', 'Snooker', 'Pickleball'],
          description: 'The ultimate gaming destination in Mumbai. Featuring neon-lit bowling alleys and premium snooker tables.'
        }
      ],
      games: [
        { name: 'Pickleball', pricePerHour: 400, description: 'Fast-paced paddle sport combining elements of tennis, badminton, and ping-pong.' },
        { name: 'Snooker', pricePerHour: 300, description: 'Classic cue sport played on a large green baize-covered table.' },
        { name: 'Bowling', pricePerHour: 350, description: 'Lane-based sport where players roll a ball to knock down pins.' },
        { name: 'Table Tennis', pricePerHour: 200, description: 'Fast-paced racket sport played on a divided table.' },
        { name: 'Pool', pricePerHour: 250, description: '8-ball and 9-ball pool on professional tables.' }
      ],
      cafeMenu: [
        { name: 'Classic Burger', category: 'Food', price: 180, description: 'Juicy beef patty with fresh veggies' },
        { name: 'Margherita Pizza', category: 'Food', price: 250, description: 'Classic tomato and mozzarella' },
        { name: 'French Fries', category: 'Snacks', price: 120, description: 'Crispy golden fries with dipping sauce' },
        { name: 'Nachos', category: 'Snacks', price: 150, description: 'Tortilla chips with cheese and salsa' },
        { name: 'Chicken Wings', category: 'Snacks', price: 220, description: 'Spicy buffalo wings' },
        { name: 'Coca Cola', category: 'Beverages', price: 60, description: '330ml can' },
        { name: 'Red Bull', category: 'Beverages', price: 150, description: '250ml energy drink' },
        { name: 'Fresh Lime Soda', category: 'Beverages', price: 80, description: 'Refreshing lime with soda' },
        { name: 'Cappuccino', category: 'Coffee', price: 120, description: 'Classic Italian coffee' },
        { name: 'Cold Coffee', category: 'Coffee', price: 140, description: 'Iced coffee with cream' }
      ],
      adminUser: {
        email: 'admin@neonnexus.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin'
      }
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Use client-side seeding with the provided data',
      seedData 
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
