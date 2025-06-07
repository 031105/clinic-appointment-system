import { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

// 定义用户数据类型
interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  // 添加其他需要的用户属性
}

// 定义缓存数据类型
interface CachedData {
  appointments?: any[];
  departments?: any[];
  doctors?: any[];
  timestamp: number;
  expiresIn?: number; // 可选的自定义过期时间（毫秒）
}

interface UserContextType {
  user: UserData | null;
  cache: {
    [key: string]: CachedData;
  };
  getCachedData: (key: string) => any;
  setCachedData: (key: string, data: any) => void;
  clearCache: () => void;
}

const DEFAULT_CACHE_DURATION = 5 * 60 * 1000; // 默认5分钟缓存

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserData | null>(null);
  const [cache, setCache] = useState<{ [key: string]: CachedData }>({});

  useEffect(() => {
    if (session?.user) {
      setUser({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        role: session.user.role || 'PATIENT',
      });
    }
  }, [session]);

  const getCachedData = (key: string) => {
    const cachedData = cache[key];
    if (!cachedData) return null;
    
    // 使用自定义过期时间或默认过期时间
    const cacheDuration = cachedData.expiresIn || DEFAULT_CACHE_DURATION;
    
    if (Date.now() - cachedData.timestamp < cacheDuration) {
      return cachedData;
    }
    
    // 缓存已过期
    console.log(`Cache for ${key} expired`);
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    console.log(`Caching data for ${key}`);
    setCache(prev => ({
      ...prev,
      [key]: {
        ...data,
        timestamp: Date.now(),
      },
    }));
  };

  const clearCache = () => {
    console.log('Clearing all cache');
    setCache({});
  };

  return (
    <UserContext.Provider value={{ user, cache, getCachedData, setCachedData, clearCache }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 