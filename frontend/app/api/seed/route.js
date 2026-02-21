import { NextResponse } from 'next/server';

// This route just returns seed data instructions
// Actual seeding happens on client side via /seed page

export async function GET() {
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
        description: 'Our flagship gaming zone in the heart of Delhi.'
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
        description: 'Premium gaming experience in the tech hub of India.'
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
        description: 'The ultimate gaming destination in Mumbai.'
      }
    ],
    adminCredentials: {
      email: 'admin@neonnexus.com',
      password: 'admin123'
    }
  };

  return NextResponse.json({ 
    success: true, 
    message: 'Seed data available. Visit /seed to populate database.',
    seedData 
  });
}
