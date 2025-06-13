import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, type } = body;

    if (!email || !otp || !type) {
      return NextResponse.json(
        { success: false, message: 'Email, OTP, and type are required' },
        { status: 400 }
      );
    }

    // Call backend API to verify OTP
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    console.log(`[Verify OTP API] Calling backend: ${backendUrl}/auth/verify-otp`);

    const response = await fetch(`${backendUrl}/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        type,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[Verify OTP API] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to verify OTP' },
        { status: response.status }
      );
    }

    console.log('[Verify OTP API] OTP verified successfully');

    return NextResponse.json({
      success: true,
      message: data.message || 'OTP verified successfully'
    });

  } catch (error) {
    console.error('[Verify OTP API] Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 