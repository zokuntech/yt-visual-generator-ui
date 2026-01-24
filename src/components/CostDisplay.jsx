import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { DollarSign, Sparkles, Image, TrendingUp, Film } from 'lucide-react';

function CostDisplay({ cost, completionTime, isLive }) {
  if (!cost) return null;

  const totalCost = cost.total_cost || 0;
  const promptCost = cost.prompt_generation_cost || 0;
  const imageCost = cost.image_generation_cost || 0;
  const videoCost = cost.video_generation_cost || 0;

  const formatDuration = (ms) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className="bg-white/95 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <CardTitle className="text-xl">
              Job Summary
              {isLive && (
                <span className="ml-2 text-xs font-normal text-green-600 animate-pulse">
                  ● Live
                </span>
              )}
            </CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ${totalCost.toFixed(4)}
            </div>
            {completionTime && (
              <div className="text-sm text-muted-foreground mt-1">
                ⏱️ {formatDuration(completionTime)}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Prompt Generation */}
          <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
            <Sparkles className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">AI Prompts</p>
              <p className="text-lg font-semibold">${promptCost.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">
                {cost.num_prompts_generated || 0} prompts • {cost.prompt_tokens_used?.toLocaleString() || 0} tokens
              </p>
            </div>
          </div>

          {/* Image Generation */}
          <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg">
            <Image className="w-8 h-8 text-pink-600" />
            <div>
              <p className="text-sm text-muted-foreground">AI Images</p>
              <p className="text-lg font-semibold">${imageCost.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">
                {cost.num_images_generated || 0} images • {cost.image_tokens_used?.toLocaleString() || 0} tokens
              </p>
            </div>
          </div>

          {/* Video Generation */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <Film className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">AI Videos</p>
              <p className="text-lg font-semibold">${videoCost.toFixed(4)}</p>
              <p className="text-xs text-muted-foreground">
                {cost.num_videos_generated || 0} videos • 8s each
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Per Scene Cost */}
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Per Scene</span>
            </div>
            <span className="text-lg font-semibold text-blue-600">
              ${cost.num_prompts_generated > 0 
                ? (totalCost / cost.num_prompts_generated).toFixed(5)
                : '0.00000'}
            </span>
          </div>

          {/* Time per Scene */}
          {completionTime && cost.num_prompts_generated > 0 && (
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-purple-600">⏱️</span>
                <span className="text-sm font-medium">Per Scene</span>
              </div>
              <span className="text-lg font-semibold text-purple-600">
                {formatDuration(completionTime / cost.num_prompts_generated)}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold mb-1">💡 Cost Breakdown:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Prompt generation uses OpenAI GPT-4</li>
            <li>Image generation uses Google Gemini</li>
            <li>Typical 60-second video: ~$0.005</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default CostDisplay;
