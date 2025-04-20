import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: session.user.id,
        ...(status ? { status } : {}),
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { doctorId, date, time, notes } = body;

    const appointment = await prisma.appointment.create({
      data: {
        userId: session.user.id,
        doctorId,
        date,
        time,
        notes,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialty: true,
          },
        },
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
} 