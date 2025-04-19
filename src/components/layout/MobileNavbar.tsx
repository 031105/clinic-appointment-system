import Link from 'next/link';
import { 
  HomeIcon, 
  CalendarIcon, 
  UserIcon, 
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

export default function MobileNavbar() {
  const navigation = [
    { name: 'Home', href: '/', icon: HomeIcon },
    { name: 'Search', href: '/search', icon: MagnifyingGlassIcon },
    { name: 'Appointments', href: '/appointments', icon: CalendarIcon },
    { name: 'Profile', href: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white border-t">
      <div className="grid grid-cols-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center py-2"
          >
            <item.icon className="h-6 w-6 text-gray-500" />
            <span className="text-xs text-gray-500">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
} 