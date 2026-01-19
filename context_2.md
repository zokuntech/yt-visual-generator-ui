# UI Quick Start - Frontend Developers

**TL;DR** - How to integrate with this backend in 5 minutes

---

## 🎯 What You Need to Know

### Backend Does:
- ✅ Accepts script text
- ✅ Splits into sentences
- ✅ Generates AI visual prompts
- ✅ Creates AI images
- ✅ Returns storyboard data

### UI Must Do:
- 📄 Handle .doc/.docx file upload
- 📝 Extract text from document
- 📤 Send text to backend
- 🔄 Poll for job completion
- 🎨 Display results

---

## 🚀 Quick Integration (Copy-Paste Ready)

### 1. Install Document Parser

```bash
npm install mammoth  # For .docx files
```

### 2. Complete React Component

```jsx
import React, { useState } from 'react';
import mammoth from 'mammoth';

function StoryboardGenerator() {
  const [scenes, setScenes] = useState([]);
  const [status, setStatus] = useState('');
  const API_URL = 'http://localhost:8000';

  // Step 1: Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    
    // Extract text from .docx
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;
    
    // Create job
    setStatus('Creating job...');
    const jobResponse = await fetch(`${API_URL}/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        script_text: text,
        generate_images: true,
        style_preset: 'bratz_doll_style'
      })
    });
    const job = await jobResponse.json();
    
    // Poll for completion
    pollJob(job.id);
  };

  // Step 2: Poll job status
  const pollJob = async (jobId) => {
    const interval = setInterval(async () => {
      const response = await fetch(`${API_URL}/jobs/${jobId}`);
      const job = await response.json();
      
      setStatus(job.status);
      
      if (job.status === 'completed') {
        clearInterval(interval);
        loadScenes(jobId);
      }
    }, 2000);
  };

  // Step 3: Load scenes
  const loadScenes = async (jobId) => {
    const response = await fetch(`${API_URL}/scenes/job/${jobId}`);
    const scenesData = await response.json();
    setScenes(scenesData);
    setStatus('Complete!');
  };

  // Step 4: Regenerate image
  const regenerateImage = async (sceneId) => {
    await fetch(`${API_URL}/scenes/${sceneId}/regenerate-image`, {
      method: 'POST'
    });
    setStatus('Regenerating image...');
  };

  return (
    <div>
      <h1>YouTube Storyboard Generator</h1>
      
      {/* File Upload */}
      <input 
        type="file" 
        accept=".doc,.docx" 
        onChange={handleFileUpload}
      />
      
      {/* Status */}
      <p>Status: {status}</p>
      
      {/* Scenes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {scenes.map(scene => (
          <div key={scene.id} style={{ border: '1px solid #ccc', padding: '10px' }}>
            <img 
              src={scene.image_url} 
              alt={scene.sentence_text}
              style={{ width: '100%' }}
            />
            <p>{scene.sentence_text}</p>
            <button onClick={() => regenerateImage(scene.id)}>
              Regenerate
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StoryboardGenerator;
```

---

## 📡 API Cheat Sheet

### Create Job
```javascript
POST http://localhost:8000/jobs
{
  "script_text": "Your text here...",
  "generate_images": true
}
→ Returns: { id, status: "pending" }
```

### Check Status
```javascript
GET http://localhost:8000/jobs/{job_id}
→ Returns: { status: "pending|generating_prompts|generating_images|completed" }
```

### Get Scenes
```javascript
GET http://localhost:8000/scenes/job/{job_id}
→ Returns: [{ id, sentence_text, image_url, visual_prompt, ... }]
```

### Regenerate Image
```javascript
POST http://localhost:8000/scenes/{scene_id}/regenerate-image
→ Returns: { image_status: "pending" }
```

---

## 🎨 Scene Data Structure

Each scene contains:
```javascript
{
  "id": "scene-uuid",
  "sentence_text": "Welcome to my channel.",
  "image_url": "data:image/png;base64,...",  // Display this!
  "image_status": "generated",
  "visual_prompt": {
    "style": { "art_style": "bratz_doll_style", ... },
    "characters": [{ "description": "...", ... }],
    "composition": { "camera_angle": "medium_shot", ... }
  }
}
```

---

## 🎯 Workflow Diagram

```
User uploads .doc
      ↓
UI extracts text (mammoth.js)
      ↓
POST /jobs { script_text: "..." }
      ↓
Poll GET /jobs/{id} every 2s
      ↓
Status: completed
      ↓
GET /scenes/job/{id}
      ↓
Display scenes with images!
```

---

## ⚡ Quick Tips

### Do:
- ✅ Poll every 2-3 seconds
- ✅ Show loading states
- ✅ Handle errors gracefully
- ✅ Use mammoth.js for .docx

### Don't:
- ❌ Poll more than once per second
- ❌ Forget to stop polling when complete
- ❌ Send empty script_text
- ❌ Assume images always succeed

---

## 🐛 Common Issues

### "Field required" error
**Fix:** Make sure you're sending `script_text` in the request body

### Images not showing
**Fix:** The `image_url` is a base64 data URI, use it directly in `<img src={...}>`

### Job stays "pending"
**Fix:** Check backend terminal for errors, verify API keys are set

---

## 📚 Full Documentation

For complete details, see: **[UI_INTEGRATION_GUIDE.md](UI_INTEGRATION_GUIDE.md)**

---

## 🚀 Test It

1. Start backend: `python run.py`
2. Upload test .docx file
3. Watch the magic happen! ✨

---

**Questions?** Check `UI_INTEGRATION_GUIDE.md` or ask the backend team!
