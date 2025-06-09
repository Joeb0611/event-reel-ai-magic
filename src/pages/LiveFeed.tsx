
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Image, Clock, User, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { VideoFile } from '@/hooks/useVideos';
import { formatDistanceToNow } from 'date-fns';
import MediaPreview from '@/components/dashboard/MediaPreview';

interface Project {
  id: string;
  name: string;
  bride_name?: string;
  groom_name?: string;
}

const LiveFeed = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [media, setMedia] = useState<VideoFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProject = async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, bride_name, groom_name')
      .eq('id', projectId)
      .single();
    
    if (error) {
      console.error('Error fetching project:', error);
      return;
    }
    
    setProject(data);
  };

  const fetchMedia = async () => {
    if (!projectId) return;
    
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('project_id', projectId)
      .order('uploaded_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching media:', error);
      return;
    }
    
    // Convert uploaded_at to created_at for VideoFile interface compatibility
    const convertedData = data?.map(video => ({
      ...video,
      created_at: video.uploaded_at
    })) || [];
    
    setMedia(convertedData);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMedia();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchProject();
    fetchMedia();
    setLoading(false);
  }, [projectId]);

  // Set up real-time subscription for new uploads
  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel('media-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'videos',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          console.log('New media uploaded:', payload);
          const newVideo = {
            ...payload.new as any,
            created_at: payload.new.uploaded_at
          };
          setMedia(prev => [newVideo, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live feed...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Project not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="bg-white/80 backdrop-blur-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Live Feed</h1>
              <p className="text-gray-600">{project.name}</p>
            </div>
          </div>
          
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Image className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{media.length}</p>
                  <p className="text-sm text-gray-600">Total Photos & Videos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-pink-600" />
                <div>
                  <p className="text-2xl font-bold">{new Set(media.map(m => m.guest_name || 'Host')).size}</p>
                  <p className="text-sm text-gray-600">Contributors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {media.length > 0 ? formatDistanceToNow(new Date(media[0].created_at)) : '0'}
                  </p>
                  <p className="text-sm text-gray-600">Last Upload</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Media Feed */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            {media.length === 0 ? (
              <div className="text-center py-12">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">No photos or videos yet</p>
                <p className="text-gray-400 text-sm">Photos and videos will appear here as guests upload them</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <MediaPreview video={item} />
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      <p className="text-xs font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      {item.guest_name && (
                        <p className="text-xs text-gray-500 truncate">
                          by {item.guest_name}
                        </p>
                      )}
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveFeed;
