import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import DoctorProfile from '@/components/pages/doctors/DoctorProfile';
import DoctorSchedule from '@/components/pages/doctors/DoctorSchedule';

type Props = {
  params: { id: string }
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const doctor = await prisma.doctor.findUnique({
    where: { id: params.id },
    include: { user: true, specialty: true }
  });

  if (!doctor) {
    return {
      title: 'Doctor Not Found',
    };
  }

  return {
    title: `Dr. ${doctor.user.name} - ${doctor.specialty.name}`,
    description: `Book appointments with Dr. ${doctor.user.name}, specialized in ${doctor.specialty.name}. View availability and schedule your visit online.`,
    openGraph: {
      title: `Dr. ${doctor.user.name} - ${doctor.specialty.name}`,
      description: `Book appointments with Dr. ${doctor.user.name}, specialized in ${doctor.specialty.name}`,
      images: [{ url: doctor.user.image || '/images/default-doctor.jpg' }],
    }
  };
}

export default async function DoctorProfilePage({ params }: Props) {
  const doctor = await prisma.doctor.findUnique({
    where: { id: params.id },
    include: {
      user: true,
      specialty: true,
      schedules: {
        where: {
          startTime: { gte: new Date() },
          isAvailable: true
        },
        orderBy: { startTime: 'asc' }
      }
    }
  });

  if (!doctor) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <DoctorProfile doctor={doctor} />
      <DoctorSchedule schedules={doctor.schedules} doctorId={doctor.id} />
    </div>
  );
} 