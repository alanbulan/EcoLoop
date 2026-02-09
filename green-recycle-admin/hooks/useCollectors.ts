import { useEffect, useState } from 'react';
import type { Collector } from '../types';
import { getCollectors } from '../api/services/collectors';

export const useCollectors = () => {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCollectors = async () => {
    setLoading(true);
    try {
      setCollectors(await getCollectors());
    } catch (e) {
      console.error('Failed to fetch collectors', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollectors();
  }, []);

  return {
    collectors,
    loading,
    refresh: fetchCollectors
  };
};
