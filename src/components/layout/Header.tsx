import { BellIcon } from '@heroicons/react/24/outline';

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome, Kayden!
            </h1>
          </div>
          <div className="flex items-center">
            <button className="p-2 rounded-full text-gray-400 hover:text-gray-500">
              <BellIcon className="h-6 w-6" />
            </button>
            <div className="ml-3 relative">
              <div>
                <button className="flex text-sm rounded-full focus:outline-none">
                  <img
                    className="h-8 w-8 rounded-full"
                    src="/avatar-placeholder.png"
                    alt="User avatar"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 