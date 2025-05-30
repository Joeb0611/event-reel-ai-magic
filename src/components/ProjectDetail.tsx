
import { useState } from 'react';
import { Plus, Video, Calendar, Clock, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import VideoManager from '@/components/VideoManager';
import VideoUpload from '@/components/VideoUpload';
import AIProcessingPanel from '@/components/AIProcessingPanel';
import ProcessingTimeline from '@/components/ProcessingTimeline';
import ProcessingDashboard from '@/components/ProcessingDashboard';
import { Project } from '@/hooks/useProjects';
import { VideoFile } from '@/hooks/useVideos';
import { useWeddingProcessing } from '@/hooks/useWeddingProcessing';

interface ProjectDetailProps {
  project: Project;
  projectVideos: VideoFile[];
  onBack: () => void;
  onTriggerAIEditing: (project: Project) => void;
  onVideosUploaded: (videos: VideoFile[]) => void;
  onVideoDeleted: () => void;
}

const ProjectDetail = ({ 
  project, 
  projectVideos, 
  onBack, 
  onTriggerAIEditing, 
  onVideosUploaded,
  onVideoDeleted 
}: ProjectDetailProps) => {
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const { currentJob } = useWeddingProcessing(project.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900"
        >
          ← Back to Projects
        </Button>
        <Button
          onClick={() => setShowVideoUpload(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Videos
        </Button>
      </div>

      {/* Video Manager Component */}
      <VideoManager 
        project={project} 
        onVideoDeleted={onVideoDeleted}
      />

      {/* AI Processing Panel */}
      <AIProcessingPanel 
        projectId={project.id}
        hasVideos={projectVideos.length > 0}
      />

      {/* Processing Timeline */}
      {currentJob?.detected_moments && currentJob.detected_moments.length > 0 && (
        <ProcessingTimeline moments={currentJob.detected_moments} />
      )}

      {/* Processing Dashboard */}
      {currentJob && (
        <ProcessingDashboard job={currentJob} />
      )}

      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">{project.name}</CardTitle>
          <CardDescription className="text-lg">{project.description}</CardDescription>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(project.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Video className="w-4 h-4" />
              {projectVideos.length} videos
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {project.edited_video_url && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-green-600" />
                AI-Edited Wedding Highlight Reel
              </h3>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4">
                <p className="text-green-700 mb-2">✨ Your wedding highlight reel is ready!</p>
                <p className="text-sm text-gray-600">URL: {project.edited_video_url}</p>
              </div>
            </div>
          )}

          {projectVideos.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Uploaded Videos</h3>
                {projectVideos.length > 0 && !project.edited_video_url && !currentJob?.status && (
                  <Button
                    onClick={() => onTriggerAIEditing(project)}
                    variant="outline"
                    className="border-purple-200 text-purple-600 hover:bg-purple-50"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Generate Basic Highlight Reel
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projectVideos.map((video) => (
                  <Card key={video.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                        {video.url ? (
                          <video
                            src={video.url}
                            className="w-full h-full object-cover rounded-lg"
                            controls
                          />
                        ) : (
                          <Video className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <p className="font-medium text-sm truncate mb-1">{video.name}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{(video.size / (1024 * 1024)).toFixed(1)} MB</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(video.uploaded_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Video className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No videos uploaded yet</p>
              <Button
                onClick={() => setShowVideoUpload(true)}
                variant="outline"
              >
                Upload Your First Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showVideoUpload && (
        <VideoUpload
          isOpen={showVideoUpload}
          onClose={() => setShowVideoUpload(false)}
          onVideosUploaded={onVideosUploaded}
          projectId={project.id}
          projectName={project.name}
        />
      )}
    </div>
  );
};

export default ProjectDetail;
