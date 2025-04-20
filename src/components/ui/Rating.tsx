'use client';

import { StarIcon } from '@heroicons/react/20/solid';

interface RatingProps {
  value: number;
  max?: number;
}

export function Rating({ value, max = 5 }: RatingProps) {
  return (
    <div className="flex">
      {Array.from({ length: max }).map((_, index) => (
        <StarIcon
          key={index}
          className={`h-4 w-4 ${
            index < value
              ? 'text-yellow-400'
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
} 