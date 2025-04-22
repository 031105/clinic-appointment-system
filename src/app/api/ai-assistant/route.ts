import { NextRequest, NextResponse } from 'next/server';
import { assistantService } from '@/lib/services/assistant-service';
import { Message } from '@/types/ai-assistant';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { message, conversationHistory } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Get user session if available
    const session = await getServerSession(authOptions);
    const userInfo = session ? {
      isAuthenticated: true,
      userId: session.user.id,
      // You can add more user context here from your database
      hasAppointments: true // This would come from checking the database
    } : {
      isAuthenticated: false
    };

    // Process the message
    const response = await assistantService.processMessage(
      message,
      conversationHistory || [],
      userInfo
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in AI assistant API:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}