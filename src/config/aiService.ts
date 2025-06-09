
export const AI_SERVICE_CONFIG = {
  baseUrl: 'https://joeb0611--memoryweave-ai-fastapi-app-dev.modal.run',
  endpoints: {
    processProject: '/api/event/process-project',
    status: '/api/event/status',
    results: '/api/event/results',
    analyzeSingle: '/api/event/analyze-single',
    health: '/health'
  }
};

export interface AIServiceError extends Error {
  code?: 'SERVICE_SLEEPING' | 'NETWORK_ERROR' | 'TIMEOUT' | 'UNKNOWN';
  retryAfter?: number;
}

// Map frontend values to AI service expected values
export const mapVideoStyleToAI = (style: string): string => {
  const mapping: Record<string, string> = {
    'romantic': 'romantic',
    'cinematic': 'cinematic',
    'upbeat': 'modern',
    'elegant': 'romantic',
    'vintage': 'vintage',
    'modern': 'modern'
  };
  return mapping[style] || 'romantic';
};

export const mapDurationToAI = (duration: string): string => {
  const mapping: Record<string, string> = {
    '30s': '1_minute',
    '1min': '1_minute', 
    '2min': '2_minutes',
    '3min': '3_minutes',
    '5min': '5_minutes'
  };
  return mapping[duration] || '2_minutes';
};

export const mapContentFocusToAI = (focus: string): string => {
  const mapping: Record<string, string> = {
    'main_event': 'main_event',
    'celebration': 'celebration',
    'ceremony': 'main_event', // backward compatibility
    'reception': 'celebration', // backward compatibility
    'balanced': 'balanced',
    'highlights': 'balanced',
    'emotional': 'people',
    'candid': 'people'
  };
  return mapping[focus] || 'balanced';
};
