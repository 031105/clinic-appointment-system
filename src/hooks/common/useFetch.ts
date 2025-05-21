import { useState, useEffect } from 'react';
import { useSession } from '@/contexts/auth/SessionContext';

type FetchState<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = []
): FetchState<T> {
  const { status } = useSession();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, ...dependencies]);

  const refetch = async () => {
    await fetchData();
  };

  return { data, loading, error, refetch };
} 