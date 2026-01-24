# Real-Time Cost Tracking ✅

## Overview

The UI now displays **live cost updates** as your storyboard generates, updates, and animates!

---

## 🎯 What's Implemented

### 1. Live Cost Counter
- **Green "● Live" indicator** shows when costs are updating
- **Polls every 3 seconds** during job processing
- **Auto-updates total cost** in real-time
- **Stops polling** when job completes

### 2. Enhanced Cost Breakdown
- **AI Prompts** - Scene planning with GPT
- **AI Images** - Image generation with Gemini  
- **AI Videos** - Video animation with Veo 3.1
- **Per-scene metrics** - Average cost and time per scene

### 3. Backend Integration
Uses new endpoint: `GET /jobs/{job_id}/cost`

---

## UI Features

### Cost Display Card

```
╔═══════════════════════════════════════╗
║ 💰 Job Summary    ● Live    $0.0456  ║
║                          ⏱️ 2m 45s   ║
╠═══════════════════════════════════════╣
║ ✨ AI Prompts      🎨 AI Images       ║
║    $0.0012           $0.0234          ║
║    10 prompts        10 images        ║
║                                       ║
║ 🎬 AI Videos                          ║
║    $0.0210                            ║
║    3 videos • 8s each                 ║
╚═══════════════════════════════════════╝
```

### Live Indicator

When job is processing:
- Shows **"● Live"** in green, pulsing
- Updates cost every 3 seconds
- Tracks all operations (scenes, edits, videos)

When job is complete:
- Indicator disappears
- Shows final cost
- Polling stops

---

## How It Works

### 1. Job Creation
```javascript
// User uploads script
POST /jobs → Job created

// Start polling
pollJobStatus(jobId)  // Check status every 2s
pollCost(jobId)       // Check cost every 3s
```

### 2. Cost Polling
```javascript
const pollCost = async (jobId) => {
  const interval = setInterval(async () => {
    if (!isProcessing) {
      clearInterval(interval);
      return;
    }
    
    const cost = await fetch(`/jobs/${jobId}/cost`);
    updateCostDisplay(cost);
  }, 3000);
};
```

### 3. Cost Updates
- **Initial scenes** - Director + Cinematographer + Images
- **Image regeneration** - New image cost added
- **Scene edits** - Cinematographer + new image cost
- **Video animation** - Veo cost added (~$0.09 per video)

---

## Cost Breakdown

### Initial Generation
| Operation | Cost | Count | Total |
|-----------|------|-------|-------|
| Scene planning (Director) | ~$0.00005 | 10 scenes | $0.0005 |
| Prompt creation (Cinematographer) | ~$0.0001 | 10 scenes | $0.001 |
| Image generation (Gemini) | ~$0.002 | 10 images | $0.02 |
| **Total** | | | **$0.0215** |

### After Operations
```
Initial:        $0.0215
+ Regenerate 2: $0.004  (2 images × $0.002)
+ Edit 3:       $0.0065 (3 × ($0.0001 + $0.002))
+ Animate 5:    $0.45   (5 videos × $0.09)
----------------------------------------
Final Total:    $0.4820
```

---

## Implementation Details

### Files Modified

**1. `src/App.jsx`**
- Added `isProcessing` state
- Added `pollCost()` function
- Updated `createJobWithText()` to start cost polling
- Updated `pollJob()` to stop cost polling on completion

**2. `src/components/CostDisplay.jsx`**
- Added `isLive` prop
- Added "● Live" indicator
- Added video cost section
- Changed grid from 2 to 3 columns

### New State
```javascript
const [isProcessing, setIsProcessing] = useState(false);
```

### Polling Logic
```javascript
// Starts when job created
setIsProcessing(true);
pollCost(jobId);

// Stops when job completes
setIsProcessing(false);
// Cost polling automatically stops
```

---

## Console Logs

### Cost Polling Start
```
💰 ===== COST POLLING STARTED =====
📋 Job ID: abc-123
```

### Cost Updates
```
💰 Cost update: 0.0050
💰 Cost update: 0.0120
💰 Cost update: 0.0215
```

### Cost Polling Stop
```
💰 Cost polling stopped - job complete
```

---

## User Benefits

✅ **Transparency** - See exactly what you're spending  
✅ **Real-time feedback** - Know costs as they happen  
✅ **Budget awareness** - Monitor costs before they add up  
✅ **Detailed breakdown** - Understand where costs come from  
✅ **Per-operation tracking** - See cost of each action  

---

## Typical Costs

| Video Type | Scenes | Edits | Videos | Est. Cost |
|------------|--------|-------|--------|-----------|
| **Basic** (10 scenes, no videos) | 10 | 0 | 0 | $0.02 |
| **Standard** (10 scenes, 2 edits) | 10 | 2 | 0 | $0.03 |
| **Advanced** (10 scenes, 5 edits, 5 videos) | 10 | 5 | 5 | $0.48 |
| **Full** (20 scenes, 10 edits, 20 videos) | 20 | 10 | 20 | $1.87 |

---

## Testing

### Test Case 1: Watch Cost Grow
1. Upload a script (10 scenes)
2. Watch cost counter
3. ✅ See "● Live" indicator
4. ✅ Cost updates during generation
5. ✅ Indicator disappears when complete

### Test Case 2: Operation Costs
1. Complete initial generation
2. Click "Regenerate" on a scene
3. ✅ Cost increases by ~$0.002
4. Click "Edit" and modify a scene
5. ✅ Cost increases by ~$0.0022
6. Click "Animate" on a scene
7. ✅ Cost increases by ~$0.09

### Test Case 3: Multiple Operations
1. Generate 10 scenes
2. Regenerate 3 scenes
3. Edit 2 scenes
4. Animate 5 scenes
5. ✅ Final cost ~$0.48
6. ✅ Breakdown shows all operations

---

## Cost Optimization Tips

Display these to users:

💡 **Tips to Save Money:**
- ✅ Get your script right before generating
- ✅ Use "Edit" sparingly - each costs $0.0022
- ✅ Videos are expensive (~$0.09 each) - only animate favorites
- ✅ Regenerate only when necessary (~$0.002 per image)
- ✅ Preview prompts before generating

---

## Future Enhancements

Possible additions:
- **Budget alerts** - Warn when approaching $1.00, $5.00, etc.
- **Cost estimates** - Show estimated cost before operations
- **Per-scene cost display** - Show cost on each scene card
- **Cost history** - Track spending over time
- **Export cost report** - Download CSV of all operations
- **Batch operation warnings** - "Animating 20 scenes will cost ~$1.80"

---

## API Endpoint Used

### GET /jobs/{job_id}/cost

**Response:**
```json
{
  "total_cost": 0.0456,
  "prompt_generation_cost": 0.0012,
  "image_generation_cost": 0.0234,
  "video_generation_cost": 0.0210,
  "num_prompts_generated": 10,
  "num_images_generated": 12,
  "num_videos_generated": 3,
  "prompt_tokens_used": 8543,
  "image_tokens_used": 1200
}
```

**Polling Frequency:** Every 3 seconds during processing

---

## Status

✅ **Live cost polling implemented**  
✅ **Enhanced cost display with videos**  
✅ **Live indicator working**  
✅ **Auto-stop on completion**  
✅ **Real-time updates visible**  

**Ready to use!** Costs now update live as your storyboard generates. 💰
