import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Loader2, CheckCircle2, Film, ArrowRight, Camera, Users, Sparkles, Download, Edit, Maximize2, Copy, FileJson, CheckCheck, X } from 'lucide-react';
import ShortStageEditModal from './ShortStageEditModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function ShortsGenerator() {
  const [step, setStep] = useState(1); // 1-4 (no video generation step)
  const [category, setCategory] = useState('epoxy_flooring');
  const [concepts, setConcepts] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingStage, setEditingStage] = useState(null);
  const [expandedImage, setExpandedImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [copiedPrompt, setCopiedPrompt] = useState(null);

  // STEP 1: Generate concepts
  const generateConcepts = async () => {
    console.log('🎬 Generating concepts for category:', category);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/shorts/concepts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          category, 
          num_concepts: 10 
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate concepts');
      }

      const data = await response.json();
      console.log('✅ Concepts generated:', data.concepts.length);
      setConcepts(data.concepts);
      setStep(2);
    } catch (err) {
      console.error('❌ Error generating concepts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Create project
  const createProject = async () => {
    console.log('📝 Creating project with concept index:', selectedIndex);
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/shorts/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          concept_index: selectedIndex,
          aspect_ratio: aspectRatio
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const proj = await response.json();
      console.log('✅ Project created:', proj.id);
      setProject(proj);
      setStep(3);
      
      // Start polling for images
      pollForImages(proj.id);
    } catch (err) {
      console.error('❌ Error creating project:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Poll for images
  const pollForImages = async (projectId) => {
    console.log('🔄 Polling for images...');
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/shorts/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');

        const proj = await response.json();
        setProject(proj);
        
        const allReady = proj.stages.every(s => s.image_status === 'generated');
        if (allReady) {
          console.log('✅ All images generated!');
          clearInterval(interval);
          setStep(4); // Move to export step
        } else if (proj.status === 'failed') {
          console.error('❌ Project failed');
          clearInterval(interval);
          setError('Project generation failed');
        }
      } catch (err) {
        console.error('❌ Error polling:', err);
        clearInterval(interval);
        setError(err.message);
      }
    }, 3000);
  };

  const resetGenerator = () => {
    setStep(1);
    setCategory('epoxy_flooring');
    setConcepts([]);
    setSelectedIndex(null);
    setProject(null);
    setLoading(false);
    setError(null);
    setEditingStage(null);
    setExpandedImage(null);
    setAspectRatio('9:16');
    setCopiedPrompt(null);
  };

  const handleDownloadStage = (stage) => {
    if (!stage.image_url) return;
    
    const link = document.createElement('a');
    link.href = stage.image_url;
    link.download = `${project.room_type}-stage-${stage.stage_number}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`✅ Downloaded stage ${stage.stage_number}`);
  };

  const handleDownloadAllStages = () => {
    if (!project?.stages) return;
    
    project.stages.forEach((stage, idx) => {
      if (stage.image_url) {
        setTimeout(() => {
          handleDownloadStage(stage);
        }, idx * 500); // Stagger downloads
      }
    });
    console.log(`✅ Downloaded all ${project.stages.length} stages`);
  };

  const handleCopyTransitionPrompt = (transitionNumber) => {
    const transition = project.transitions.find(t => t.transition_number === transitionNumber);
    if (transition) {
      navigator.clipboard.writeText(transition.motion_description);
      setCopiedPrompt(transitionNumber);
      setTimeout(() => setCopiedPrompt(null), 2000);
      console.log(`✅ Copied transition ${transitionNumber} prompt`);
    }
  };

  const handleExportJSON = () => {
    if (!project) return;
    
    const exportData = {
      title: project.room_type,
      category: project.category,
      aspect_ratio: project.aspect_ratio,
      total_cost: project.total_cost,
      stages: project.stages.map(s => ({
        number: s.stage_number,
        type: s.stage_type,
        workers_present: s.workers_present,
        image_url: s.image_url,
        prompt: s.detailed_description
      })),
      transitions: project.transitions.map(t => ({
        number: t.transition_number,
        from: t.from_stage,
        to: t.to_stage,
        duration_seconds: t.duration_seconds,
        prompt: t.motion_description
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.room_type.replace(/\s+/g, '_')}_export.json`;
    a.click();
    URL.revokeObjectURL(url);
    console.log('✅ Exported project as JSON');
  };

  const handleEditStage = async (stageNumber, instruction) => {
    console.log('✏️ Editing stage:', stageNumber, 'with instruction:', instruction);
    setError(null);
    
    try {
      // Update stage to show it's regenerating
      setProject(prevProject => ({
        ...prevProject,
        stages: prevProject.stages.map(s =>
          s.stage_number === stageNumber ? { ...s, image_status: 'pending' } : s
        )
      }));

      const response = await fetch(`${API_URL}/shorts/${project.id}/stage/${stageNumber}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction })
      });

      if (!response.ok) {
        throw new Error('Failed to edit stage');
      }

      const updatedProject = await response.json();
      console.log('✅ Stage edit submitted, regenerating...');
      
      // Poll for updated stage
      pollStageUpdate(project.id, stageNumber);
      setEditingStage(null);
      
    } catch (err) {
      console.error('❌ Error editing stage:', err);
      setError(err.message);
    }
  };

  const handleRegenerateStage = async (stageNumber) => {
    console.log('🔄 Regenerating stage:', stageNumber);
    setError(null);
    
    try {
      // Update stage to show it's regenerating
      setProject(prevProject => ({
        ...prevProject,
        stages: prevProject.stages.map(s =>
          s.stage_number === stageNumber ? { ...s, image_status: 'pending' } : s
        )
      }));

      const response = await fetch(`${API_URL}/shorts/${project.id}/stage/${stageNumber}/regenerate`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate stage');
      }

      const updatedProject = await response.json();
      console.log('✅ Stage regeneration submitted');
      
      // Poll for updated stage
      pollStageUpdate(project.id, stageNumber);
      
    } catch (err) {
      console.error('❌ Error regenerating stage:', err);
      setError(err.message);
    }
  };

  const pollStageUpdate = async (projectId, stageNumber) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_URL}/shorts/${projectId}`);
        if (!response.ok) throw new Error('Failed to fetch project');

        const proj = await response.json();
        const updatedStage = proj.stages.find(s => s.stage_number === stageNumber);
        
        if (updatedStage && updatedStage.image_status === 'generated') {
          console.log('✅ Stage update complete');
          setProject(proj);
          clearInterval(interval);
        } else if (updatedStage && updatedStage.image_status === 'failed') {
          console.error('❌ Stage update failed');
          setProject(proj);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('❌ Error polling stage:', err);
        clearInterval(interval);
      }
    }, 2000);
  };

  return (
    <div className="shorts-generator-container max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">🎬 YouTube Shorts Generator</h1>
        <p className="text-muted-foreground">
          Create viral transformation content with 6 keyframe images + 5 transition prompts
        </p>
        <p className="text-sm text-muted-foreground">
          💰 Cost: ~$0.10-0.15 per short • 📤 Export for use with Runway, Pika, Kling, etc.
        </p>
        <p className="text-xs text-muted-foreground">
          ✨ MORE PEOPLE: Stages 2, 3, 4 feature 2-4 workers • Stage 3 is the hero shot! 👷‍♀️👷👷‍♂️
        </p>
      </div>

      {/* Progress Indicator */}
      {step > 1 && (
        <div className="flex items-center justify-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                s < step ? 'bg-green-500 text-white' :
                s === step ? 'bg-primary text-white' :
                'bg-gray-200 text-gray-500'
              }`}>
                {s < step ? '✓' : s}
              </div>
              {s < 4 && (
                <div className={`w-12 h-1 mx-2 ${
                  s < step ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* STEP 1: Select Category */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Choose Your Content Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { value: 'epoxy_flooring', emoji: '🎨', label: 'Epoxy Flooring' },
                { value: 'furniture_build', emoji: '🪑', label: 'Furniture Building' },
                { value: 'room_renovation', emoji: '🏠', label: 'Room Renovation' },
                { value: 'woodworking', emoji: '🪵', label: 'Woodworking' },
                { value: 'painting', emoji: '🖌️', label: 'Painting' },
                { value: 'crafting', emoji: '✂️', label: 'Crafting' },
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${
                    category === cat.value
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.emoji}</div>
                  <div className="font-medium">{cat.label}</div>
                </button>
              ))}
            </div>

            {/* Aspect Ratio Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Aspect Ratio:</label>
              <div className="flex gap-2">
                <Button
                  variant={aspectRatio === '9:16' ? 'default' : 'outline'}
                  onClick={() => setAspectRatio('9:16')}
                  className="flex-1"
                >
                  📱 9:16 (Shorts)
                </Button>
                <Button
                  variant={aspectRatio === '16:9' ? 'default' : 'outline'}
                  onClick={() => setAspectRatio('16:9')}
                  className="flex-1"
                >
                  🖥️ 16:9 (Landscape)
                </Button>
              </div>
            </div>

            <Button
              onClick={generateConcepts}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate 10 Transformation Ideas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Cost: ~$0.02 for concept generation
            </p>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: Select Concept */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Choose Your Transformation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Select one of these 10 AI-generated transformation ideas:
            </p>
            
            <div className="grid grid-cols-1 gap-4 max-h-[60vh] overflow-y-auto">
              {concepts.map((concept) => (
                <button
                  key={concept.index}
                  onClick={() => setSelectedIndex(concept.index)}
                  className={`p-4 rounded-lg border-2 text-left transition-all hover:scale-[1.02] ${
                    selectedIndex === concept.index
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-gray-200 hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 ${
                      selectedIndex === concept.index ? 'bg-primary text-white' : 'bg-gray-200'
                    }`}>
                      {concept.index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{concept.title}</h3>
                      <p className="text-sm text-muted-foreground">{concept.description}</p>
                    </div>
                    {selectedIndex === concept.index && (
                      <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <Button
              onClick={createProject}
              disabled={selectedIndex === null || loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Project...
                </>
              ) : (
                <>
                  <Camera className="w-5 h-5 mr-2" />
                  Create 6-Stage Transformation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Next: Generate 6 stage images (~$0.06) with 2-4 workers
            </p>
          </CardContent>
        </Card>
      )}

      {/* STEP 3: Generating Images */}
      {step === 3 && project && (
        <Card>
          <CardHeader>
            <CardTitle>Step 3: Generating Stage Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>{project.room_type}</span>
                <span className="font-bold">{project.progress_percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.stages.map((stage) => (
                <Card key={stage.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        Stage {stage.stage_number}: {stage.stage_type.replace(/_/g, ' ')}
                      </CardTitle>
                      {stage.workers_present && (
                        <Badge variant="secondary" className="text-xs">
                          <Users className="w-3 h-3 mr-1" />
                          Workers
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-[9/16] bg-gray-100 relative group">
                      {stage.image_status === 'generated' ? (
                        <>
                          <img
                            src={stage.image_url}
                            alt={`Stage ${stage.stage_number}`}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => setExpandedImage(stage)}
                          />
                          <div className="absolute top-2 right-2">
                            <CheckCircle2 className="w-6 h-6 text-green-500 bg-white rounded-full" />
                          </div>
                          {/* Hover buttons */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedImage(stage);
                              }}
                              className="gap-1"
                            >
                              <Maximize2 className="w-4 h-4" />
                              Expand
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadStage(stage);
                              }}
                              className="gap-1"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStage(stage);
                              }}
                              className="gap-1"
                            >
                              <Edit className="w-4 h-4" />
                              Edit
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center">
                          <Loader2 className="w-12 h-12 text-primary animate-spin mb-3" />
                          <p className="text-sm text-muted-foreground">Generating...</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>⏱️ This usually takes 45-90 seconds (6 images with workers)</p>
              <p className="mt-1">💰 Cost so far: ${project.total_cost.toFixed(4)}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 4: Complete - Export (NOT video generation) */}
      {step === 4 && project && (
        <div className="space-y-6">
          {/* Success Banner */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-green-900">All Images & Prompts Ready! 🎉</h2>
                  <p className="text-green-800">Your Short is ready to export: 6 keyframes + 5 transitions for video tools</p>
                  <p className="text-sm text-green-700 mt-1">
                    🎬 Includes 2-4 workers in action shots • 20-25 second final video
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stage Images Gallery */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>6 Keyframe Images</CardTitle>
                <Button variant="outline" onClick={handleDownloadAllStages}>
                  <Download className="w-4 h-4 mr-2" />
                  Download All Images
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Empty → Prep (👷×2-3) → Installation (👷×3-4) → Finishing (👷×2-3) → Complete → Furnished
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {project.stages.map((stage) => (
                  <div key={stage.id} className="space-y-2">
                    <div className="aspect-[9/16] rounded-lg overflow-hidden border-2 border-gray-200 relative group cursor-pointer">
                      <img
                        src={stage.image_url}
                        alt={`Stage ${stage.stage_number}`}
                        className="w-full h-full object-cover"
                        onClick={() => setExpandedImage(stage)}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedImage(stage);
                            }}
                            className="text-xs"
                          >
                            <Maximize2 className="w-3 h-3 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingStage(stage);
                            }}
                            className="text-xs"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium">
                        Stage {stage.stage_number}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadStage(stage)}
                        className="h-6 px-2"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transition Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                5 Transition Prompts for Video Tools
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Use these detailed prompts (150-300 words each) with Runway, Pika, Kling, or any image-to-video tool
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ✨ Each prompt maintains visual consistency (same camera angle, room layout, lighting)
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.transitions.map((transition) => (
                <Card key={transition.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">
                          Transition {transition.transition_number}: 
                          <span className="ml-2 text-primary">
                            {transition.from_stage.replace(/_/g, ' ')} → {transition.to_stage.replace(/_/g, ' ')}
                          </span>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Suggested duration: {transition.duration_seconds} seconds
                        </p>
                      </div>
                      <Button
                        variant={copiedPrompt === transition.transition_number ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleCopyTransitionPrompt(transition.transition_number)}
                      >
                        {copiedPrompt === transition.transition_number ? (
                          <>
                            <CheckCheck className="w-4 h-4 mr-2" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Prompt
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-gray-50 rounded-lg border max-h-40 overflow-y-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {transition.motion_description}
                      </pre>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      💡 Use with keyframes: Stage {transition.transition_number} → Stage {transition.transition_number + 1}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Export Section */}
          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Export All Assets
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">📦 Export includes:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✓ 6 stage images (as data URIs)</li>
                  <li>✓ 6 stage prompts (detailed descriptions)</li>
                  <li>✓ 5 transition prompts (150-300 words each, with continuity markers)</li>
                  <li>✓ All metadata (duration, workers count, stage types, etc.)</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Cost</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${project.total_cost.toFixed(4)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Assets Created</p>
                  <p className="text-2xl font-bold">
                    6 images + 5 prompts
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={resetGenerator}
                  className="flex-1"
                >
                  Create Another Short
                </Button>
                <Button onClick={handleExportJSON} className="flex-1">
                  <FileJson className="w-4 h-4 mr-2" />
                  Download JSON Export
                </Button>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-900">
                  <strong>Next steps:</strong> Import this JSON into your video tool, or manually use the 
                  6 images as keyframes with the 5 transition prompts for frame interpolation.
                </p>
                <p className="text-xs text-amber-800 mt-2">
                  💡 Final video will be ~20-25 seconds. Each transition prompt includes continuity 
                  markers to maintain consistent camera angle and room layout across all stages.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Stage Modal */}
      {editingStage && (
        <ShortStageEditModal
          stage={editingStage}
          projectId={project.id}
          onClose={() => setEditingStage(null)}
          onSave={(instruction) => handleEditStage(editingStage.stage_number, instruction)}
          onRegenerate={() => handleRegenerateStage(editingStage.stage_number)}
        />
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/95 animate-in fade-in duration-200"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Image Container */}
            <div className="relative max-w-5xl max-h-[80vh] flex items-center justify-center">
              <img
                src={expandedImage.image_url}
                alt={`Stage ${expandedImage.stage_number}`}
                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Action bar */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur rounded-lg p-4 max-w-3xl w-full mx-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-white flex-1 min-w-0">
                  <p className="font-semibold">Stage {expandedImage.stage_number}</p>
                  <p className="text-sm text-white/80">{expandedImage.stage_type.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedImage(null);
                      setEditingStage(expandedImage);
                    }}
                    className="gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadStage(expandedImage);
                    }}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ShortsGenerator;
