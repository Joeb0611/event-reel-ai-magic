
export const AI_SERVICE_CONFIG = {
  baseUrl: 'https://wedding-ai-service.onrender.com',
  endpoints: {
    processVideos: '/process-wedding-videos',
    jobStatus: '/job-status',
    health: '/health'
  }
};

export interface AIServiceError extends Error {
  code?: 'SERVICE_SLEEPING' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  retryAfter?: number;
}
