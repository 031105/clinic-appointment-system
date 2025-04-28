'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  HomeIcon, 
  ClockIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { toast } from '@/components/ui/use-toast';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // 清除用户角色信息
    localStorage.removeItem('clinic-user-role');
    
    // 显示登出成功提示
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
      variant: "default",
    });
    
    // 重定向到登录页面
    router.push('/login');
  };

  const navigation = [
    {
      name: 'Home',
      href: '/',
      icon: HomeIcon,
    },
    {
      name: 'View History',
      href: '/appointments',
      icon: ClockIcon,
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="w-20 h-screen bg-white border-r border-gray-200 flex flex-col items-center py-6">
      {/* Logo */}
      <div className="mb-8">
        <Link href="/" className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-xl">
          <span className="text-xl font-bold">C</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`w-12 h-12 flex items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
              title={item.name}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          );
        })}
      </nav>

      {/* Logout and User Menu */}
      <div className="mt-auto flex flex-col items-center gap-4">
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-12 h-12 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Logout"
        >
          <ArrowRightOnRectangleIcon className="w-6 h-6" />
        </button>
        
        {/* User Avatar */}
        <button className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="text-lg font-medium text-gray-600">K</span>
        </button>
      </div>
    </div>
  );
} 