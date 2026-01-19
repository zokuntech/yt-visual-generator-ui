import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

function SceneCard({ scene, index, onRegenerateImage }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Log scene data for debugging
  React.useEffect(() => {
    console.log(`🎬 Scene ${index + 1}:`, {
      id: scene.id,
      status: scene.image_status,
      hasImageUrl: !!scene.image_url,
      imageUrlLength: scene.image_url?.length || 0,
      imageUrlPrefix: scene.image_url?.substring(0, 50) || 'no image',
      text: scene.sentence_text.substring(0, 50) + '...'
    });
  }, [scene, index]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerateImage(scene.id);
    setTimeout(() => setIsRegenerating(false), 1000);
  };

  const getStatusBadge = () => {
    switch (scene.image_status) {
      case 'generated':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Generated
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500 text-white">
            <Clock className="w-3 h-3 mr-1 animate-pulse" />
            Generating...
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Header */}
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
        <div className="flex justify-between items-center">
          <span className="font-semibold">Scene {index + 1}</span>
          {getStatusBadge()}
        </div>
      </CardHeader>

      {/* Image */}
      <div className="relative w-full h-64 bg-gray-100 overflow-hidden">
        {scene.image_status === 'generated' && scene.image_url ? (
          <img 
            src={scene.image_url} 
            alt={scene.sentence_text}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              console.error(`❌ Scene ${index + 1} - Image failed to load:`, {
                src: scene.image_url?.substring(0, 100),
                error: e.type,
                imageUrlLength: scene.image_url?.length
              });
              // Replace with placeholder on error
              e.target.src = `https://placehold.co/400x300/667eea/white?text=Scene+${index + 1}+Image+Error`;
            }}
            onLoad={() => {
              console.log(`✅ Scene ${index + 1} - Image loaded successfully`);
            }}
          />
        ) : scene.image_status === 'pending' ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
            <p className="text-sm text-muted-foreground">Generating image...</p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-red-50">
            <XCircle className="w-12 h-12 text-destructive mb-3" />
            <p className="text-sm text-destructive">Image generation failed</p>
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-4">
        <p className="text-sm leading-relaxed text-foreground font-medium">
          {scene.sentence_text}
        </p>

        {/* Details Toggle */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? (
            <>
              <ChevronUp className="w-4 h-4 mr-2" />
              Hide Details
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4 mr-2" />
              Show Details
            </>
          )}
        </Button>

        {/* Expanded Details */}
        {showDetails && scene.visual_prompt && (
          <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg">
            {/* Style */}
            <div className="space-y-2">
              <h4 className="font-semibold text-primary">Style</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><strong>Art Style:</strong> {scene.visual_prompt.style?.art_style}</li>
                <li><strong>Lighting:</strong> {scene.visual_prompt.style?.lighting}</li>
                <li><strong>Color Palette:</strong> {scene.visual_prompt.style?.color_palette}</li>
                <li><strong>Background:</strong> {scene.visual_prompt.style?.background}</li>
              </ul>
            </div>

            {/* Characters */}
            {scene.visual_prompt.characters && scene.visual_prompt.characters.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Characters</h4>
                {scene.visual_prompt.characters.map((char, idx) => (
                  <div key={idx} className="bg-background p-3 rounded space-y-1">
                    <p><strong>Role:</strong> {char.role}</p>
                    <p><strong>Description:</strong> {char.description}</p>
                    <p><strong>Expression:</strong> {char.expression}</p>
                    <p><strong>Pose:</strong> {char.pose}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Composition */}
            {scene.visual_prompt.composition && (
              <div className="space-y-2">
                <h4 className="font-semibold text-primary">Composition</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li><strong>Camera Angle:</strong> {scene.visual_prompt.composition.camera_angle}</li>
                  <li><strong>Framing:</strong> {scene.visual_prompt.composition.framing}</li>
                  <li><strong>Extras:</strong> {scene.visual_prompt.composition.extras}</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer */}
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleRegenerate}
          disabled={isRegenerating || scene.image_status === 'pending'}
        >
          {isRegenerating || scene.image_status === 'pending' ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Regenerating...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Image
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default SceneCard;
