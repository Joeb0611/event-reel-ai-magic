
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Users, Video, Calendar, Star } from 'lucide-react';
import { WeddingMoment } from '@/hooks/useWeddingProcessing';

interface DetectedMomentsPreviewProps {
  moments: WeddingMoment[];
  onApprove: () => void;
  onReject: () => void;
}

const DetectedMomentsPreview = ({ moments, onApprove, onReject }: DetectedMomentsPreviewProps) => {
  const getMomentIcon = (type: WeddingMoment['type']) => {
    switch (type) {
      case 'ceremony':
        return Heart;
      case 'reception':
        return Video;
      case 'emotional':
        return Heart;
      case 'group':
        return Users;
      default:
        return Star;
    }
  };

  const getMomentColor = (type: WeddingMoment['type']) => {
    switch (type) {
      case 'ceremony':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'reception':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'emotional':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'group':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60);
    const seconds = Math.floor(timestamp % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const totalDuration = moments.reduce((sum, moment) => sum + moment.duration, 0);
  const averageConfidence = moments.reduce((sum, moment) => sum + moment.confidence, 0) / moments.length;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600" />
          AI Detected Moments - Preview
        </CardTitle>
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{moments.length} moments found</span>
          <span>~{Math.round(totalDuration)}s total duration</span>
          <span>{Math.round(averageConfidence * 100)}% avg confidence</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          {['ceremony', 'reception', 'emotional', 'group'].map(type => {
            const count = moments.filter(m => m.type === type).length;
            const Icon = getMomentIcon(type as WeddingMoment['type']);
            return (
              <div key={type} className="text-center p-2 bg-white rounded border">
                <Icon className="w-4 h-4 mx-auto mb-1 text-gray-600" />
                <div className="text-lg font-semibold">{count}</div>
                <div className="text-xs text-gray-600 capitalize">{type}</div>
              </div>
            );
          })}
        </div>

        {/* Moments List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {moments.map((moment, index) => {
            const Icon = getMomentIcon(moment.type);
            return (
              <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                <Icon className="w-5 h-5 text-gray-600" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getMomentColor(moment.type)}>
                      {moment.type}
                    </Badge>
                    <span className="text-sm font-medium capitalize">
                      {moment.subtype?.replace('_', ' ') || 'Special moment'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{moment.description}</p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  <div>{formatTimestamp(moment.timestamp)}</div>
                  <div>{moment.duration}s</div>
                  <div>{Math.round(moment.confidence * 100)}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            These moments will be used to create your highlight reel. You can approve to continue or reject to try different settings.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onReject}>
              Try Different Settings
            </Button>
            <Button onClick={onApprove} className="bg-blue-600 hover:bg-blue-700">
              Approve & Create Reel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DetectedMomentsPreview;
