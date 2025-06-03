
import { Heart, Camera, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WelcomeScreenProps {
  onGetStarted: () => void;
}

const WelcomeScreen = ({ onGetStarted }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
            <Heart className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            MemoryWeave
          </h1>
          
          <p className="text-lg text-gray-600">
            Turn your wedding moments into cinematic memories
          </p>
        </div>

        {/* Feature Cards */}
        <div className="space-y-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Smart Collection</h3>
                  <p className="text-sm text-gray-600">Gather photos & videos from all your guests</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-pink-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">AI Magic</h3>
                  <p className="text-sm text-gray-600">Automatically create stunning highlight reels</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-red-600" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900">Easy Sharing</h3>
                  <p className="text-sm text-gray-600">Share your memories with family & friends</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Get Started Button */}
        <div className="space-y-4">
          <Button
            onClick={onGetStarted}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Get Started
          </Button>
          
          <p className="text-sm text-gray-500">
            Create beautiful wedding memories in minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
