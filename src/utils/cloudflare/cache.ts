
/**
 * Create a thumbnail cache key
 */
export const createThumbnailCacheKey = (streamId: string, size: string): string => {
  return `thumbnail_${streamId}_${size}`;
};

/**
 * Simple in-memory thumbnail cache
 */
class ThumbnailCache {
  private cache = new Map<string, { url: string; timestamp: number }>();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, url: string): void {
    this.cache.set(key, { url, timestamp: Date.now() });
  }

  get(key: string): string | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if cache entry is still valid
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.url;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const thumbnailCache = new ThumbnailCache();
