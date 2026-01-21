import React from 'react';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';
import { FileText, Clock, Sparkles, Palette, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

function StatusBar({ status, progress }) {
  const getStatusInfo = () => {
    switch (status) {
      case 'extracting':
        return {
          icon: FileText,
          text: 'Extracting text from document...',
          color: 'text-blue-500'
        };
      case 'creating':
        return {
          icon: Clock,
          text: 'Creating job...',
          color: 'text-blue-500'
        };
      case 'pending':
        return {
          icon: Clock,
          text: 'Job created, waiting to start...',
          color: 'text-yellow-500'
        };
      case 'analyzing_script':
        return {
          icon: Sparkles,
          text: '🎬 Director analyzing your script...',
          color: 'text-purple-500'
        };
      case 'awaiting_approval':
        return {
          icon: Clock,
          text: '✋ Awaiting your approval...',
          color: 'text-yellow-500'
        };
      case 'generating_visuals':
        return {
          icon: Sparkles,
          text: '🎥 Cinematographer creating visual prompts...',
          color: 'text-purple-500'
        };
      case 'generating_prompts':
        return {
          icon: Sparkles,
          text: 'AI is generating visual prompts...',
          color: 'text-purple-500'
        };
      case 'generating_images':
        return {
          icon: Palette,
          text: '🖼️ AI is generating images for your scenes...',
          color: 'text-pink-500'
        };
      case 'completed':
        return {
          icon: CheckCircle2,
          text: 'Complete! ✨',
          color: 'text-green-500'
        };
      case 'failed':
        return {
          icon: XCircle,
          text: 'Job failed ❌',
          color: 'text-red-500'
        };
      default:
        return {
          icon: Loader2,
          text: 'Processing...',
          color: 'text-gray-500'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div className="flex justify-center my-12">
      <Card className="w-full max-w-2xl bg-white/95 backdrop-blur">
        <CardContent className="p-8 space-y-6">
          {/* Status Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
              <Icon className={`w-12 h-12 ${statusInfo.color} relative animate-pulse`} />
            </div>
            <h3 className="text-xl font-semibold flex-1">{statusInfo.text}</h3>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                This may take 30-60 seconds depending on script length
              </p>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
          </div>

          {/* Loading Animation */}
          <div className="flex justify-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StatusBar;
