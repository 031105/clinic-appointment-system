import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        doctors: {
          select: {
            id: true,
            name: true,
            specialty: true,
            experience: true,
            rating: true,
          },
        },
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
} 