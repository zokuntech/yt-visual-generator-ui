import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Clock, Heart, Edit, Maximize2, Download, X } from 'lucide-react';
import EditSceneModal from './EditSceneModal';

function SceneCard({ scene, index, onRegenerateImage, onApproveScene, onEditScene }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Log scene data for debugging
  React.useEffect(() => {
    console.log(`🎬 Scene ${index + 1}:`, {
      id: scene.id,
      status: scene.image_status,
      hasImageUrl: !!scene.image_url,
      imageUrlLength: scene.image_url?.length || 0,
      imageUrlPrefix: scene.image_url?.substring(0, 50) || 'no image',
      text: scene.sentence_text.substring(0, 50) + '...',
      hasVisualPrompt: !!scene.visual_prompt
    });
  }, [scene, index]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    await onRegenerateImage(scene.id);
    setTimeout(() => setIsRegenerating(false), 1000);
  };

  const handleApprove = () => {
    setIsApproved(!isApproved);
    if (onApproveScene) {
      onApproveScene(scene.id, !isApproved);
    }
  };

  const handleEdit = (updatedPrompt) => {
    if (onEditScene) {
      onEditScene(scene.id, updatedPrompt);
    }
    setShowEditModal(false);
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

  const handleDownloadImage = () => {
    if (!scene.image_url) return;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = scene.image_url;
    link.download = `scene-${index + 1}-${scene.id.substring(0, 8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`💾 Downloaded scene ${index + 1} image`);
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Scene {index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleApprove}
                className={`h-7 px-2 ${isApproved ? 'bg-white/20' : ''}`}
              >
                <Heart className={`w-4 h-4 ${isApproved ? 'fill-current text-pink-300' : ''}`} />
              </Button>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        {/* Image */}
        <div className="relative w-full h-64 bg-gray-100 overflow-hidden group">
          {scene.image_status === 'generated' && scene.image_url ? (
            <>
              <img 
                src={scene.image_url} 
                alt={scene.sentence_text}
                className="w-full h-full object-cover transition-transform duration-300 cursor-pointer"
                onClick={() => setShowImageModal(true)}
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
              {/* Hover buttons */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setShowImageModal(true)}
                  className="gap-1"
                >
                  <Maximize2 className="w-4 h-4" />
                  Expand
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleDownloadImage}
                  className="gap-1"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </>
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

          {/* Action Buttons Row */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
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
            <Button
              variant="outline"
              onClick={() => setShowEditModal(true)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>

          {/* Expanded Details */}
          {showDetails && scene.visual_prompt && (
            <div className="space-y-4 text-sm bg-muted/50 p-4 rounded-lg max-h-96 overflow-y-auto">
              {/* Style */}
              {scene.visual_prompt.style && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Style</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    {scene.visual_prompt.style.art_style && (
                      <li><strong>Art Style:</strong> {scene.visual_prompt.style.art_style}</li>
                    )}
                    {scene.visual_prompt.style.lighting && (
                      <li><strong>Lighting:</strong> {scene.visual_prompt.style.lighting}</li>
                    )}
                    {scene.visual_prompt.style.color_palette && (
                      <li><strong>Color Palette:</strong> {scene.visual_prompt.style.color_palette}</li>
                    )}
                    {scene.visual_prompt.style.background && (
                      <li><strong>Background:</strong> {scene.visual_prompt.style.background}</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Characters */}
              {scene.visual_prompt.characters && scene.visual_prompt.characters.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Characters</h4>
                  {scene.visual_prompt.characters.map((char, idx) => (
                    <div key={idx} className="bg-background p-3 rounded space-y-1">
                      {char.role && <p><strong>Role:</strong> {char.role}</p>}
                      {char.description && <p><strong>Description:</strong> {char.description}</p>}
                      
                      {/* Handle expression (can be string or object) */}
                      {char.expression && (
                        <div>
                          <strong>Expression:</strong>
                          {typeof char.expression === 'string' ? (
                            <span> {char.expression}</span>
                          ) : (
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {char.expression.primary && <li>• {char.expression.primary}</li>}
                              {char.expression.micro_expression && <li>• Micro: {char.expression.micro_expression}</li>}
                              {char.expression.eye_focus && <li>• Eyes: {char.expression.eye_focus}</li>}
                            </ul>
                          )}
                        </div>
                      )}
                      
                      {/* Handle pose (can be string or object) */}
                      {char.pose && (
                        <div>
                          <strong>Pose:</strong>
                          {typeof char.pose === 'string' ? (
                            <span> {char.pose}</span>
                          ) : (
                            <ul className="ml-4 mt-1 space-y-0.5">
                              {char.pose.body_language && <li>• Body: {char.pose.body_language}</li>}
                              {char.pose.hand_position && <li>• Hands: {char.pose.hand_position}</li>}
                              {char.pose.stance && <li>• Stance: {char.pose.stance}</li>}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Composition */}
              {scene.visual_prompt.composition && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Composition</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    {scene.visual_prompt.composition.camera_angle && (
                      <li><strong>Camera Angle:</strong> {scene.visual_prompt.composition.camera_angle}</li>
                    )}
                    {scene.visual_prompt.composition.framing && (
                      <li><strong>Framing:</strong> {scene.visual_prompt.composition.framing}</li>
                    )}
                    {scene.visual_prompt.composition.extras && (
                      <li><strong>Extras:</strong> {scene.visual_prompt.composition.extras}</li>
                    )}
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

      {/* Image Viewer Modal */}
      {showImageModal && scene.image_url && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/95 animate-in fade-in duration-200"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image Container */}
            <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
              <img
                src={scene.image_url}
                alt={scene.sentence_text}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Action bar */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur rounded-lg p-4 max-w-3xl w-full mx-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-white flex-1 min-w-0">
                  <p className="font-semibold">Scene {index + 1}</p>
                  <p className="text-sm text-white/80 truncate">{scene.sentence_text}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadImage();
                  }}
                  className="gap-2 flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <EditSceneModal
          scene={scene}
          onClose={() => setShowEditModal(false)}
          onSave={handleEdit}
        />
      )}
    </>
  );
}

export default SceneCard;
