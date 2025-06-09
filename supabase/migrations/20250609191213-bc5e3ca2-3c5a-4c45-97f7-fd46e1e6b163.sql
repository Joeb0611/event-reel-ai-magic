
-- Add guest signup control to projects privacy settings
ALTER TABLE projects ADD COLUMN IF NOT EXISTS guest_signup_enabled BOOLEAN DEFAULT false;

-- Create guest accounts table for event-specific guest access
CREATE TABLE IF NOT EXISTS guest_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on guest accounts
ALTER TABLE guest_accounts ENABLE ROW LEVEL SECURITY;

-- Create event access permissions table
CREATE TABLE IF NOT EXISTS event_access_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_account_id UUID REFERENCES guest_accounts(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  can_download BOOLEAN DEFAULT true,
  can_view BOOLEAN DEFAULT true,
  UNIQUE(guest_account_id, project_id)
);

-- Enable RLS on event access permissions
ALTER TABLE event_access_permissions ENABLE ROW LEVEL SECURITY;

-- Create live displays table for TV display management
CREATE TABLE IF NOT EXISTS live_displays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  display_key TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{"autoAdvance": true, "duration": 5, "showNames": true}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on live displays
ALTER TABLE live_displays ENABLE ROW LEVEL SECURITY;

-- Create slideshow queue table for managing display content
CREATE TABLE IF NOT EXISTS slideshow_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  media_id UUID, -- Can reference videos or media_assets
  display_order INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on slideshow queue
ALTER TABLE slideshow_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for guest accounts (guests can only see their own account)
CREATE POLICY "Guests can view their own account" ON guest_accounts
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Guests can update their own account" ON guest_accounts
  FOR UPDATE USING (auth.uid()::text = id::text);

-- RLS Policies for event access permissions
CREATE POLICY "Project owners can manage guest access" ON event_access_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = event_access_permissions.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Guests can view their own permissions" ON event_access_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM guest_accounts 
      WHERE guest_accounts.id = event_access_permissions.guest_account_id 
      AND guest_accounts.id::text = auth.uid()::text
    )
  );

-- RLS Policies for live displays
CREATE POLICY "Project owners can manage displays" ON live_displays
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = live_displays.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- RLS Policies for slideshow queue
CREATE POLICY "Project owners can manage slideshow" ON slideshow_queue
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = slideshow_queue.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Update projects table to remove stream-related columns
ALTER TABLE videos DROP COLUMN IF EXISTS stream_status;
ALTER TABLE videos DROP COLUMN IF EXISTS stream_playback_url;

-- Add function to generate display keys
CREATE OR REPLACE FUNCTION generate_display_key() RETURNS TEXT AS $$
BEGIN
  RETURN 'display_' || encode(gen_random_bytes(8), 'hex');
END;
$$ LANGUAGE plpgsql;
