import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { X } from 'lucide-react';

function EditSceneModal({ scene, onClose, onSave }) {
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);

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

          {/* Edit Instructions */}
          <div>
            <label className="text-sm font-medium block mb-2">
              What would you like to change?
            </label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="E.g., 'make character smile warmly' or 'add laptop on desk' or 'change to coffee shop' or 'zoom in on face'"
              className="w-full min-h-[120px] p-3 border rounded-lg resize-vertical"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              💡 Examples: "make it darker and moodier" • "add coffee cup in hand" • "change setting to park" • "zoom out to show full body"
            </p>
          </div>

          {/* Current Visual Prompt Summary */}
          {scene.visual_prompt && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Current Settings:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                {scene.visual_prompt.style?.art_style && (
                  <div><strong>Style:</strong> {scene.visual_prompt.style.art_style}</div>
                )}
                {scene.visual_prompt.style?.lighting && (
                  <div><strong>Lighting:</strong> {scene.visual_prompt.style.lighting}</div>
                )}
                {scene.visual_prompt.composition?.camera_angle && (
                  <div><strong>Camera:</strong> {scene.visual_prompt.composition.camera_angle}</div>
                )}
                {scene.visual_prompt.composition?.framing && (
                  <div><strong>Framing:</strong> {scene.visual_prompt.composition.framing}</div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading || !editText.trim()}
            >
              {loading ? 'Saving...' : 'Save & Regenerate'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            This will update the prompt and regenerate the image
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default EditSceneModal;
