import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { email, type, booking } = await request.json();

    if (!email || !booking) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let subject = '';
    let html = '';

    const formatDate = (dateStr) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };

    if (type === 'confirmation') {
      subject = `Booking Confirmed - ${booking.gameName} at ${booking.zoneName}`;
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00F0FF; font-size: 28px; margin: 0;">NEONNEXUS</h1>
            <p style="color: #a3a3a3; margin-top: 5px;">Gaming Zone</p>
          </div>
          
          <div style="background: linear-gradient(135deg, rgba(0,240,255,0.1) 0%, rgba(0,0,0,0) 100%); border: 1px solid rgba(0,240,255,0.3); padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #00F0FF; margin: 0 0 20px 0; font-size: 24px;">Booking Confirmed!</h2>
            <p style="margin: 0; color: #ededed;">Your slot has been successfully booked.</p>
          </div>
          
          <div style="background: #121212; border: 1px solid rgba(255,255,255,0.1); padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #00F0FF; margin: 0 0 20px 0; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Game</td>
                <td style="padding: 10px 0; text-align: right; font-weight: bold;">${booking.gameName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Venue</td>
                <td style="padding: 10px 0; text-align: right;">${booking.zoneName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Address</td>
                <td style="padding: 10px 0; text-align: right;">${booking.zoneAddress}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Date</td>
                <td style="padding: 10px 0; text-align: right;">${formatDate(booking.date)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Time</td>
                <td style="padding: 10px 0; text-align: right;">${booking.timeSlot} (${booking.duration} hr${booking.duration > 1 ? 's' : ''})</td>
              </tr>
            </table>
          </div>
          
          <div style="background: #121212; border: 1px solid rgba(255,255,255,0.1); padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #FFE600; margin: 0 0 15px 0; font-size: 18px;">Payment Summary</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3;">Game Charges</td>
                <td style="padding: 8px 0; text-align: right;">₹${booking.gameTotal}</td>
              </tr>
              ${booking.cafeTotal > 0 ? `
              <tr>
                <td style="padding: 8px 0; color: #a3a3a3;">Cafe Items</td>
                <td style="padding: 8px 0; text-align: right;">₹${booking.cafeTotal}</td>
              </tr>
              ` : ''}
              <tr style="border-top: 1px solid rgba(255,255,255,0.1);">
                <td style="padding: 15px 0; font-weight: bold; font-size: 18px;">Total</td>
                <td style="padding: 15px 0; text-align: right; font-weight: bold; font-size: 18px; color: #FFE600;">₹${booking.totalAmount}</td>
              </tr>
            </table>
            <p style="margin: 10px 0 0 0; color: #a3a3a3; font-size: 14px;">
              Payment Method: <strong style="color: #ededed;">${booking.paymentMethod === 'cash' ? 'Pay at Gaming Zone' : 'Paid Online'}</strong>
            </p>
          </div>
          
          <div style="background: rgba(255,0,60,0.1); border: 1px solid rgba(255,0,60,0.3); padding: 20px; margin-bottom: 20px;">
            <h4 style="color: #FF003C; margin: 0 0 10px 0;">Important Notes</h4>
            <ul style="margin: 0; padding-left: 20px; color: #a3a3a3;">
              <li style="margin-bottom: 5px;">Please arrive 10 minutes before your slot</li>
              <li style="margin-bottom: 5px;">Wear appropriate footwear</li>
              <li style="margin-bottom: 5px;">Cancellation allowed up to 2 hours before</li>
            </ul>
          </div>
          
          <div style="text-align: center; color: #a3a3a3; font-size: 12px; margin-top: 30px;">
            <p>Thank you for choosing NeonNexus Gaming Zone!</p>
            <p style="margin-top: 10px;">© 2026 NeonNexus Gaming. All rights reserved.</p>
          </div>
        </div>
      `;
    } else if (type === 'cancellation') {
      subject = `Booking Cancelled - ${booking.gameName} at ${booking.zoneName}`;
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00F0FF; font-size: 28px; margin: 0;">NEONNEXUS</h1>
            <p style="color: #a3a3a3; margin-top: 5px;">Gaming Zone</p>
          </div>
          
          <div style="background: linear-gradient(135deg, rgba(255,0,60,0.1) 0%, rgba(0,0,0,0) 100%); border: 1px solid rgba(255,0,60,0.3); padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #FF003C; margin: 0 0 20px 0; font-size: 24px;">Booking Cancelled</h2>
            <p style="margin: 0; color: #ededed;">Your booking has been cancelled as requested.</p>
          </div>
          
          <div style="background: #121212; border: 1px solid rgba(255,255,255,0.1); padding: 25px; margin-bottom: 20px;">
            <h3 style="color: #a3a3a3; margin: 0 0 20px 0; font-size: 18px;">Cancelled Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Game</td>
                <td style="padding: 10px 0; text-align: right;">${booking.gameName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Venue</td>
                <td style="padding: 10px 0; text-align: right;">${booking.zoneName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Date</td>
                <td style="padding: 10px 0; text-align: right;">${formatDate(booking.date)}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #a3a3a3;">Time</td>
                <td style="padding: 10px 0; text-align: right;">${booking.timeSlot}</td>
              </tr>
            </table>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #a3a3a3;">Want to book again?</p>
            <p style="margin-top: 10px;">
              <a href="#" style="display: inline-block; background: #00F0FF; color: #000; padding: 12px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase;">Book Now</a>
            </p>
          </div>
          
          <div style="text-align: center; color: #a3a3a3; font-size: 12px; margin-top: 30px;">
            <p>© 2026 NeonNexus Gaming. All rights reserved.</p>
          </div>
        </div>
      `;
    } else if (type === 'reminder') {
      subject = `Reminder: Your booking tomorrow - ${booking.gameName}`;
      html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ededed; padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #00F0FF; font-size: 28px; margin: 0;">NEONNEXUS</h1>
          </div>
          
          <div style="background: linear-gradient(135deg, rgba(255,230,0,0.1) 0%, rgba(0,0,0,0) 100%); border: 1px solid rgba(255,230,0,0.3); padding: 30px; margin-bottom: 20px;">
            <h2 style="color: #FFE600; margin: 0 0 20px 0; font-size: 24px;">Reminder: Your Game is Tomorrow!</h2>
            <p style="margin: 0; color: #ededed;">Don't forget your upcoming booking.</p>
          </div>
          
          <div style="background: #121212; border: 1px solid rgba(255,255,255,0.1); padding: 25px;">
            <p><strong>Game:</strong> ${booking.gameName}</p>
            <p><strong>Venue:</strong> ${booking.zoneName}</p>
            <p><strong>Date:</strong> ${formatDate(booking.date)}</p>
            <p><strong>Time:</strong> ${booking.timeSlot}</p>
          </div>
          
          <div style="text-align: center; color: #a3a3a3; font-size: 12px; margin-top: 30px;">
            <p>© 2026 NeonNexus Gaming. All rights reserved.</p>
          </div>
        </div>
      `;
    }

    const data = await resend.emails.send({
      from: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
      to: [email],
      subject,
      html
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
