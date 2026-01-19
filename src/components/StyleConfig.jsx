import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Palette, Lightbulb, Camera, User, Edit3, Maximize2 } from 'lucide-react';

function StyleConfig({ value, onChange }) {
  const [useCustomInputs, setUseCustomInputs] = useState({
    art_style: false,
    lighting: false,
    color_palette: false,
    background: false,
    camera_angle: false,
    framing: false,
    aspect_ratio: false
  });

  const handleChange = (field, newValue) => {
    onChange({ ...value, [field]: newValue });
  };

  const toggleCustomInput = (field) => {
    setUseCustomInputs(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Card className="bg-white/95 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl">Customize Your Style</CardTitle>
        </div>
        <CardDescription>
          Choose from presets or type your own custom values
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Art Style */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Art Style
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('art_style')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.art_style ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.art_style ? (
            <input
              type="text"
              value={value.art_style || ''}
              onChange={(e) => handleChange('art_style', e.target.value)}
              placeholder="e.g., photorealistic 3D render, hand-drawn sketch..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.art_style || 'realistic'}
              onChange={(e) => handleChange('art_style', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="realistic">Realistic</option>
              <option value="anime_style">Anime Style</option>
              <option value="cartoon">Cartoon</option>
              <option value="oil_painting">Oil Painting</option>
              <option value="minimalist">Minimalist</option>
              <option value="watercolor">Watercolor</option>
              <option value="3d_render">3D Render</option>
              <option value="sketch">Sketch</option>
            </select>
          )}
        </div>

        {/* Lighting */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Lighting
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('lighting')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.lighting ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.lighting ? (
            <input
              type="text"
              value={value.lighting || ''}
              onChange={(e) => handleChange('lighting', e.target.value)}
              placeholder="e.g., cinematic rim lighting, harsh shadows..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.lighting || 'natural_lighting'}
              onChange={(e) => handleChange('lighting', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="natural_lighting">Natural Light</option>
              <option value="dramatic_lighting">Dramatic</option>
              <option value="soft_even_studio_lighting">Studio Lighting</option>
              <option value="golden_hour">Golden Hour</option>
              <option value="neon">Neon</option>
              <option value="backlit">Backlit</option>
              <option value="moody">Moody</option>
            </select>
          )}
        </div>

        {/* Color Palette */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Color Palette</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('color_palette')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.color_palette ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.color_palette ? (
            <input
              type="text"
              value={value.color_palette || ''}
              onChange={(e) => handleChange('color_palette', e.target.value)}
              placeholder="e.g., neon purple and cyan, earthy browns and greens..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.color_palette || 'warm_neutral'}
              onChange={(e) => handleChange('color_palette', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="warm_neutral">Warm & Neutral</option>
              <option value="vibrant">Vibrant</option>
              <option value="muted">Muted & Soft</option>
              <option value="monochrome">Black & White</option>
              <option value="pastel">Pastel</option>
              <option value="bold">Bold & Saturated</option>
            </select>
          )}
        </div>

        {/* Background */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Background</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('background')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.background ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.background ? (
            <input
              type="text"
              value={value.background || ''}
              onChange={(e) => handleChange('background', e.target.value)}
              placeholder="e.g., cozy coffee shop, futuristic city skyline..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.background || 'clean_simple'}
              onChange={(e) => handleChange('background', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="clean_simple">Clean & Simple</option>
              <option value="blurred">Blurred</option>
              <option value="office">Office</option>
              <option value="outdoor">Outdoor</option>
              <option value="studio">Studio</option>
              <option value="modern_room">Modern Room</option>
              <option value="bookshelf">Bookshelf</option>
              <option value="cafe">Café</option>
            </select>
          )}
        </div>

        {/* Character Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Character Description (Optional)
          </label>
          <input
            type="text"
            value={value.character_description || ''}
            onChange={(e) => handleChange('character_description', e.target.value)}
            placeholder="e.g., tech YouTuber with glasses, hoodie, friendly smile"
            className="w-full p-2 border rounded-lg bg-white"
          />
          <p className="text-xs text-muted-foreground">
            Describe yourself or your on-screen character
          </p>
        </div>

        {/* Camera Angle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera Angle
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('camera_angle')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.camera_angle ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.camera_angle ? (
            <input
              type="text"
              value={value.camera_angle || ''}
              onChange={(e) => handleChange('camera_angle', e.target.value)}
              placeholder="e.g., low angle looking up, bird's eye view..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.camera_angle || 'medium_shot'}
              onChange={(e) => handleChange('camera_angle', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="medium_shot">Medium Shot</option>
              <option value="close_up">Close Up</option>
              <option value="wide_shot">Wide Shot</option>
              <option value="extreme_close_up">Extreme Close Up</option>
              <option value="over_shoulder">Over the Shoulder</option>
              <option value="birds_eye">Bird's Eye View</option>
            </select>
          )}
        </div>

        {/* Framing */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Framing</label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('framing')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.framing ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.framing ? (
            <input
              type="text"
              value={value.framing || ''}
              onChange={(e) => handleChange('framing', e.target.value)}
              placeholder="e.g., off-center with leading lines, symmetrical..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.framing || 'centered'}
              onChange={(e) => handleChange('framing', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="centered">Centered</option>
              <option value="rule_of_thirds">Rule of Thirds</option>
              <option value="dynamic">Dynamic</option>
              <option value="symmetrical">Symmetrical</option>
              <option value="asymmetrical">Asymmetrical</option>
            </select>
          )}
        </div>

        {/* Aspect Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Maximize2 className="w-4 h-4" />
              Aspect Ratio
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleCustomInput('aspect_ratio')}
              className="h-7 text-xs"
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {useCustomInputs.aspect_ratio ? 'Presets' : 'Custom'}
            </Button>
          </div>
          {useCustomInputs.aspect_ratio ? (
            <input
              type="text"
              value={value.aspect_ratio || ''}
              onChange={(e) => handleChange('aspect_ratio', e.target.value)}
              placeholder="e.g., 2.35:1, ultra-wide, portrait..."
              className="w-full p-2 border rounded-lg bg-white"
            />
          ) : (
            <select
              value={value.aspect_ratio || '16:9'}
              onChange={(e) => handleChange('aspect_ratio', e.target.value)}
              className="w-full p-2 border rounded-lg bg-white"
            >
              <option value="16:9">16:9 (YouTube Landscape)</option>
              <option value="9:16">9:16 (Shorts / TikTok / Reels)</option>
              <option value="1:1">1:1 (Instagram Square)</option>
              <option value="4:5">4:5 (Instagram Portrait)</option>
              <option value="4:3">4:3 (Classic TV)</option>
              <option value="21:9">21:9 (Cinematic Widescreen)</option>
            </select>
          )}
          <p className="text-xs text-muted-foreground">
            Choose the format for your platform
          </p>
        </div>

        {/* Helpful Tip */}
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Pro Tip:</p>
          <p className="text-xs">
            Click "Custom" on any field to type your own creative descriptions. 
            The AI will interpret your text and create visuals based on it!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default StyleConfig;
