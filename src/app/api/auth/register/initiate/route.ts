import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName } = body;

    if (!email || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    // Call backend API to initiate registration
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    console.log(`[Initiate Register API] Calling backend: ${backendUrl}/auth/register/initiate`);

    const response = await fetch(`${backendUrl}/auth/register/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        firstName,
        lastName,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[Initiate Register API] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to initiate registration' },
        { status: response.status }
      );
    }

    console.log('[Initiate Register API] Registration initiated successfully');

    return NextResponse.json({
      success: true,
      message: data.message,
      otp: data.otp, // For development - backend includes this in dev mode
      email: data.email
    });

  } catch (error) {
    console.error('[Initiate Register API] Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 