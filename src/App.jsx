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
  const [styleConfig, setStyleConfig] = useState({
    art_style: 'realistic',
    lighting: 'natural_lighting',
    color_palette: 'warm_neutral',
    background: 'clean_simple',
    character_description: '',
    camera_angle: 'medium_shot',
    framing: 'centered',
    aspect_ratio: '16:9'
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
      
      // Create job
      setStatus('creating');
      console.log('🚀 Creating job on backend...');
      console.log('🌐 API URL:', API_URL);
      
      const requestBody = {
        script_text: text,
        generate_images: true,
        style_config: styleConfig
      };
      console.log('📤 Request body:', {
        script_text: text.substring(0, 100) + '...',
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
      console.log('🎨 Style config:', job.options?.style_config);
      console.log('🔧 Job details:', job);
      
      setCurrentJobId(job.id);
      setCurrentJob(job);
      setProgress(30);

      // Start polling
      console.log('🔄 Starting polling for job status...');
      pollJob(job.id);
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

  const pollJob = async (jobId) => {
    let pollCount = 0;
    const maxPolls = 150; // 5 minutes max (150 * 2 seconds)
    console.log('🔄 Polling started for job:', jobId);

    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`📊 Poll #${pollCount} - Checking job status...`);
        
        if (pollCount > maxPolls) {
          clearInterval(interval);
          console.error('⏱️ Job timed out after 5 minutes (150 polls)');
          setError('Job timed out after 5 minutes');
          setStatus('error');
          return;
        }

        const response = await fetch(`${API_URL}/jobs/${jobId}`);
        console.log('📥 Poll response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }

        const job = await response.json();
        console.log('📊 Current job status:', job.status);
        console.log('💰 Current cost:', job.cost);
        console.log('📦 Job data:', job);
        
        setCurrentJob(job);
        setStatus(job.status);

        // Update progress based on status
        if (job.status === 'generating_prompts') {
          console.log('🤖 AI is generating visual prompts...');
          setProgress(50);
        } else if (job.status === 'generating_images') {
          console.log('🎨 AI is generating images...');
          setProgress(70);
        }

        if (job.status === 'completed') {
          console.log('✅ Job completed successfully!');
          console.log('🎬 Scene IDs:', job.scene_ids);
          clearInterval(interval);
          setProgress(90);
          await loadScenes(jobId);
          setProgress(100);
          setStatus('completed');
          console.log('🎉 ===== PROCESS COMPLETE =====');
        }

        if (job.status === 'failed') {
          console.error('❌ Job failed!');
          console.error('Error message:', job.error_message);
          clearInterval(interval);
          setError(job.error_message || 'Job failed');
          setStatus('error');
          setProgress(0);
        }
      } catch (err) {
        console.error('❌ Polling error:', err);
        console.error('Poll count:', pollCount);
        clearInterval(interval);
        setError(err.message);
        setStatus('error');
      }
    }, 2000); // Poll every 2 seconds
  };

  const loadScenes = async (jobId) => {
    console.log('🎬 Loading scenes for job:', jobId);
    try {
      const response = await fetch(`${API_URL}/scenes/job/${jobId}`);
      console.log('📥 Scenes response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Failed to fetch scenes');
      }

      const scenesData = await response.json();
      console.log('✅ Scenes loaded successfully!');
      console.log('📊 Number of scenes:', scenesData.length);
      console.log('🎬 Scenes data:', scenesData);
      
      setScenes(scenesData);
    } catch (err) {
      console.error('❌ Error loading scenes:', err);
      console.error('Full error:', err);
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
        }
      } catch (err) {
        console.error('❌ Error polling scene:', err);
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleReset = () => {
    console.log('🔄 Resetting app state...');
    setScenes([]);
    setStatus('idle');
    setProgress(0);
    setCurrentJobId(null);
    setCurrentJob(null);
    setError(null);
    console.log('✅ App reset complete');
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
            <FileUpload onFileUpload={handleFileUpload} />
            
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
                <h2 className="text-2xl font-semibold text-primary">
                  Your Storyboard ({scenes.length} scenes)
                </h2>
                <Button onClick={handleReset} variant="outline">
                  Upload New Script
                </Button>
              </div>
            </Card>
            
            {/* Cost Display */}
            {currentJob?.cost && (
              <div className="mb-6">
                <CostDisplay cost={currentJob.cost} />
              </div>
            )}
            
            <SceneGrid 
              scenes={scenes} 
              onRegenerateImage={regenerateImage}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
