import { Metadata } from 'next';
import prisma from '@/lib/prisma';
import DoctorList from '@/components/pages/doctors/DoctorList';
import SearchBar from '@/components/forms/SearchBar';

export const metadata: Metadata = {
  title: 'Find Doctors',
  description: 'Browse and find the best healthcare professionals. Book appointments with experienced doctors across various specialties.',
  openGraph: {
    title: 'Find Doctors | Clinic Appointment System',
    description: 'Browse and find the best healthcare professionals',
    images: [{ url: '/images/doctors-og.jpg' }],
  }
};

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: { specialty?: string; search?: string }
}) {
  const doctors = await prisma.doctor.findMany({
    where: {
      specialty: searchParams.specialty ? {
        name: searchParams.specialty
      } : undefined,
      OR: searchParams.search ? [
        { user: { name: { contains: searchParams.search, mode: 'insensitive' } } },
        { specialty: { name: { contains: searchParams.search, mode: 'insensitive' } } }
      ] : undefined
    },
    include: {
      user: true,
      specialty: true,
      schedules: {
        where: {
          startTime: { gte: new Date() }
        }
      }
    }
  });

  const specialties = await prisma.specialty.findMany();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Find Your Doctor</h1>
      
      <SearchBar specialties={specialties} />

      <DoctorList doctors={doctors} />
    </div>
  );
} 