
// Cache duration in milliseconds
export const CACHE_DURATION = 30000; // 30 seconds cache

// Cache timestamp
let lastFetchTime = 0;

// Get last fetch time
export const getLastFetchTime = (): number => {
  return lastFetchTime;
};

// Set last fetch time
export const setLastFetchTime = (time: number): void => {
  lastFetchTime = time;
};

// Set cache data
export const setCache = <T>(key: string, data: T): void => {
  console.log(`Setting cache for ${key}`);
  // This would be extended in the future for different cache keys
};

// Reset cache
export const resetCache = (): void => {
  console.log("Resetting all cache");
  lastFetchTime = 0;
};
