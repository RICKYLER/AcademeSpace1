
import React, { useState, useEffect } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users, MessageSquare, MoreHorizontal } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface VideoCallInterfaceProps {
  isActive: boolean;
  onEndCall: () => void;
  participantName: string;
  participantAvatar: string;
}

const VideoCallInterface: React.FC<VideoCallInterfaceProps> = ({
  isActive,
  onEndCall,
  participantName,
  participantAvatar
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 bg-gradient-to-b from-black/50 to-transparent text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
              {participantAvatar}
            </div>
            <div>
              <h3 className="font-semibold">{participantName}</h3>
              <p className="text-sm text-gray-300">{formatDuration(callDuration)}</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Connected
          </Badge>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 relative bg-gray-900">
        {/* Remote Video */}
        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
              {participantAvatar}
            </div>
            <p className="text-xl font-semibold">{participantName}</p>
            <p className="text-gray-400">Video call in progress</p>
          </div>
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-32 h-24 bg-gray-800 rounded-lg overflow-hidden border-2 border-white/20">
          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-white text-xs">You</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`p-6 bg-gradient-to-t from-black/80 to-transparent transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center justify-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMicOn(!isMicOn)}
            className={`rounded-full w-14 h-14 ${isMicOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
          >
            {isMicOn ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className={`rounded-full w-14 h-14 ${isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white`}
          >
            {isVideoOn ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onEndCall}
            className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600 text-white"
          >
            <PhoneOff className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white"
          >
            <MessageSquare className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full w-14 h-14 bg-gray-700 hover:bg-gray-600 text-white"
          >
            <MoreHorizontal className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoCallInterface;
