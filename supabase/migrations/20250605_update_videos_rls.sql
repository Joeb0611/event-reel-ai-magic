
-- Enable RLS on videos table if not already enabled
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view their own videos
CREATE POLICY "Users can view their own videos" 
ON public.videos 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow authenticated users to view guest uploads for their projects
CREATE POLICY "Users can view guest uploads for their projects" 
ON public.videos 
FOR SELECT 
USING (
  uploaded_by_guest = true 
  AND project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = auth.uid()
  )
);

-- Allow guest uploads to be inserted (for guest upload functionality)
CREATE POLICY "Allow guest uploads" 
ON public.videos 
FOR INSERT 
WITH CHECK (uploaded_by_guest = true);

-- Allow authenticated users to insert their own videos
CREATE POLICY "Users can insert their own videos" 
ON public.videos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND (uploaded_by_guest = false OR uploaded_by_guest IS NULL));

-- Allow authenticated users to update their own videos
CREATE POLICY "Users can update their own videos" 
ON public.videos 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete their own videos
CREATE POLICY "Users can delete their own videos" 
ON public.videos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow authenticated users to delete guest uploads for their projects
CREATE POLICY "Users can delete guest uploads for their projects" 
ON public.videos 
FOR DELETE 
USING (
  uploaded_by_guest = true 
  AND project_id IN (
    SELECT id FROM public.projects 
    WHERE user_id = auth.uid()
  )
);
