
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Video, 
  TrendingUp, 
  Heart, 
  Users,
  RotateCcw 
} from 'lucide-react';
import { ProcessingJob } from '@/hooks/useEventProcessing';

interface ProcessingDashboardProps {
  job: ProcessingJob;
  onRetry?: () => void;
}

const ProcessingDashboard = ({ job, onRetry }: ProcessingDashboardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatDuration = (start?: string, end?: string) => {
    if (!start || !end) return 'N/A';
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${Math.round(duration / 1000)}s`;
  };

  const getMomentStats = () => {
    const moments = job.detected_moments || [];
    const stats = {
      ceremony: moments.filter(m => m.type === 'ceremony').length,
      reception: moments.filter(m => m.type === 'reception').length,
      emotional: moments.filter(m => m.type === 'emotional').length,
      group: moments.filter(m => m.type === 'group').length,
    };
    return stats;
  };

  const stats = getMomentStats();

  return (
    <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-600" />
          Processing Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Job Status Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Badge 
              variant={job.status === 'completed' ? 'default' : job.status === 'failed' ? 'destructive' : 'secondary'}
              className="mb-2"
            >
              {job.status}
            </Badge>
            <p className="text-xs text-gray-600">Status</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-indigo-600">{job.progress}%</p>
            <p className="text-xs text-gray-600">Progress</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-purple-600">
              {job.detected_moments?.length || 0}
            </p>
            <p className="text-xs text-gray-600">Moments Found</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600">
              {formatDuration(job.started_at, job.completed_at)}
            </p>
            <p className="text-xs text-gray-600">Duration</p>
          </div>
        </div>

        {/* Moment Categories */}
        {job.detected_moments && job.detected_moments.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Moments by Category</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-purple-100 rounded-lg p-3 text-center">
                <Heart className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                <p className="text-lg font-semibold text-purple-700">{stats.ceremony}</p>
                <p className="text-xs text-purple-600">Ceremony</p>
              </div>
              <div className="bg-blue-100 rounded-lg p-3 text-center">
                <Video className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <p className="text-lg font-semibold text-blue-700">{stats.reception}</p>
                <p className="text-xs text-blue-600">Reception</p>
              </div>
              <div className="bg-pink-100 rounded-lg p-3 text-center">
                <Heart className="w-6 h-6 text-pink-600 mx-auto mb-1" />
                <p className="text-lg font-semibold text-pink-700">{stats.emotional}</p>
                <p className="text-xs text-pink-600">Emotional</p>
              </div>
              <div className="bg-green-100 rounded-lg p-3 text-center">
                <Users className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <p className="text-lg font-semibold text-green-700">{stats.group}</p>
                <p className="text-xs text-green-600">Group</p>
              </div>
            </div>
          </div>
        )}

        {/* Timing Information */}
        <div className="bg-white rounded-lg p-4 border">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Processing Timeline
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Started:</span>
              <span>{job.started_at ? formatDate(job.started_at) : 'N/A'}</span>
            </div>
            {job.completed_at && (
              <div className="flex justify-between">
                <span className="text-gray-600">Completed:</span>
                <span>{formatDate(job.completed_at)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span>{formatDate(job.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {job.status === 'failed' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-2">Processing Failed</h4>
            {job.error_message && (
              <p className="text-red-700 text-sm mb-3">{job.error_message}</p>
            )}
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="outline"
                size="sm"
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry Processing
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingDashboard;
