'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/use-toast';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // 显示登录中的提示
      toast({
        title: "登录中",
        description: "正在验证您的登录信息...",
      });
      
      // 直接调用登录API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      console.log('[Login Frontend] 登录响应:', data); // Debug log
  
      if (!response.ok || !data.success) {
        console.error('Login error:', data.message);
        setError('登录失败，请检查您的邮箱和密码');
        toast({
          title: "登录失败",
          description: "邮箱或密码错误，请重试。",
          variant: "destructive",
        });
      } else {
        console.log('[Login Frontend] 用户数据:', data.user); // Debug log
        console.log('[Login Frontend] 用户角色:', data.user.role); // Debug log
        
        // 登录成功，将token和用户信息保存到localStorage
        // 构造简化的token格式：user_id:email:role
        const token = `${data.user.id}:${data.user.email}:${data.user.role}`;
        localStorage.setItem('accessToken', token);
        localStorage.setItem('userData', JSON.stringify({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          firstName: data.user.firstName,
          lastName: data.user.lastName,
          role: data.user.role
        }));
        
        // 根据用户角色重定向到对应页面
        let redirectPath = '/user-dashboard';
        
        console.log('[Login Frontend] 检查角色重定向:', data.user.role); // Debug log
        
        if (data.user.role === 'admin') {
          redirectPath = '/admin-dashboard';
          console.log('[Login Frontend] 重定向到admin页面'); // Debug log
        } else if (data.user.role === 'doctor') {
          redirectPath = '/doctor-dashboard';
          console.log('[Login Frontend] 重定向到doctor页面'); // Debug log
        } else {
          // For patients
          redirectPath = '/user-dashboard';
          console.log('[Login Frontend] 重定向到patient页面'); // Debug log
        }
        
        console.log('[Login Frontend] 最终重定向路径:', redirectPath); // Debug log
        
        // 使用replace而不是push来避免浏览器历史问题
        router.replace(redirectPath);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('发生了意外错误，请稍后重试');
      toast({
        title: "登录失败",
        description: "发生了意外错误，请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      <div className="px-8 pt-8 pb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
        <p className="text-sm text-gray-600">Sign in to continue to your account</p>
      </div>

      <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your password"
            required
          />
        </div>

        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
            Remember me
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
          className="w-full py-3 rounded-xl"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>

        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
          </button>
          <button
            type="button"
            className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#039BE5" d="M24 5a19 19 0 1 0 0 38 19 19 0 1 0 0-38z"/>
              <path fill="#FFF" d="M26.572 29.036h4.917l.772-4.995h-5.69v-2.73c0-2.075.678-3.915 2.619-3.915h3.119v-4.359c-.548-.074-1.707-.236-3.897-.236-4.573 0-7.254 2.415-7.254 7.917v3.323h-4.701v4.995h4.701v13.729c.931.14 1.874.235 2.842.235.875 0 1.729-.08 2.572-.194v-13.77z"/>
            </svg>
          </button>
          <button
            type="button"
            className="flex justify-center items-center py-2.5 px-4 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50"
          >
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="#000"/>
              <path d="M17.291 16.295H6.709c-.387 0-.709-.374-.709-.833v-6.75c0-.459.322-.833.709-.833h10.582c.387 0 .709.374.709.833v6.75c0 .459-.322.833-.709.833z" fill="#000"/>
              <path d="M12 7.25c-2.891 0-5.25 2.359-5.25 5.25S9.109 17.75 12 17.75s5.25-2.359 5.25-5.25S14.891 7.25 12 7.25zm1.5 5.25a1.5 1.5 0 1 1-3.001-.001A1.5 1.5 0 0 1 13.5 12.5z" fill="#000"/>
            </svg>
          </button>
        </div>

        <div className="text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </Link>
        </div>
      </form>
    </div>
  );
}