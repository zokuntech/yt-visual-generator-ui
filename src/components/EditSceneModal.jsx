import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { X, Lightbulb, Wand2, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function EditSceneModal({ scene, onClose, onSave }) {
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
      const response = await fetch(`${API_URL}/scenes/${scene.id}/edit-suggestions`);
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        console.log('💡 Edit suggestions loaded:', data);
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
      const response = await fetch(`${API_URL}/scenes/${scene.id}/refine-instruction`, {
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

  const handleSave = async () => {
    if (!editText.trim()) {
      alert('Please describe what you want to change');
      return;
    }

    setLoading(true);
    
    // Call parent with the edit text
    // The parent will handle the API call to update the scene
    await onSave({
      editInstructions: editText,
      sceneId: scene.id
    });
    
    setLoading(false);
  };

  const applySuggestion = (example) => {
    setEditText(example);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in duration-200">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
        <CardHeader className="border-b">
          <div className="flex justify-between items-center">
            <CardTitle>Edit Scene {scene.index + 1}</CardTitle>
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
          {/* Original Sentence */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Original Text:</label>
            <p className="mt-1 p-3 bg-gray-50 rounded-lg text-sm italic">
              "{scene.sentence_text}"
            </p>
          </div>

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
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2">CURRENT SCENE:</h4>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {suggestions.current_state.character && (
                          <div>
                            <strong>Character:</strong>{' '}
                            {typeof suggestions.current_state.character.expression === 'string' 
                              ? suggestions.current_state.character.expression 
                              : suggestions.current_state.character.expression?.primary || 'N/A'}
                            {' • '}
                            {typeof suggestions.current_state.character.pose === 'string'
                              ? suggestions.current_state.character.pose
                              : suggestions.current_state.character.pose?.body_language || 'N/A'}
                          </div>
                        )}
                        {suggestions.current_state.setting && (
                          <div>
                            <strong>Setting:</strong> {suggestions.current_state.setting.location} • {suggestions.current_state.setting.lighting}
                          </div>
                        )}
                        {suggestions.current_state.camera && (
                          <div>
                            <strong>Camera:</strong> {suggestions.current_state.camera.shot} • {suggestions.current_state.camera.angle}
                          </div>
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
              placeholder="E.g., 'make character smile warmly' or 'add laptop on desk' or 'change to coffee shop' or 'zoom in on face'"
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

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t">
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

          <p className="text-xs text-muted-foreground text-center">
            This will update the scene and regenerate the image (~$0.002)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditSceneModal;
