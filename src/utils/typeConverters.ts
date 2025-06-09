
import { Json } from '@/integrations/supabase/types';

export interface PrivacySettings {
  public_qr: boolean;
  guest_upload: boolean;
}

export interface EventMoment {
  type: 'main_event' | 'celebration' | 'emotional' | 'group' | 'performance' | 'speech';
  subtype: string;
  timestamp: number;
  duration: number;
  confidence: number;
  description: string;
}

// Type guard function to validate EventMoment objects
function isEventMoment(obj: any): obj is EventMoment {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.type === 'string' &&
    ['main_event', 'celebration', 'emotional', 'group', 'performance', 'speech', 'ceremony', 'reception'].includes(obj.type) &&
    typeof obj.subtype === 'string' &&
    typeof obj.timestamp === 'number' &&
    typeof obj.duration === 'number' &&
    typeof obj.confidence === 'number' &&
    typeof obj.description === 'string'
  );
}

// Convert Json type to PrivacySettings
export function parsePrivacySettings(json: Json | null | undefined): PrivacySettings {
  const defaultSettings: PrivacySettings = { public_qr: true, guest_upload: true };
  
  if (!json) return defaultSettings;
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json) as PrivacySettings;
    }
    
    if (typeof json === 'object' && json !== null) {
      const obj = json as any;
      return {
        public_qr: obj.public_qr ?? defaultSettings.public_qr,
        guest_upload: obj.guest_upload ?? defaultSettings.guest_upload,
      };
    }
  } catch (error) {
    console.error('Error parsing privacy settings:', error);
  }
  
  return defaultSettings;
}

// Convert Json type to EventMoment array
export function parseEventMoments(json: Json | null | undefined): EventMoment[] {
  if (!json) return [];
  
  try {
    let parsed: any;
    
    if (typeof json === 'string') {
      parsed = JSON.parse(json);
    } else {
      parsed = json;
    }
    
    if (Array.isArray(parsed)) {
      // Filter and validate each item using the type guard
      // Also map old wedding types to new event types for backward compatibility
      return parsed.map(item => {
        if (item.type === 'ceremony') item.type = 'main_event';
        if (item.type === 'reception') item.type = 'celebration';
        return item;
      }).filter(isEventMoment);
    }
  } catch (error) {
    console.error('Error parsing event moments:', error);
  }
  
  return [];
}

// Convert PrivacySettings to Json for database
export function stringifyPrivacySettings(settings: PrivacySettings): Json {
  return JSON.stringify(settings);
}

// Convert EventMoment array to Json for database
export function stringifyEventMoments(moments: EventMoment[]): Json {
  return JSON.stringify(moments);
}

// Legacy support - keep old function names for backward compatibility
export const parseWeddingMoments = parseEventMoments;
export const stringifyWeddingMoments = stringifyEventMoments;
export type WeddingMoment = EventMoment;
