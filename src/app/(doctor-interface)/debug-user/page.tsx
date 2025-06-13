'use client';

import { useSession } from '@/contexts/auth/SessionContext';
import { useState, useEffect } from 'react';
import doctorSettingsClient from '@/lib/api/doctor-settings';

export default function DebugUserPage() {
  const { data, status } = useSession();
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctorProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await doctorSettingsClient.getProfile();
      setDoctorProfile(profile);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch doctor profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDoctorProfile();
    }
  }, [status]);

  if (status === 'loading') {
    return <div className="p-6">Loading session...</div>;
  }

  if (status === 'unauthenticated') {
    return <div className="p-6">Not authenticated</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">User Debug Information</h1>
      
      <div className="grid gap-6">
        {/* Session Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Session Data</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {status}</p>
            <p><strong>User ID:</strong> {data.user?.id}</p>
            <p><strong>Email:</strong> {data.user?.email}</p>
            <p><strong>Name:</strong> {data.user?.name}</p>
            <p><strong>Role:</strong> {data.user?.role}</p>
          </div>
        </div>

        {/* LocalStorage Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">LocalStorage Data</h2>
          <div className="space-y-2">
            <p><strong>Access Token:</strong> {typeof window !== 'undefined' ? localStorage.getItem('accessToken') : 'N/A'}</p>
            <p><strong>User Data:</strong></p>
            <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
              {typeof window !== 'undefined' ? localStorage.getItem('userData') : 'N/A'}
            </pre>
          </div>
        </div>

        {/* Doctor Profile API Data */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Doctor Profile API Data</h2>
          <button 
            onClick={fetchDoctorProfile}
            className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh Profile'}
          </button>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              Error: {error}
            </div>
          )}
          
          {doctorProfile && (
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(doctorProfile, null, 2)}
            </pre>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-2">Instructions</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Check if the Session Data shows the correct logged-in user</li>
            <li>Compare the Session Data with the Doctor Profile API Data</li>
            <li>If they don't match, there might be an authentication issue</li>
            <li>If they match but show Emily Patel, you are logged in as Emily Patel</li>
            <li>Try logging out and logging in with a different doctor account</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 