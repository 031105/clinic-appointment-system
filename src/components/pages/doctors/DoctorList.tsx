import Image from 'next/image';
import Link from 'next/link';
import { Doctor, User, Specialty, Schedule } from '@prisma/client';

type DoctorWithRelations = Doctor & {
  user: User;
  specialty: Specialty;
  schedules: Schedule[];
};

interface DoctorListProps {
  doctors: DoctorWithRelations[];
}

const DoctorList = ({ doctors }: DoctorListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {doctors.map((doctor) => (
        <Link
          href={`/doctors/${doctor.id}`}
          key={doctor.id}
          className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <div className="flex items-center mb-4">
              <div className="h-16 w-16 rounded-full overflow-hidden">
                <Image
                  src={doctor.user.image || '/images/default-doctor.jpg'}
                  alt={doctor.user.name}
                  width={64}
                  height={64}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Dr. {doctor.user.name}
                </h2>
                <p className="text-blue-600">{doctor.specialty.name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-gray-600">
                {doctor.education || 'Medical Professional'}
              </p>
              <p className="text-gray-600">
                Experience: {doctor.yearsOfExperience} years
              </p>
              <div className="flex items-center text-gray-500">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 15.585l-4.146 2.18.792-4.615L3.293 9.797l4.622-.672L10 5l2.085 4.125 4.622.672-3.353 3.353.792 4.615L10 15.585z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="ml-1">
                  {doctor.rating || '4.5'} ({doctor.reviewCount || '0'} reviews)
                </span>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Next available: {doctor.schedules[0]?.startTime
                  ? new Date(doctor.schedules[0].startTime).toLocaleDateString()
                  : 'No availability'}
              </p>
            </div>

            <button className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
              Book Appointment
            </button>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default DoctorList; 