import React from 'react';
import { twMerge } from 'tailwind-merge';

interface WelcomeSectionProps {
  userName?: string;
  className?: string;
}

export function WelcomeSection() {
  return (
    <section className="bg-blue-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to Our Clinic
          </h1>
          <p className="text-xl mb-8">
            Book appointments with top healthcare professionals
          </p>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Book an Appointment
          </button>
        </div>
      </div>
    </section>
  );
}

const WelcomeSectionComponent: React.FC<WelcomeSectionProps> = ({
  userName = 'Guest',
  className,
}) => {
  return (
    <div className={twMerge('mb-8', className)}>
      <h1 className="text-2xl font-bold text-gray-900">
        Welcome back, {userName}!
      </h1>
      <p className="mt-2 text-gray-600">
        How can we help you today? Book an appointment or check your upcoming
        visits.
      </p>
      <div className="mt-4 flex gap-4">
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Book Appointment
        </button>
        <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          View History
        </button>
      </div>
    </div>
  );
};

export default WelcomeSectionComponent; 