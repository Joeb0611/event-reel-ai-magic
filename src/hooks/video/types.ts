
export interface VideoFile {
  id: string;
  name: string;
  file_path: string;
  size: number;
  uploaded_at: string;
  created_at: string;
  edited: boolean;
  project_id: string;
  user_id: string;
  url?: string;
  thumbnail_url?: string;
  guest_name?: string;
  guest_message?: string;
  uploaded_by_guest?: boolean;
  stream_video_id?: string;
}
