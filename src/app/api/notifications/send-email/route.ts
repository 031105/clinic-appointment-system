import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email_data, notification_type = 'system' } = body;

    if (!email_data || !Array.isArray(email_data)) {
      return NextResponse.json(
        { success: false, message: 'Email data is required and must be an array' },
        { status: 400 }
      );
    }

    // This endpoint will be called from the frontend after admin sends notification
    // The frontend will use EmailJS to send emails based on the email_data
    // We just return success here as the actual email sending happens on frontend
    
    console.log(`[Send Email API] Received request to send ${email_data.length} emails of type: ${notification_type}`);

    return NextResponse.json({
      success: true,
      message: `Email sending initiated for ${email_data.length} recipients`,
      data: {
        email_count: email_data.length,
        notification_type
      }
    });

  } catch (error) {
    console.error('[Send Email API] Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 