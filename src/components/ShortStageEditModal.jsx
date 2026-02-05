import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Lightbulb, Wand2, Loader2, ChevronDown, ChevronUp, Camera, Users, Film } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ShortStageEditModal({ stage, projectId, onClose, onSave, onRegenerate }) {
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [refining, setRefining] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load suggestions on mount
  useEffect(() => {
    fetchSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const response = await fetch(`${API_URL}/shorts/${projectId}/stage/${stage.stage_number}/edit-suggestions`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        console.log('💡 Edit suggestions loaded for stage:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleRefine = async () => {
    if (!editText.trim()) {
      alert('Please enter an instruction first');
      return;
    }

    setRefining(true);
    try {
      console.log('🪄 Refining instruction:', editText);
      const response = await fetch(`${API_URL}/shorts/${projectId}/stage/${stage.stage_number}/refine-instruction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: editText })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✨ Refined to:', data.refined);
        setEditText(data.refined);
      } else {
        throw new Error('Failed to refine instruction');
      }
    } catch (error) {
      console.error('❌ Error refining:', error);
      alert('Failed to refine instruction. Please try again.');
    } finally {
      setRefining(false);
    }
  };

  const handleRegenerate = () => {
    onRegenerate();
    onClose();
  };

  const handleSave = async () => {
    if (!editText.trim()) {
      alert('Please describe what you want to change');
      return;
    }

    setLoading(true);
    await onSave(editText);
    setLoading(false);
    onClose();
  };

  const applySuggestion = (example) => {
    setEditText(example);
  };

  const stageTypeLabel = stage.stage_type.replace(/_/g, ' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Edit Stage {stage.stage_number}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-6 space-y-4">
          {/* Stage Info */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Stage Type:</label>
            <div className="mt-1 p-3 bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-orange-600" />
                <span className="font-semibold capitalize">{stageTypeLabel}</span>
              </div>
              {stage.workers_present && (
                <Badge variant="secondary">
                  <Users className="w-3 h-3 mr-1" />
                  Workers Present
                </Badge>
              )}
            </div>
          </div>

          {/* Current Image Preview */}
          {stage.image_url && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Current Image:</label>
              <div className="aspect-[9/16] max-w-xs mx-auto rounded-lg overflow-hidden border-2 border-gray-200">
                <img
                  src={stage.image_url}
                  alt={`Stage ${stage.stage_number}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Edit Suggestions */}
          {suggestions && (
            <div className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full p-3 bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Need ideas? See what you can change</span>
                  <Badge variant="secondary" className="text-xs">
                    {suggestions.edit_categories?.length || 0} categories
                  </Badge>
                </div>
                {showSuggestions ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
              
              {showSuggestions && (
                <div className="p-4 space-y-4 bg-white max-h-80 overflow-y-auto">
                  {/* Current State */}
                  {suggestions.current_state && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">CURRENT STAGE:</h4>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {suggestions.current_state.lighting && (
                          <div><strong>Lighting:</strong> {suggestions.current_state.lighting}</div>
                        )}
                        {suggestions.current_state.atmosphere && (
                          <div><strong>Atmosphere:</strong> {suggestions.current_state.atmosphere}</div>
                        )}
                        {suggestions.current_state.elements && (
                          <div><strong>Elements:</strong> {suggestions.current_state.elements.join(', ')}</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Edit Categories */}
                  {suggestions.edit_categories?.map((category, idx) => (
                    <div key={idx} className="space-y-2">
                      <h4 className="text-sm font-semibold text-primary">{category.category}</h4>
                      <div className="space-y-2">
                        {category.suggestions.slice(0, 3).map((suggestion, suggIdx) => (
                          <div
                            key={suggIdx}
                            className="p-2 bg-blue-50 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                            onClick={() => applySuggestion(suggestion.example_instruction)}
                          >
                            <p className="text-xs font-medium text-blue-900">{suggestion.description}</p>
                            <p className="text-xs text-blue-700 mt-1 italic">
                              "{suggestion.example_instruction}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {loadingSuggestions && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading suggestions...
            </div>
          )}

          {/* Edit Instructions */}
          <div>
            <label className="text-sm font-medium block mb-2">
              What would you like to change?
            </label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="E.g., 'add more construction materials', 'make lighting brighter', 'add more workers', 'change to sunset lighting'"
              className="w-full min-h-[120px] p-3 border rounded-lg resize-vertical focus:ring-2 focus:ring-primary"
              disabled={loading || refining}
            />
            
            {/* Refine Button */}
            {editText.trim() && (
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefine}
                  disabled={refining || loading}
                  className="gap-2"
                >
                  {refining ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      Make More Specific
                    </>
                  )}
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  AI will improve vague instructions
                </span>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
              💡 Click suggestions above or type your own. Use "Make More Specific" to refine vague instructions.
            </p>
          </div>

          {/* Stage-Specific Tips */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              💡 Tips for {stageTypeLabel}:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              {stage.stage_type === 'empty_room' && (
                <>
                  <li>• Focus on bare structure, concrete, exposed walls</li>
                  <li>• Add construction debris, dust, raw materials</li>
                  <li>• Change time of day for different lighting</li>
                  <li>• NO workers should be visible in this stage</li>
                </>
              )}
              {stage.stage_type === 'prep_work' && (
                <>
                  <li>• Should have 2-3 workers in safety gear</li>
                  <li>• Workers should be grinding, measuring, marking surface</li>
                  <li>• Add prep equipment (grinders, vacuums, tape)</li>
                  <li>• Focused, organized atmosphere</li>
                </>
              )}
              {stage.stage_type === 'active_installation' && (
                <>
                  <li>• Should have 3-4 workers (most people) - HERO SHOT!</li>
                  <li>• Workers should be collaborating on main work</li>
                  <li>• Most dynamic and energetic scene</li>
                  <li>• Show main transformation moment (e.g., pouring epoxy)</li>
                </>
              )}
              {stage.stage_type === 'finishing_touches' && (
                <>
                  <li>• Should have 2-3 workers doing detail work</li>
                  <li>• Workers quality checking, smoothing, perfecting</li>
                  <li>• Show workers cleaning up equipment</li>
                  <li>• Calmer but focused atmosphere</li>
                </>
              )}
              {stage.stage_type === 'completed_empty' && (
                <>
                  <li>• Focus on finished product quality and details</li>
                  <li>• Adjust lighting to highlight the work</li>
                  <li>• Add reflections, textures, or material details</li>
                  <li>• Maybe 1 worker admiring or completely empty</li>
                </>
              )}
              {stage.stage_type === 'fully_furnished' && (
                <>
                  <li>• Add or remove furniture and decor</li>
                  <li>• Change style (modern, rustic, industrial, luxury)</li>
                  <li>• Adjust lighting for ambiance</li>
                  <li>• This is the final "after" reveal</li>
                </>
              )}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading || refining}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={loading || refining || !editText.trim()}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Apply Changes'
                )}
              </Button>
            </div>
            
            <div className="pt-2 border-t">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                className="w-full"
                disabled={loading || refining}
              >
                <Film className="w-4 h-4 mr-2 rotate-180" />
                Just Regenerate (Same Prompt)
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-1">
                Get a different variation without changing anything
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Each regeneration costs ~$0.01
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default ShortStageEditModal;
