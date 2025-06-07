import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, otp, password, firstName, lastName, role } = body;

    if (!email || !otp || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    // Call backend API to complete registration
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    console.log(`[Register API] Calling backend: ${backendUrl}/auth/register`);

    const response = await fetch(`${backendUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        otp,
        password,
        firstName,
        lastName,
        role: role || 'patient', // Default to patient
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[Register API] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to complete registration' },
        { status: response.status }
      );
    }

    console.log('[Register API] Registration completed successfully');

    return NextResponse.json({
      success: true,
      message: data.message,
      token: data.token,
      user: data.user
    });

  } catch (error) {
    console.error('[Register API] Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 