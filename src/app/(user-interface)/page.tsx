'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from '@/contexts/SessionContext';

// 添加调试组件
function SessionDebugger() {
  const { data: session, status } = useSession();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const checkSession = async () => {
    try {
      setLoading(true);
      console.log('Checking session via API');
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Session debug data:', data);
      setDebugInfo(data);
    } catch (error) {
      console.error('Failed to get session debug info:', error);
      setDebugInfo({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Session Debugger</h3>
      <p>Status: <span className="font-mono">{status}</span></p>
      
      <button 
        onClick={checkSession} 
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        disabled={loading}
      >
        {loading ? 'Checking...' : 'Check Session API'}
      </button>
      
      {debugInfo && (
        <div className="mt-3 p-3 bg-white rounded border border-gray-300">
          <pre className="text-xs overflow-auto max-h-60">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-4">
          Welcome to HealthClinic
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Your trusted partner for convenient, high-quality healthcare services.
        </p>
      </header>
      
      {/* 添加会话调试器 */}
      {process.env.NODE_ENV !== 'production' && <SessionDebugger />}

      {/* 服务介绍 */}
      <section className="mb-16">
        {/* ... 此处保留原有代码 ... */}
      </section>
    </div>
  );
} 