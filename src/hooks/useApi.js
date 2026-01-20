import { useState, useEffect, useCallback } from 'react';

export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { 
    immediate = true, 
    onSuccess, 
    onError,
    transform 
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      const result = transform ? transform(response.data) : response.data;
      
      setData(result);
      onSuccess?.(result);
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.status_message || err.message || 'Bir hata oluştu';
      setError(errorMessage);
      onError?.(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, transform, onSuccess, onError]);

  useEffect(() => {
    if (immediate && dependencies.every(dep => dep !== undefined)) {
      execute(...dependencies);
    }
  }, dependencies);

  const refetch = useCallback(() => {
    return execute(...dependencies);
  }, [execute, dependencies]);

  return {
    data,
    loading,
    error,
    execute,
    refetch
  };
};

export const usePaginatedApi = (apiFunction, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalPages, setTotalPages] = useState(0);

  const { 
    resetOnParamsChange = true,
    transform,
    onSuccess,
    onError 
  } = options;

  const loadMore = useCallback(async (resetData = false) => {
    if (loading) return;

    try {
      setLoading(true);
      setError(null);

      const currentPage = resetData ? 1 : page;
      const response = await apiFunction(currentPage);
      const result = transform ? transform(response.data) : response.data;

      setData(prevData => resetData ? result.results : [...prevData, ...result.results]);
      setPage(currentPage + 1);
      setHasMore(currentPage < result.total_pages);
      setTotalPages(result.total_pages);
      
      onSuccess?.(result);
    } catch (err) {
      const errorMessage = err.response?.data?.status_message || err.message || 'Bir hata oluştu';
      setError(errorMessage);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction, page, loading, transform, onSuccess, onError]);

  const reset = useCallback(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setTotalPages(0);
  }, []);

  const refresh = useCallback(() => {
    reset();
    loadMore(true);
  }, [reset, loadMore]);

  return {
    data,
    loading,
    error,
    hasMore,
    page: page - 1,
    totalPages,
    loadMore: () => loadMore(false),
    refresh,
    reset
  };
};
