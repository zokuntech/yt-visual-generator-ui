import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, Film, Heart, Zap, Camera, Package, MapPin, CheckCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function DirectorReview({ jobId, onApprove }) {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🎬 DirectorReview mounted for job:', jobId);
    pollUntilReady();
  }, [jobId]);

  const pollUntilReady = async () => {
    console.log('🔄 Polling for director completion...');
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes max
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`📊 Director poll #${pollCount} for job: ${jobId}`);
        
        const response = await fetch(`${API_URL}/jobs/${jobId}`);
        if (!response.ok) throw new Error('Failed to fetch job');
        
        const job = await response.json();
        console.log('📦 Job status:', job.status);

        if (job.status === 'awaiting_approval') {
          console.log('✅ Director complete! Status is awaiting_approval');
          console.log('🛑 Clearing director polling interval');
          clearInterval(interval);
          await loadScenePlans();
        } else if (job.status === 'completed') {
          // If somehow the job completed without going through wizard mode
          console.log('⚠️ Job completed without wizard mode (no awaiting_approval status)');
          console.log('🛑 Clearing director polling interval');
          clearInterval(interval);
          setError('Job completed without director review. Try disabling wizard mode.');
          setLoading(false);
        } else if (job.status === 'failed') {
          console.log('❌ Job failed during director analysis');
          clearInterval(interval);
          setError(job.error_message || 'Job failed');
          setLoading(false);
        }
        
        if (pollCount > maxPolls) {
          console.error('⏱️ Director polling timeout after 5 minutes');
          clearInterval(interval);
          setError('Director analysis timed out after 5 minutes');
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error polling director:', err);
        clearInterval(interval);
        setError(err.message);
        setLoading(false);
      }
    }, 2000);
  };

  const loadScenePlans = async () => {
    try {
      console.log('📥 Fetching director plans...');
      const response = await fetch(`${API_URL}/jobs/${jobId}/director-plans`);
      
      if (!response.ok) {
        throw new Error('Failed to load director plans');
      }

      const data = await response.json();
      console.log('✅ Director plans loaded:', data);
      setScenes(data.scenes || []);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading scene plans:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    console.log('✅ User approving scene plans...');
    setApproving(true);
    
    try {
      const response = await fetch(`${API_URL}/jobs/${jobId}/approve`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to approve');
      }

      console.log('✅ Scene plans approved!');
      onApprove();
    } catch (err) {
      console.error('❌ Error approving:', err);
      setError(err.message);
      setApproving(false);
    }
  };

  if (error) {
    return (
      <Card className="bg-white/95 backdrop-blur">
        <CardContent className="p-8 text-center">
          <p className="text-destructive text-lg mb-4">❌ {error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-white/95 backdrop-blur">
        <CardContent className="p-12 text-center space-y-4">
          <Film className="w-16 h-16 text-primary mx-auto animate-pulse" />
          <h2 className="text-2xl font-bold">🎬 Director Analyzing Your Script</h2>
          <p className="text-muted-foreground">
            Our AI Director is analyzing the narrative, emotions, and creating visual plans for each scene...
          </p>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <Card className="bg-white/95 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl mb-2">
                Review Director's Scene Plans
              </CardTitle>
              <p className="text-muted-foreground">
                The AI Director has analyzed your script and created a plan for each scene.
                Review the plans below and approve to continue.
              </p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </CardHeader>
      </Card>

      {/* Scene Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {scenes.map((scene) => (
          <ScenePlanCard key={scene.id} scene={scene} />
        ))}
      </div>

      {/* Approve Button */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-6 text-center">
          <p className="text-lg mb-4 font-medium">
            Ready to generate visuals from these plans?
          </p>
          <Button
            size="lg"
            onClick={handleApprove}
            disabled={approving}
            className="px-8"
          >
            {approving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Approve & Generate Visuals
              </>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-3">
            This will create detailed visual prompts and generate images for all {scenes.length} scenes
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function ScenePlanCard({ scene }) {
  const plan = scene.scene_plan;
  
  const emotionColors = {
    joyful: 'bg-yellow-100 text-yellow-800',
    sad: 'bg-blue-100 text-blue-800',
    angry: 'bg-red-100 text-red-800',
    fearful: 'bg-purple-100 text-purple-800',
    calm: 'bg-green-100 text-green-800',
    detached: 'bg-gray-100 text-gray-800',
    hopeful: 'bg-teal-100 text-teal-800',
    frustrated: 'bg-orange-100 text-orange-800'
  };

  const energyColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800'
  };

  return (
    <Card className="bg-white/95 backdrop-blur hover:shadow-lg transition-shadow">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 pb-4">
        <div className="flex justify-between items-start">
          <Badge variant="outline" className="bg-white">
            Scene {scene.index + 1}
          </Badge>
        </div>
        <p className="text-sm italic text-muted-foreground mt-2 pl-3 border-l-2 border-primary">
          "{scene.sentence}"
        </p>
      </CardHeader>
      
      <CardContent className="pt-4 space-y-3">
        {/* Narrative Role */}
        <DetailRow
          icon={<Film className="w-4 h-4" />}
          label="Narrative"
          value={plan.narrative_role?.replace(/_/g, ' ')}
          badgeClass="bg-purple-100 text-purple-800"
        />

        {/* Emotional Tone */}
        <DetailRow
          icon={<Heart className="w-4 h-4" />}
          label="Emotion"
          value={plan.emotional_tone}
          badgeClass={emotionColors[plan.emotional_tone] || 'bg-gray-100 text-gray-800'}
        />

        {/* Energy Level */}
        <DetailRow
          icon={<Zap className="w-4 h-4" />}
          label="Energy"
          value={plan.energy_level}
          badgeClass={energyColors[plan.energy_level] || 'bg-gray-100 text-gray-800'}
        />

        {/* Camera Intent */}
        {plan.camera_intent && (
          <DetailRow
            icon={<Camera className="w-4 h-4" />}
            label="Camera"
            value={`${plan.camera_intent.shot?.replace(/_/g, ' ')} • ${plan.camera_intent.framing}`}
          />
        )}

        {/* Props */}
        {plan.props && plan.props.length > 0 && (
          <div className="flex gap-2 items-start">
            <Package className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-sm font-medium text-muted-foreground">Props:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {plan.props.map((prop, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {prop.type}
                    {prop.symbolism && (
                      <span className="text-muted-foreground ml-1">
                        ({prop.symbolism})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Setting */}
        {plan.setting && (
          <DetailRow
            icon={<MapPin className="w-4 h-4" />}
            label="Setting"
            value={plan.setting.environment?.replace(/_/g, ' ')}
          />
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({ icon, label, value, badgeClass }) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-muted-foreground flex-shrink-0">{icon}</span>
      <span className="text-sm font-medium text-muted-foreground min-w-[80px]">
        {label}:
      </span>
      {badgeClass ? (
        <Badge className={`${badgeClass} capitalize`}>{value}</Badge>
      ) : (
        <span className="text-sm capitalize">{value}</span>
      )}
    </div>
  );
}

export default DirectorReview;
