import { useState } from 'react';
import { Play, Pause, Download, Heart, MoreHorizontal } from 'lucide-react';

interface MusicCardProps {
  music: {
    _id: string;
    title: string;
    prompt: string;
    audioUrl?: string;
    artworkUrl?: string;
    artworkData?: {
      baseColor: string;
      gradient: string;
      textColor: string;
      darkerColor: string;
      lighterColor: string;
      source: 'preset' | 'generated' | 'fallback';
      style: {
        background: string;
        color: string;
      };
    };
    duration: number;
    status: 'processing' | 'completed' | 'failed';
    createdAt: string;
  };
  isPlaying?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function MusicCard({ 
  music, 
  isPlaying = false, 
  onPlay, 
  onPause 
}: MusicCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handlePlayPause = () => {
    if (isPlaying) {
      onPause?.();
    } else {
      onPlay?.();
    }
  };

  // Determine artwork style
  const getArtworkStyle = () => {
    // If we have artwork data, use the generated gradient
    if (music.artworkData?.style) {
      return music.artworkData.style;
    }
    
    // Fallback to a simple gradient
    return {
      background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
      color: '#FFFFFF'
    };
  };

  const artworkStyle = getArtworkStyle();
  const hasRealImage = music.artworkUrl && !music.artworkUrl.startsWith('linear-gradient') && !imageError;

  return (
    <div 
      className="bg-card rounded-lg p-4 hover:bg-accent/50 transition-colors group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Artwork Section */}
      <div className="relative mb-4">
        <div 
          className="aspect-square rounded-lg overflow-hidden relative"
          style={hasRealImage ? {} : artworkStyle}
        >
          {/* Real Image or Generated Background */}
          {hasRealImage ? (
            <img
              src={music.artworkUrl}
              alt={music.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={artworkStyle}
            >
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {music.title ? music.title.charAt(0).toUpperCase() : '♪'}
                </div>
                <div className="text-xs opacity-75">
                  {music.artworkData?.source === 'preset' ? 'Preset' : 'Generated'}
                </div>
              </div>
            </div>
          )}
          
          {/* Play/Pause Overlay */}
          {(isHovered || isPlaying) && music.status === 'completed' && music.audioUrl && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <button
                className="rounded-full w-12 h-12 p-0 bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5 ml-1" />
                )}
              </button>
            </div>
          )}
          
          {/* Status Badge */}
          {music.status === 'processing' && (
            <div className="absolute top-2 right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
              Processing...
            </div>
          )}
          
          {music.status === 'failed' && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              Failed
            </div>
          )}
        </div>
      </div>

      {/* Music Info */}
      <div className="space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {music.title || 'Untitled'}
        </h3>
        
        <p className="text-xs text-muted-foreground line-clamp-2">
          {music.prompt}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {music.duration ? `${Math.floor(music.duration / 60)}:${(music.duration % 60).toString().padStart(2, '0')}` : '1:34'}
          </span>
          
          <div className="flex items-center gap-1">
            {/* Artwork Color Indicator */}
            {music.artworkData?.baseColor && (
              <div 
                className="w-4 h-4 rounded-full border border-gray-300"
                style={{ backgroundColor: music.artworkData.baseColor }}
                title={`Generated color: ${music.artworkData.baseColor}`}
              />
            )}
            
            <button className="h-6 w-6 p-0 hover:bg-accent rounded-lg">
              <Heart className="h-3 w-3" />
            </button>
            
            {music.audioUrl && (
              <button className="h-6 w-6 p-0 hover:bg-accent rounded-lg">
                <Download className="h-3 w-3" />
              </button>
            )}
            
            <button className="h-6 w-6 p-0 hover:bg-accent rounded-lg">
              <MoreHorizontal className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}