import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { useApi } from '../useApi';

// Mock API function
const mockApiSuccess = vi.fn(() => Promise.resolve({ data: { results: ['test'] } }));
const mockApiError = vi.fn(() => Promise.reject(new Error('API Error')));

describe('useApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should fetch data successfully', async () => {
    const { result } = renderHook(() => 
      useApi(mockApiSuccess, [], { immediate: true })
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ results: ['test'] });
    expect(result.current.error).toBe(null);
    expect(mockApiSuccess).toHaveBeenCalledTimes(1);
  });

  test('should handle API errors', async () => {
    const { result } = renderHook(() => 
      useApi(mockApiError, [], { immediate: true })
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('API Error');
    expect(mockApiError).toHaveBeenCalledTimes(1);
  });

  test('should not fetch immediately when immediate is false', () => {
    const { result } = renderHook(() => 
      useApi(mockApiSuccess, [], { immediate: false })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(mockApiSuccess).not.toHaveBeenCalled();
  });

  test('should execute manually', async () => {
    const { result } = renderHook(() => 
      useApi(mockApiSuccess, [], { immediate: false })
    );

    result.current.execute();

    expect(result.current.loading).toBe(true);
    expect(mockApiSuccess).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ results: ['test'] });
  });
});