// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://vmhwsxotkckfktehzfaz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtaHdzeG90a2NrZmt0ZWh6ZmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MzkzMzMsImV4cCI6MjA2NDExNTMzM30._TIJk9Oz9rtGQbrWpiIbdICfQrDR9pvxUf5FGDTiM3o";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);