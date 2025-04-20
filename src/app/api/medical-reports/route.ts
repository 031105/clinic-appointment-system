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

    const medicalReports = await prisma.medicalReport.findMany({
      where: {
        userId: session.user.id,
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
        date: 'desc',
      },
    });

    return NextResponse.json(medicalReports);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch medical reports' },
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
    const { title, content, date, doctorId } = body;

    const medicalReport = await prisma.medicalReport.create({
      data: {
        userId: session.user.id,
        title,
        content,
        date,
        doctorId,
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

    return NextResponse.json(medicalReport);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create medical report' },
      { status: 500 }
    );
  }
} 