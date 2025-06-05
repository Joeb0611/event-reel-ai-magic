
-- Create the guest-uploads storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'guest-uploads',
  'guest-uploads',
  false,
  104857600, -- 100MB limit
  ARRAY['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'video/mp4', 'video/mov', 'video/quicktime']
);

-- Create storage policy for guest uploads
CREATE POLICY "Allow authenticated users and guests to upload files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'guest-uploads');

-- Allow authenticated users and guests to view uploaded files
CREATE POLICY "Allow authenticated users and guests to view files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'guest-uploads');

-- Allow authenticated users to delete files (for cleanup)
CREATE POLICY "Allow authenticated users to delete files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'guest-uploads' AND auth.uid() IS NOT NULL);
