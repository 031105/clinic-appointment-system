import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, type } = body;

    if (!email || !type) {
      return NextResponse.json(
        { success: false, message: 'Email and type are required' },
        { status: 400 }
      );
    }

    if (!['registration', 'password_reset'].includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid type. Must be registration or password_reset' },
        { status: 400 }
      );
    }

    // Call backend API to resend OTP
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    console.log(`[Resend OTP API] Calling backend: ${backendUrl}/auth/resend-otp`);

    const response = await fetch(`${backendUrl}/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        type,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[Resend OTP API] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to resend verification code' },
        { status: response.status }
      );
    }

    console.log('[Resend OTP API] OTP resent successfully');

    return NextResponse.json({
      success: true,
      message: data.message,
      otp: data.otp, // For development - backend includes this in dev mode
    });

  } catch (error) {
    console.error('[Resend OTP API] Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 