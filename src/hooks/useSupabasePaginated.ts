import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useSupabasePaginated<T>(
  table: string, 
  { pageSize = 20, orderBy = 'created_at', ascending = false }: { pageSize?: number, orderBy?: string, ascending?: boolean } = {}
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (isNewPage: boolean = false) => {
    if (loading || (!hasMore && isNewPage)) return;

    setLoading(true);
    setError(null);
    const from = isNewPage ? (page + 1) * pageSize : 0;
    const to = from + pageSize - 1;

    try {
      const { data: fetchedData, error: fetchError } = await supabase
        .from(table)
        .select('*')
        .order(orderBy, { ascending })
        .range(from, to);

      if (fetchError) throw fetchError;

      if (isNewPage) {
        setData(prev => [...prev, ...(fetchedData || [])]);
        setPage(prev => prev + 1);
      } else {
        setData(fetchedData || []);
        setPage(0);
      }
      
      setHasMore(fetchedData ? fetchedData.length === pageSize : false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, page, pageSize, orderBy, ascending, loading, hasMore]);

  useEffect(() => {
    fetchData(false);
  }, [table]);

  return { data, loading, error, hasMore, fetchMore: () => fetchData(true), refresh: () => fetchData(false) };
}
