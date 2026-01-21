import React, { useState } from 'react';
import mammoth from 'mammoth';
import WizardProgress from './components/WizardProgress';
import FileUpload from './components/FileUpload';
import StyleConfig from './components/StyleConfig';
import DirectorReview from './components/DirectorReview';
import StatusBar from './components/StatusBar';
import SceneGrid from './components/SceneGrid';
import CostDisplay from './components/CostDisplay';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Film, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AppWizard() {
  // Wizard state
  const [wizardStep, setWizardStep] = useState(1);
  
  // Job state
  const [currentJobId, setCurrentJobId] = useState(null);
  const [currentJob, setCurrentJob] = useState(null);
  const [scenes, setScenes] = useState([]);
  const [error, setError] = useState(null);
  
  // Step 1 state
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
  
  // Step 3 state (generation progress)
  const [genStatus, setGenStatus] = useState('');
  const [genProgress, setGenProgress] = useState(0);

  // Log app initialization
  React.useEffect(() => {
    console.log('🚀 ===== YT VISUAL GENERATOR WIZARD INITIALIZED =====');
    console.log('🌐 API URL:', API_URL);
    console.log('📝 Environment:', import.meta.env.MODE);
    console.log('🧙‍♂️ Wizard mode enabled!');
    console.log('================================================');
  }, []);

  // ==================== STEP 1: Upload & Create Job ====================
  
  const handleFileUpload = async (file) => {
    console.log('🎬 ===== FILE UPLOAD STARTED =====');
    console.log('📄 File name:', file.name);
    
    try {
      setError(null);

      // Extract text from .docx file
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      const text = result.value.trim();

      console.log('📝 Extracted text length:', text.length);

      if (!text) {
        throw new Error('No text found in document');
      }

      // Create job with wizard mode
      console.log('🚀 Creating job with wizard mode...');
      
      const requestBody = {
        script_text: text,
        wizard_mode: true,  // ← Enable wizard flow
        generate_images: true,
        style_config: styleConfig
      };

      const jobResponse = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!jobResponse.ok) {
        const errorData = await jobResponse.json();
        throw new Error(errorData.detail || 'Failed to create job');
      }

      const job = await jobResponse.json();
      console.log('✅ Job created:', job.id);
      console.log('🎬 Moving to Director Review step...');
      
      setCurrentJobId(job.id);
      setCurrentJob(job);
      setWizardStep(2);  // Move to director review

    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message);
    }
  };

  // ==================== STEP 2: Director Review ====================
  
  const handleDirectorApprove = () => {
    console.log('✅ ===== DIRECTOR APPROVAL =====');
    console.log('📋 Job ID:', currentJobId);
    console.log('➡️ Moving from step 2 to step 3');
    setWizardStep(3);  // Move to generation progress
    
    // Small delay to ensure state updates before polling
    setTimeout(() => {
      console.log('🔄 Initiating generation polling...');
      startGenerationPolling();
    }, 100);
  };

  // ==================== STEP 3: Generation Progress ====================
  
  const startGenerationPolling = async () => {
    console.log('🔄 ===== STARTING GENERATION POLLING =====');
    console.log('📋 Job ID:', currentJobId);
    console.log('📍 Current wizard step:', wizardStep);
    
    let pollCount = 0;
    const maxPolls = 300; // 10 minutes max
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`📊 Generation poll #${pollCount} - Fetching job status...`);
        
        const response = await fetch(`${API_URL}/jobs/${currentJobId}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch job: ${response.status}`);
        }
        
        const job = await response.json();
        console.log('📦 Job status:', job.status);
        console.log('📦 Full job data:', job);
        
        setCurrentJob(job);
        setGenStatus(job.status);

        // Update progress based on status
        if (job.status === 'generating_visuals') {
          console.log('🎥 Creating visual prompts...');
          setGenProgress(50);
        } else if (job.status === 'generating_images') {
          console.log('🖼️ Generating images...');
          // Try to get actual image progress
          try {
            const scenesResponse = await fetch(`${API_URL}/scenes/job/${currentJobId}`);
            if (scenesResponse.ok) {
              const scenesData = await scenesResponse.json();
              const completed = scenesData.filter(s => s.image_status === 'generated').length;
              const total = scenesData.length;
              const progress = 50 + (completed / total) * 50;
              console.log(`🖼️ Images: ${completed}/${total} complete (${Math.round(progress)}%)`);
              setGenProgress(progress);
            }
          } catch (err) {
            console.log('⚠️ Could not fetch scene progress:', err.message);
            setGenProgress(70);
          }
        }

        if (job.status === 'completed') {
          console.log('✅ ===== JOB COMPLETED! =====');
          console.log('🛑 Stopping polling...');
          clearInterval(interval);
          
          console.log('📥 Fetching final scenes from /scenes/job/' + currentJobId);
          setGenProgress(95);
          
          await loadScenes();
          
          setGenProgress(100);
          console.log('🎉 Moving to results step...');
          setWizardStep(4);  // Move to results
        }

        if (job.status === 'failed') {
          console.error('❌ Job failed:', job.error_message);
          clearInterval(interval);
          setError(job.error_message || 'Generation failed');
        }
        
        if (pollCount > maxPolls) {
          console.error('⏱️ Polling timeout after 10 minutes');
          clearInterval(interval);
          setError('Polling timed out after 10 minutes');
        }
      } catch (err) {
        console.error('❌ Polling error:', err);
        console.error('Error details:', err.message, err.stack);
        clearInterval(interval);
        setError(err.message);
      }
    }, 2000);
  };

  const loadScenes = async () => {
    console.log('🎬 ===== LOADING FINAL SCENES =====');
    console.log('📥 Fetching from:', `${API_URL}/scenes/job/${currentJobId}`);
    
    try {
      const response = await fetch(`${API_URL}/scenes/job/${currentJobId}`);
      console.log('📥 Scenes response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Scenes fetch failed:', errorText);
        throw new Error(`Failed to fetch scenes: ${response.status}`);
      }

      const scenesData = await response.json();
      console.log('✅ Scenes loaded successfully!');
      console.log('📊 Number of scenes:', scenesData.length);
      console.log('🎬 Scene data:', scenesData);
      
      // Log image status for each scene
      scenesData.forEach((scene, idx) => {
        console.log(`Scene ${idx + 1}:`, {
          id: scene.id,
          image_status: scene.image_status,
          has_image_url: !!scene.image_url,
          image_url_length: scene.image_url?.length || 0,
          sentence: scene.sentence_text?.substring(0, 50) + '...'
        });
      });
      
      setScenes(scenesData);
      console.log('✅ Scenes set in state!');
    } catch (err) {
      console.error('❌ Error loading scenes:', err);
      console.error('Error details:', err.message, err.stack);
      setError(err.message);
    }
  };

  // ==================== STEP 4: Results & Actions ====================
  
  const regenerateImage = async (sceneId) => {
    console.log('🔄 Regenerating image for scene:', sceneId);
    try {
      setError(null);
      
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

      if (!response.ok) throw new Error('Failed to regenerate image');

      pollSceneUpdate(sceneId);
    } catch (err) {
      console.error('❌ Error regenerating image:', err);
      setError(err.message);
    }
  };

  const pollSceneUpdate = async (sceneId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/scenes/${sceneId}`);
        if (!response.ok) throw new Error('Failed to fetch scene');

        const scene = await response.json();
        setScenes(prevScenes => 
          prevScenes.map(s => s.id === sceneId ? scene : s)
        );

        if (scene.image_status === 'generated' || scene.image_status === 'failed') {
          clearInterval(interval);
        }
      } catch (err) {
        console.error('❌ Error polling scene:', err);
        clearInterval(interval);
      }
    }, 2000);
  };

  const handleReset = () => {
    console.log('🔄 Resetting wizard...');
    setWizardStep(1);
    setCurrentJobId(null);
    setCurrentJob(null);
    setScenes([]);
    setError(null);
    setGenStatus('');
    setGenProgress(0);
  };

  // ==================== RENDER ====================

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
              AI-powered storyboard creation with director-guided visuals
            </p>
          </div>
        </Card>

        {/* Wizard Progress */}
        <WizardProgress currentStep={wizardStep} />

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

        {/* Step 1: Upload Script */}
        {wizardStep === 1 && (
          <>
            <FileUpload onFileUpload={handleFileUpload} />
            
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

        {/* Step 2: Director Review */}
        {wizardStep === 2 && (
          <DirectorReview 
            jobId={currentJobId}
            onApprove={handleDirectorApprove}
          />
        )}

        {/* Step 3: Generation Progress */}
        {wizardStep === 3 && (
          <>
            <StatusBar 
              status={genStatus} 
              progress={genProgress}
            />
            
            {/* Debug Panel */}
            <Card className="mt-4 bg-gray-50">
              <div className="p-4 space-y-2 text-sm">
                <h3 className="font-semibold">Debug Info:</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>Job ID: <code className="text-xs">{currentJobId}</code></div>
                  <div>Status: <code className="text-xs font-semibold">{genStatus}</code></div>
                  <div>Progress: <code className="text-xs">{genProgress}%</code></div>
                  <div>Step: <code className="text-xs">3 (Generation)</code></div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    console.log('🔍 Manual scene fetch triggered');
                    await loadScenes();
                    if (scenes.length > 0) {
                      setWizardStep(4);
                    }
                  }}
                  className="mt-2"
                >
                  🔍 Manually Load Scenes (Debug)
                </Button>
              </div>
            </Card>
          </>
        )}

        {/* Step 4: View Results */}
        {wizardStep === 4 && scenes.length > 0 && (
          <>
            <Card className="mb-6 bg-white/95 backdrop-blur">
              <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h2 className="text-2xl font-semibold text-primary">
                  Your Storyboard ({scenes.length} scenes)
                </h2>
                <Button onClick={handleReset} variant="outline">
                  Create New Storyboard
                </Button>
              </div>
            </Card>
            
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

export default AppWizard;
