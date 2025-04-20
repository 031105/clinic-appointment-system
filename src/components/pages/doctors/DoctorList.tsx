import Image from 'next/image';
import { Doctor } from '@/lib/mockData';
import { Rating } from '@/components/ui/Rating';

interface DoctorListProps {
  doctors: Doctor[];
  onDoctorSelect: (doctor: Doctor) => void;
  selectedDoctorId?: string;
}

const DoctorList = ({ doctors, onDoctorSelect, selectedDoctorId }: DoctorListProps) => {
  return (
    <div className="overflow-x-auto pb-4 -mr-6">
      <div className="flex gap-6 min-w-max pr-6">
        {doctors.map((doctor) => (
          <button
            key={doctor.id}
            onClick={() => onDoctorSelect(doctor)}
            className={`text-left w-80 flex-shrink-0 bg-white rounded-xl shadow-sm border transition-all duration-300 transform hover:scale-102 hover:shadow-md ${
              selectedDoctorId === doctor.id
                ? 'border-blue-600 ring-1 ring-blue-600 scale-102 shadow-md'
                : 'border-gray-100 hover:border-blue-600/30'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 transform transition-transform duration-200 hover:scale-105">
                  <Image
                    src={`/images/doctor-${doctor.id}.jpg`}
                    alt={doctor.name}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Dr. {doctor.name}
                  </h2>
                  <p className="text-blue-600 text-sm">{doctor.specialty}</p>
                  <div className="mt-2">
                    <Rating value={doctor.rating} size="sm" readOnly />
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>Medical Professional</p>
                <p>Experience: {doctor.experience} years</p>
                <p className="text-blue-600 font-medium">
                  $100 per consultation
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DoctorList; 