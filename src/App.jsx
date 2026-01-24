import React, { useState } from 'react';
import mammoth from 'mammoth';
import FileUpload from './components/FileUpload';
import StatusBar from './components/StatusBar';
import SceneGrid from './components/SceneGrid';
import StyleConfig from './components/StyleConfig';
import CostDisplay from './components/CostDisplay';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Film, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [scenes, setScenes] = useState([]);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const [error, setError] = useState(null);
  const [showStyleConfig, setShowStyleConfig] = useState(false);
  const [completionTime, setCompletionTime] = useState(null);
  const [approvedScenes, setApprovedScenes] = useState(new Set());
  const [clientStartTime, setClientStartTime] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [styleConfig, setStyleConfig] = useState({
    art_style: 'realistic',
    lighting: 'natural_lighting',
    color_palette: 'warm_neutral',
    background: 'clean_simple',
    character_description: '',
    camera_angle: 'medium_shot',
    framing: 'centered',
    aspect_ratio: '16:9',
    preferred_settings: []  // New: custom location selection
  });

  // Log app initialization
  React.useEffect(() => {
    console.log('🚀 ===== YT VISUAL GENERATOR UI INITIALIZED =====');
    console.log('🌐 API URL:', API_URL);
    console.log('📝 Environment:', import.meta.env.MODE);
    console.log('✅ Ready to upload scripts!');
    console.log('================================================');
  }, []);

  const handleFileUpload = async (file) => {
    console.log('🎬 ===== FILE UPLOAD STARTED =====');
    console.log('📄 File name:', file.name);
    console.log('📦 File size:', (file.size / 1024).toFixed(2), 'KB');
    console.log('📝 File type:', file.type);
    
    try {
      setError(null);
      setStatus('extracting');
      setProgress(10);
      console.log('⏳ Status: Extracting text from document...');

      // Extract text from .docx file
      const arrayBuffer = await file.arrayBuffer();
      console.log('✅ File read into memory');
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();
      
      console.log('📝 Extracted text length:', text.length, 'characters');
      console.log('📝 First 200 characters:', text.substring(0, 200) + '...');

      if (!text) {
        throw new Error('No text found in document');
      }

      setProgress(20);
      
      // Continue with job creation
      await createJobWithText(text);
    } catch (err) {
      console.error('❌ ===== ERROR IN FILE UPLOAD =====');
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      console.error('Stack trace:', err.stack);
      setError(err.message);
      setStatus('error');
      setProgress(0);
    }
  };

  const handleTextSubmit = async (text) => {
    console.log('📝 ===== TEXT INPUT STARTED =====');
    console.log('📝 Text length:', text.length, 'characters');
    console.log('📝 First 200 characters:', text.substring(0, 200) + '...');
    
    try {
      setError(null);
      setProgress(10);
      
      // No extraction needed, text is already provided
      await createJobWithText(text);
    } catch (err) {
      console.error('❌ ===== ERROR IN TEXT SUBMISSION =====');
      console.error('Error message:', err.message);
      console.error('Full error:', err);
      setError(err.message);
      setStatus('error');
      setProgress(0);
    }
  };

  const createJobWithText = async (text) => {
    // Create job
    setStatus('creating');
    console.log('🚀 Creating job on backend...');
    console.log('🌐 API URL:', API_URL);
    
    const requestBody = {
      script_text: text,
      wizard_mode: false,  // ← Disable wizard, go straight through
      generate_images: true,
      style_config: styleConfig
    };
    console.log('📤 Request body:', {
      script_text: text.substring(0, 100) + '...',
      wizard_mode: requestBody.wizard_mode,
      generate_images: requestBody.generate_images,
      style_config: requestBody.style_config
    });

    const jobResponse = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 Response status:', jobResponse.status, jobResponse.statusText);

    if (!jobResponse.ok) {
      const errorData = await jobResponse.json();
      console.error('❌ Job creation failed:', errorData);
      throw new Error(errorData.detail || 'Failed to create job');
    }

    const job = await jobResponse.json();
    console.log('✅ Job created successfully!');
    console.log('🆔 Job ID:', job.id);
    console.log('📊 Job status:', job.status);
    console.log('⏱️ Job created at (backend):', job.created_at || 'not provided');
    console.log('🎨 Style config:', job.options?.style_config);
    console.log('🔧 Job details:', job);
    
    // Start client-side timer as fallback
    const startTime = Date.now();
    setClientStartTime(startTime);
    console.log('⏱️ Client timer started:', new Date(startTime).toLocaleTimeString());
    
    setCurrentJobId(job.id);
    setCurrentJob(job);
    setProgress(30);
    setIsProcessing(true);

    // Start polling
    console.log('🔄 Starting polling for job status...');
    pollJob(job.id);
    pollCost(job.id);
  };

  const pollJob = async (jobId) => {
    let pollCount = 0;
    const maxPolls = 300; // 10 minutes max
    console.log('🔄 ===== POLLING STARTED =====');
    console.log('📋 Job ID:', jobId);

    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`📊 Poll #${pollCount} - Checking job status...`);
        
        if (pollCount > maxPolls) {
          console.error('⏱️ TIMEOUT: Job timed out after 10 minutes');
          clearInterval(interval);
          setError('Job timed out after 10 minutes');
          setStatus('error');
          return;
        }

        const response = await fetch(`${API_URL}/jobs/${jobId}`);
        console.log('📥 Poll response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch job status: ${response.status}`);
        }

        const job = await response.json();
        console.log('📦 Job status:', job.status);
        console.log('💰 Cost so far:', job.cost?.total_cost || 0);
        
        setCurrentJob(job);
        setStatus(job.status);

        // Update progress based on status
        if (job.status === 'analyzing_script') {
          console.log('🎬 Director analyzing script...');
          setProgress(30);
        } else if (job.status === 'generating_visuals') {
          console.log('🎥 Creating visual prompts...');
          setProgress(50);
        } else if (job.status === 'generating_prompts') {
          console.log('🤖 AI is generating visual prompts...');
          setProgress(50);
        } else if (job.status === 'generating_images') {
          console.log('🎨 AI is generating images...');
          setProgress(70);
        }

        if (job.status === 'completed') {
          console.log('✅ ===== JOB COMPLETED! =====');
          console.log('🛑 Stopping polling interval');
          clearInterval(interval);
          setIsProcessing(false);
          
          // Calculate completion time (prioritize backend duration_seconds)
          console.log('🔍 Checking job timing data...');
          console.log('📦 Full job object:', JSON.stringify(job, null, 2));
          
          let duration = null;
          
          // Priority 1: Use duration_seconds from backend (most accurate)
          if (job.duration_seconds != null) {
            duration = job.duration_seconds * 1000; // Convert to milliseconds
            setCompletionTime(duration);
            console.log('⏱️ ✅ Using backend duration_seconds:', job.duration_seconds, 'seconds');
            console.log('⏱️ Formatted:', formatDuration(duration));
          }
          // Priority 2: Calculate from started_at/completed_at timestamps
          else if (job.started_at && job.completed_at) {
            const startTime = new Date(job.started_at).getTime();
            const endTime = new Date(job.completed_at).getTime();
            duration = endTime - startTime;
            setCompletionTime(duration);
            console.log('⏱️ Job started:', job.started_at);
            console.log('⏱️ Job completed:', job.completed_at);
            console.log('⏱️ Calculated duration:', formatDuration(duration));
          }
          // Priority 3: Calculate from created_at/completed_at timestamps
          else if (job.created_at && job.completed_at) {
            const startTime = new Date(job.created_at).getTime();
            const endTime = new Date(job.completed_at).getTime();
            duration = endTime - startTime;
            setCompletionTime(duration);
            console.log('⏱️ Job created:', job.created_at);
            console.log('⏱️ Job completed:', job.completed_at);
            console.log('⏱️ Calculated duration:', formatDuration(duration));
          }
          // Priority 4: Check for processing_time_ms
          else if (job.processing_time_ms) {
            duration = job.processing_time_ms;
            setCompletionTime(duration);
            console.log('⏱️ Used processing_time_ms:', formatDuration(duration));
          }
          // Priority 5: Fallback to client-side timer (least accurate)
          else if (clientStartTime) {
            const clientEndTime = Date.now();
            duration = clientEndTime - clientStartTime;
            setCompletionTime(duration);
            console.log('⏱️ ⚠️ Using client-side timer (fallback):', formatDuration(duration));
            console.log('💡 Note: This is approximate. Backend should send duration_seconds');
          }
          // No timing data available
          else {
            console.warn('⚠️ No timing data available from backend');
            console.log('⚠️ Available job fields:', Object.keys(job));
            console.log('💡 Backend should send: duration_seconds, started_at, or completed_at');
          }
          
          console.log('📥 Fetching scenes from /scenes/job/' + jobId);
          setProgress(90);
          
          await loadScenes(jobId);
          
          setProgress(100);
          setStatus('completed');
          console.log('🎉 ===== PROCESS COMPLETE =====');
        }

        if (job.status === 'failed') {
          console.error('❌ JOB FAILED!');
          console.error('Error message:', job.error_message);
          clearInterval(interval);
          setError(job.error_message || 'Job failed');
          setStatus('error');
          setProgress(0);
        }
      } catch (err) {
        console.error('❌ POLLING ERROR:', err);
        console.error('Details:', err.message);
        clearInterval(interval);
        setError(err.message);
        setStatus('error');
      }
    }, 2000); // Poll every 2 seconds
  };

  const pollCost = async (jobId) => {
    console.log('💰 ===== COST POLLING STARTED =====');
    console.log('📋 Job ID:', jobId);

    const interval = setInterval(async () => {
      try {
        // Only poll if still processing
        if (!isProcessing) {
          console.log('💰 Cost polling stopped - job complete');
          clearInterval(interval);
          return;
        }

        const response = await fetch(`${API_URL}/jobs/${jobId}/cost`);
        
        if (!response.ok) {
          console.warn('⚠️ Failed to fetch cost, continuing...');
          return;
        }

        const costData = await response.json();
        console.log('💰 Cost update:', costData.total_cost.toFixed(4));
        
        // Update job with new cost
        setCurrentJob(prevJob => ({
          ...prevJob,
          cost: costData
        }));
      } catch (err) {
        console.warn('⚠️ Cost polling error:', err.message);
        // Don't stop polling on error, just log it
      }
    }, 3000); // Poll every 3 seconds (less frequent than status)

    // Store interval for cleanup
    return interval;
  };

  const loadScenes = async (jobId) => {
    console.log('🎬 ===== LOADING SCENES =====');
    console.log('📥 Fetching from:', `${API_URL}/scenes/job/${jobId}`);
    
    try {
      const response = await fetch(`${API_URL}/scenes/job/${jobId}`);
      console.log('📥 Scenes response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Failed to fetch scenes:', errorText);
        throw new Error(`Failed to fetch scenes: ${response.status}`);
      }

      const scenesData = await response.json();
      console.log('✅ SCENES LOADED SUCCESSFULLY!');
      console.log('📊 Number of scenes:', scenesData.length);
      console.log('🎬 Scene data preview:', scenesData.slice(0, 2));
      
      // Log each scene's image status
      scenesData.forEach((scene, idx) => {
        console.log(`Scene ${idx + 1}:`, {
          id: scene.id.substring(0, 8),
          status: scene.image_status,
          hasImage: !!scene.image_url,
          imageLength: scene.image_url?.length || 0
        });
      });
      
      setScenes(scenesData);
      console.log('✅ Scenes set in React state');
    } catch (err) {
      console.error('❌ ERROR LOADING SCENES:', err);
      console.error('Error details:', err.message);
      setError(err.message);
    }
  };

  const regenerateImage = async (sceneId) => {
    console.log('🔄 Regenerating image for scene:', sceneId);
    try {
      setError(null);
      
      // Update scene status to show it's regenerating
      setScenes(prevScenes => 
        prevScenes.map(scene => 
          scene.id === sceneId 
            ? { ...scene, image_status: 'pending' } 
            : scene
        )
      );

      const response = await fetch(`${API_URL}/scenes/${sceneId}/regenerate-image`, {
        method: 'POST'
      });

      console.log('📥 Regenerate response status:', response.status);

      if (!response.ok) {
        throw new Error('Failed to regenerate image');
      }

      console.log('✅ Regeneration request sent, starting poll...');
      // Poll for updated scene
      pollSceneUpdate(sceneId);
    } catch (err) {
      console.error('❌ Error regenerating image:', err);
      setError(err.message);
    }
  };

  const pollSceneUpdate = async (sceneId) => {
    console.log('🔄 Polling scene update for:', sceneId);
    let pollCount = 0;
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`📊 Scene poll #${pollCount} - Checking scene:`, sceneId);
        
        const response = await fetch(`${API_URL}/scenes/${sceneId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch scene');
        }

        const scene = await response.json();
        console.log('📦 Scene status:', scene.image_status);

        // Update the specific scene in state
        setScenes(prevScenes => 
          prevScenes.map(s => s.id === sceneId ? scene : s)
        );

        if (scene.image_status === 'generated' || scene.image_status === 'failed') {
          console.log('✅ Scene regeneration complete:', scene.image_status);
          clearInterval(interval);
          
          // Refresh cost after operation completes
          if (scene.image_status === 'generated') {
            refreshCost();
          }
        }
      } catch (err) {
        console.error('❌ Error polling scene:', err);
        clearInterval(interval);
      }
    }, 2000);
  };

  const refreshCost = async () => {
    if (!currentJobId) return;
    
    try {
      console.log('💰 Refreshing cost for job:', currentJobId);
      const response = await fetch(`${API_URL}/jobs/${currentJobId}/cost`);
      
      if (!response.ok) {
        console.warn('⚠️ Failed to refresh cost');
        return;
      }

      const costData = await response.json();
      console.log('💰 Cost refreshed:', costData.total_cost.toFixed(4));
      
      // Update job with new cost
      setCurrentJob(prevJob => ({
        ...prevJob,
        cost: costData
      }));
    } catch (err) {
      console.warn('⚠️ Error refreshing cost:', err.message);
    }
  };

  const handleReset = () => {
    console.log('🔄 Resetting app state...');
    setScenes([]);
    setStatus('idle');
    setProgress(0);
    setCurrentJobId(null);
    setCurrentJob(null);
    setError(null);
    setCompletionTime(null);
    setApprovedScenes(new Set());
    setClientStartTime(null);
    setIsProcessing(false);
    console.log('✅ App reset complete');
  };

  const handleApproveScene = (sceneId, isApproved) => {
    console.log(`${isApproved ? '❤️' : '💔'} Scene ${sceneId} ${isApproved ? 'approved' : 'unapproved'}`);
    setApprovedScenes(prev => {
      const newSet = new Set(prev);
      if (isApproved) {
        newSet.add(sceneId);
      } else {
        newSet.delete(sceneId);
      }
      return newSet;
    });
  };

  const handleEditScene = async (sceneId, editData) => {
    console.log('✏️ Editing scene:', sceneId);
    console.log('📝 Edit instructions:', editData.editInstructions);
    
    try {
      // Update scene status to pending
      setScenes(prevScenes => 
        prevScenes.map(scene => 
          scene.id === sceneId 
            ? { ...scene, image_status: 'pending' } 
            : scene
        )
      );

      // Call the new instruction-based endpoint
      const response = await fetch(`${API_URL}/scenes/${sceneId}/regenerate-with-instruction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruction: editData.editInstructions
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to regenerate with edits');
      }

      console.log('✅ Scene edit submitted with instruction, regenerating...');
      console.log('🔄 Instruction:', editData.editInstructions);
      pollSceneUpdate(sceneId);
      
    } catch (err) {
      console.error('❌ Error editing scene:', err);
      setError(err.message);
    }
  };

  // Helper function to format duration
  const formatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${seconds}s`;
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <Card className="mb-8 bg-white/95 backdrop-blur">
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Film className="w-12 h-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                YouTube Visual Generator
              </h1>
            </div>
            <p className="text-lg text-muted-foreground">
              Transform your script into stunning AI-generated visuals
            </p>
          </div>
        </Card>

        {/* Error Banner */}
        {error && (
          <Card className="mb-6 border-destructive bg-destructive/10">
            <div className="p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
              <span className="flex-1 text-sm text-destructive">{error}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setError(null)}
                className="h-6 w-6"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Main Content */}
        {status === 'idle' && (
          <>
            <FileUpload onFileUpload={handleFileUpload} onTextSubmit={handleTextSubmit} />
            
            {/* Style Configuration (Optional) */}
            <div className="mt-6">
              <Button
                variant="outline"
                onClick={() => setShowStyleConfig(!showStyleConfig)}
                className="w-full"
              >
                {showStyleConfig ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Style Options
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Customize Visual Style (Optional)
                  </>
                )}
              </Button>
              
              {showStyleConfig && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <StyleConfig 
                    value={styleConfig}
                    onChange={setStyleConfig}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {status !== 'idle' && status !== 'completed' && (
          <StatusBar status={status} progress={progress} />
        )}

        {scenes.length > 0 && (
          <>
            <Card className="mb-6 bg-white/95 backdrop-blur">
              <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-primary">
                    Your Storyboard ({scenes.length} scenes)
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    {completionTime && (
                      <span>⏱️ Generated in {formatDuration(completionTime)}</span>
                    )}
                    {approvedScenes.size > 0 && (
                      <span>❤️ {approvedScenes.size} approved</span>
                    )}
                  </div>
                </div>
                <Button onClick={handleReset} variant="outline">
                  Upload New Script
                </Button>
              </div>
            </Card>
            
            {/* Cost Display */}
            {currentJob?.cost && (
              <div className="mb-6">
                <CostDisplay 
                  cost={currentJob.cost} 
                  completionTime={completionTime} 
                  isLive={isProcessing}
                />
              </div>
            )}
            
            <SceneGrid 
              scenes={scenes} 
              onRegenerateImage={regenerateImage}
              onApproveScene={handleApproveScene}
              onEditScene={handleEditScene}
              onCostUpdate={refreshCost}
              approvedScenes={approvedScenes}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
