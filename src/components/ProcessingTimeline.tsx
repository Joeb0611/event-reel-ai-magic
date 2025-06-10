
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Play } from 'lucide-react';
import { EventMoment } from '@/hooks/useEventProcessing';

interface ProcessingTimelineProps {
  moments: EventMoment[];
}

const ProcessingTimeline = ({ moments }: ProcessingTimelineProps) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMomentIcon = (type: EventMoment['type']) => {
    switch (type) {
      case 'main_event':
        return '💒';
      case 'celebration':
        return '🎉';
      case 'emotional':
        return '💕';
      case 'group':
        return '👥';
      case 'performance':
        return '🎭';
      case 'speech':
        return '🎤';
      default:
        return '🎬';
    }
  };

  const sortedMoments = [...moments].sort((a, b) => a.timestamp - b.timestamp);

  if (moments.length === 0) {
    return null;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Video Timeline - Selected Clips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {sortedMoments.map((moment, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <div className="text-2xl">{getMomentIcon(moment.type)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="text-xs">
                    {formatTime(moment.timestamp)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {moment.duration || 0}s
                  </Badge>
                  <span className="text-sm font-medium capitalize">
                    {(moment.subtype || 'moment').replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{moment.description || 'No description available'}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 mb-1">
                  {Math.round((moment.confidence || 0) * 100)}%
                </div>
                <Play className="w-4 h-4 text-blue-500" />
              </div>
            </div>
          ))}
        </div>
        
        {sortedMoments.length > 0 && (
          <div className="mt-4 p-3 bg-blue-100 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Total highlight duration:</strong> {sortedMoments.reduce((acc, moment) => acc + (moment.duration || 0), 0)}s
              <span className="ml-2">•</span>
              <strong className="ml-2">Clips selected:</strong> {sortedMoments.length}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessingTimeline;
