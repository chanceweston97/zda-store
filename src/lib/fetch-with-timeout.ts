/**
 * Fetch with Timeout Utility
 * Prevents 504 errors by aborting slow WordPress requests
 * 
 * Usage:
 * const res = await fetchWithTimeout(url, {}, 3000);
 */

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 3000 // VERY IMPORTANT: 3 seconds max
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      next: { revalidate: 60 }, // optional caching
    });

    return res;
  } catch (error: any) {
    // Handle abort errors gracefully
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      const timeoutError = new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
      (timeoutError as any).code = 'TIMEOUT';
      (timeoutError as any).status = 504;
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(id);
  }
}
