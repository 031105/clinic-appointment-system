import Image from 'next/image';
import { Doctor, User, Specialty, Schedule } from '@prisma/client';

type DoctorWithRelations = Doctor & {
  user: User;
  specialty: Specialty;
  schedules: Schedule[];
};

interface DoctorProfileProps {
  doctor: DoctorWithRelations;
}

const DoctorProfile = ({ doctor }: DoctorProfileProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3">
          <div className="rounded-lg overflow-hidden">
            <Image
              src={doctor.user.image || '/images/default-doctor.jpg'}
              alt={doctor.user.name}
              width={300}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
        </div>

        <div className="md:w-2/3 md:ml-8 mt-4 md:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">
            Dr. {doctor.user.name}
          </h1>
          <p className="text-xl text-blue-600 mt-2">{doctor.specialty.name}</p>

          <div className="mt-4 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Education</h2>
              <p className="text-gray-600">{doctor.education}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Experience</h2>
              <p className="text-gray-600">{doctor.yearsOfExperience} years</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">Languages</h2>
              <p className="text-gray-600">{doctor.languages?.join(', ') || 'English'}</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-gray-600">{doctor.bio}</p>
            </div>

            <div className="flex items-center">
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
              <span className="ml-2 text-gray-600">
                {doctor.rating || '4.5'} ({doctor.reviewCount || '0'} reviews)
              </span>
            </div>
          </div>

          <button className="mt-6 bg-blue-500 text-white py-3 px-6 rounded-md hover:bg-blue-600 transition-colors">
            Book Appointment
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile; 