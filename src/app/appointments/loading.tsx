export default function Loading() {
  return (
    <div className="flex h-full">
      {/* Left sidebar skeleton */}
      <div className="w-80 p-4 border-r">
        <div className="animate-pulse">
          {/* Calendar skeleton */}
          <div className="h-64 bg-gray-200 rounded-lg mb-6" />
          
          {/* Filter buttons skeleton */}
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6">
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-6" />

          {/* Appointment list skeleton */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Right sidebar skeleton */}
      <div className="w-96 border-l p-6">
        <div className="animate-pulse">
          {/* Title skeleton */}
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6" />

          {/* Doctor info skeleton */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-32 h-32 bg-gray-200 rounded-full mb-4" />
            <div className="h-6 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>

          {/* Appointment info skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 