
import { Json } from '@/integrations/supabase/types';

export interface PrivacySettings {
  public_qr: boolean;
  guest_upload: boolean;
}

export interface WeddingMoment {
  type: 'ceremony' | 'reception' | 'emotional' | 'group';
  subtype: string;
  timestamp: number;
  duration: number;
  confidence: number;
  description: string;
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

// Convert Json type to WeddingMoment array
export function parseWeddingMoments(json: Json | null | undefined): WeddingMoment[] {
  if (!json) return [];
  
  try {
    if (typeof json === 'string') {
      return JSON.parse(json) as WeddingMoment[];
    }
    
    if (Array.isArray(json)) {
      return json as WeddingMoment[];
    }
  } catch (error) {
    console.error('Error parsing wedding moments:', error);
  }
  
  return [];
}

// Convert PrivacySettings to Json for database
export function stringifyPrivacySettings(settings: PrivacySettings): Json {
  return JSON.stringify(settings);
}

// Convert WeddingMoment array to Json for database
export function stringifyWeddingMoments(moments: WeddingMoment[]): Json {
  return JSON.stringify(moments);
}
