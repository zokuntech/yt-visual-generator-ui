import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, ChevronDown, ChevronUp, Loader2, CheckCircle2, XCircle, Clock, Heart, Edit, Maximize2, Download, X, Film, Play, User, Camera } from 'lucide-react';
import EditSceneModal from './EditSceneModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function SceneCard({ scene, index, onRegenerateImage, onApproveScene, onEditScene, onCostUpdate }) {
  // Check if this is a B-roll scene (no characters)
  const isBRoll = !scene.visual_prompt?.characters || scene.visual_prompt.characters.length === 0;
  const [showDetails, setShowDetails] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [videoStatus, setVideoStatus] = useState(scene.video_status || 'not_requested');

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

  const handleAnimate = async () => {
    console.log(`🎬 Starting animation for scene ${index + 1}`);
    setIsAnimating(true);
    setVideoStatus('pending');

    try {
      const response = await fetch(`${API_URL}/scenes/${scene.id}/animate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aspect_ratio: '16:9'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start animation');
      }

      const data = await response.json();
      console.log(`✅ Animation started for scene ${index + 1}`, data);
      setVideoStatus(data.video_status || 'pending');
      
      // Start polling for video status
      pollVideoStatus();
    } catch (error) {
      console.error(`❌ Failed to animate scene ${index + 1}:`, error);
      setVideoStatus('failed');
      setIsAnimating(false);
    }
  };

  const pollVideoStatus = async () => {
    const maxPolls = 120; // 10 minutes max (5s intervals)
    let pollCount = 0;

    const interval = setInterval(async () => {
      pollCount++;
      
      if (pollCount > maxPolls) {
        console.error(`⏱️ Video generation timed out for scene ${index + 1}`);
        clearInterval(interval);
        setVideoStatus('failed');
        setIsAnimating(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/scenes/${scene.id}/video-status`);
        
        if (!response.ok) {
          throw new Error('Failed to check video status');
        }

        const data = await response.json();
        console.log(`📊 Video status poll #${pollCount} for scene ${index + 1}:`, data.video_status);
        
        setVideoStatus(data.video_status);

        if (data.video_status === 'generated') {
          console.log(`✅ Video ready for scene ${index + 1}!`);
          clearInterval(interval);
          setIsAnimating(false);
          // Force re-render by updating the scene
          scene.video_url = data.video_url;
          scene.video_status = 'generated';
          
          // Update cost after video completes
          if (onCostUpdate) {
            console.log('💰 Updating cost after video completion...');
            onCostUpdate();
          }
        } else if (data.video_status === 'failed') {
          console.error(`❌ Video generation failed for scene ${index + 1}`);
          clearInterval(interval);
          setIsAnimating(false);
        }
      } catch (error) {
        console.error(`❌ Error polling video status for scene ${index + 1}:`, error);
        clearInterval(interval);
        setVideoStatus('failed');
        setIsAnimating(false);
      }
    }, 5000); // Poll every 5 seconds
  };

  // Update video status when scene changes
  React.useEffect(() => {
    if (scene.video_status) {
      setVideoStatus(scene.video_status);
    }
  }, [scene.video_status]);

  return (
    <>
      <Card id={`scene-${scene.id}`} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/95 backdrop-blur animate-in fade-in-50 slide-in-from-bottom-4" style={{ animationDelay: `${index * 100}ms` }}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Scene {index + 1}</span>
              {isBRoll ? (
                <Badge variant="secondary" className="bg-orange-500/90 text-white text-xs">
                  <Camera className="w-3 h-3 mr-1" />
                  B-Roll
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-blue-500/90 text-white text-xs">
                  <User className="w-3 h-3 mr-1" />
                  Character
                </Badge>
              )}
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

        {/* Image / Video */}
        <div className="relative w-full h-64 bg-gray-100 overflow-hidden group">
          {/* Show video if available */}
          {videoStatus === 'generated' && scene.video_url ? (
            <div className="relative w-full h-full">
              <video
                src={scene.video_url}
                controls
                loop
                className="w-full h-full object-cover"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="absolute top-2 left-2">
                <Badge className="bg-blue-500 text-white">
                  <Film className="w-3 h-3 mr-1" />
                  Video
                </Badge>
              </div>
            </div>
          ) : videoStatus === 'pending' || videoStatus === 'processing' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-purple-100">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
              <p className="text-sm text-blue-800 font-medium">Animating scene...</p>
              <p className="text-xs text-blue-600 mt-1">This may take 30s - 6min</p>
            </div>
          ) : scene.image_status === 'generated' && scene.image_url ? (
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

              {/* B-Roll Info (when no characters) */}
              {isBRoll && (
                <div className="space-y-2">
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Camera className="w-4 h-4 text-orange-600" />
                      <h4 className="font-semibold text-orange-900">B-Roll Scene</h4>
                    </div>
                    <p className="text-xs text-orange-700">
                      This scene focuses on environmental, atmospheric, or detail shots without the main character visible.
                    </p>
                  </div>
                  
                  {/* Setting/Focus */}
                  {scene.visual_prompt.setting && (
                    <div className="bg-background p-3 rounded space-y-1">
                      <h4 className="font-semibold text-primary text-sm">Visual Focus</h4>
                      <p className="text-xs text-muted-foreground">{scene.visual_prompt.setting}</p>
                    </div>
                  )}
                  
                  {/* Props */}
                  {scene.visual_prompt.props && scene.visual_prompt.props.length > 0 && (
                    <div className="bg-background p-3 rounded space-y-1">
                      <h4 className="font-semibold text-primary text-sm">Key Elements</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {scene.visual_prompt.props.map((prop, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {prop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
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
        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            className="flex-1"
            onClick={handleRegenerate}
            disabled={isRegenerating || scene.image_status === 'pending'}
            variant="outline"
          >
            {isRegenerating || scene.image_status === 'pending' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </>
            )}
          </Button>
          
          <Button
            className="flex-1"
            onClick={() => {
              if (videoStatus === 'generated' && scene.video_url) {
                // Video is ready, play it in the card area (it's already showing)
                const videoElement = document.querySelector(`#scene-${scene.id} video`);
                if (videoElement) {
                  videoElement.play();
                }
              } else {
                handleAnimate();
              }
            }}
            disabled={isAnimating || videoStatus === 'pending' || videoStatus === 'processing' || scene.image_status !== 'generated'}
          >
            {isAnimating || videoStatus === 'pending' || videoStatus === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Animating...
              </>
            ) : videoStatus === 'generated' ? (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play Video
              </>
            ) : (
              <>
                <Film className="w-4 h-4 mr-2" />
                Animate
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
