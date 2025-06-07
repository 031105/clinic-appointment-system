import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Call backend API for forgot password
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    console.log(`[Forgot Password API] Calling backend: ${backendUrl}/auth/forgot-password`);

    const response = await fetch(`${backendUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error('[Forgot Password API] Backend error:', data);
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to process password reset request' },
        { status: response.status }
      );
    }

    console.log('[Forgot Password API] Password reset processed successfully');

    return NextResponse.json({
      success: true,
      message: data.message,
      tempPassword: data.tempPassword, // For development - backend includes this in dev mode
      email: data.email,
      userName: data.userName
    });

  } catch (error) {
    console.error('[Forgot Password API] Server error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 