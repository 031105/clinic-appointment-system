import { DoctorCard } from '@/components/pages/home/DoctorCard';
import { DepartmentCard } from '@/components/pages/home/DepartmentCard';
import WelcomeSection from '@/components/pages/home/WelcomeSection';
import { Metadata } from 'next';
import Script from 'next/script';
import { dataService } from '@/lib/dataService';
import { Doctor, Department } from '@/lib/mockData';

// Get data at build time
const doctors = dataService.getDoctors();
const departments = dataService.getDepartments();

export const metadata: Metadata = {
  title: 'Home | Clinic Appointment System',
  description: `Book appointments with ${doctors.length}+ healthcare providers across ${departments.length} medical departments. Easy online scheduling available 24/7.`,
  alternates: {
    canonical: 'https://your-domain.com',
  },
};

export default function HomePage() {
  // Generate structured data for Google Rich Results
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    name: 'Your Clinic Name',
    description: 'Book appointments with your preferred healthcare providers',
    medicalSpecialty: departments.map((department: Department) => ({
      '@type': 'MedicalSpecialty',
      name: department.name,
    })),
    employee: doctors.map((doctor: Doctor) => ({
      '@type': 'Physician',
      name: doctor.name,
      medicalSpecialty: doctor.specialty,
    })),
  };

  return (
    <>
      <Script id="structured-data" type="application/ld+json">
        {JSON.stringify(structuredData)}
      </Script>
      
      <main className="min-h-screen">
        <WelcomeSection />
        
        <section className="py-12 px-4">
          <h1 className="text-4xl font-bold mb-8">Online Medical Appointments</h1>
          <h2 className="text-2xl font-bold mb-6">Our Departments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((department: Department) => (
              <DepartmentCard key={department.id} department={department} />
            ))}
          </div>
        </section>

        <section className="py-12 px-4">
          <h2 className="text-2xl font-bold mb-6">Featured Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor: Doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
} 