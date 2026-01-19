# Debugging Guide

## Full Stack Visibility

You now have complete logging on both frontend and backend!

---

## Setup for Debugging

### 1. Start Backend (Terminal 1)
```bash
cd /path/to/backend
python run.py
```

You'll see:
```
10:30:00 - app.main - INFO - 🚀 Server started
10:30:00 - app.main - INFO - 📝 Ready to process scripts
```

### 2. Start Frontend (Terminal 2)
```bash
cd /Users/hectorsilvarobles/Documents/projects/yt/yt-visual-generator-ui
npm run dev
```

### 3. Open Browser DevTools
- Press `F12` or `Cmd+Option+I` (Mac)
- Click "Console" tab

---

## Side-by-Side View

```
┌─────────────────────────────────┬─────────────────────────────────┐
│    BACKEND TERMINAL             │    BROWSER CONSOLE              │
├─────────────────────────────────┼─────────────────────────────────┤
│                                 │                                 │
│ 10:30:15 - INFO - ✅ Job       │ 🎬 FILE UPLOAD STARTED          │
│ created: abc-123                │ 📄 File name: script.docx       │
│ Script length: 245 chars        │ 🚀 Creating job on backend...   │
│                                 │ ✅ Job created successfully!    │
│                                 │ 🆔 Job ID: abc-123              │
│                                 │                                 │
│ 10:30:15 - INFO - 🚀 Starting  │ 🔄 Starting polling...          │
│ job processing: abc-123         │                                 │
│                                 │                                 │
│ 10:30:15 - INFO - 📝 Splitting │                                 │
│ script into sentences...        │                                 │
│ Found 3 sentences               │                                 │
│                                 │                                 │
│ 10:30:15 - INFO - 🤖           │ 📊 Poll #1                      │
│ Generating visual prompts...    │ 📊 Job status: generating_prompts│
│                                 │ 🤖 AI is generating prompts...  │
│ Scene 1/3: Welcome to...        │                                 │
│    ✅ Prompt generated          │                                 │
│ Scene 2/3: Today we...          │                                 │
│    ✅ Prompt generated          │                                 │
│ Scene 3/3: This is...           │                                 │
│    ✅ Prompt generated          │                                 │
│ ✅ Generated 3 prompts          │                                 │
│                                 │                                 │
│ 10:30:19 - INFO - 🎨           │ 📊 Poll #3                      │
│ Generating images...            │ 📊 Job status: generating_images│
│                                 │ 🎨 AI is creating images...     │
│ Scene 1/3: Generating...        │                                 │
│    ✅ Image generated           │                                 │
│ Scene 2/3: Generating...        │                                 │
│    ✅ Image generated           │                                 │
│ Scene 3/3: Generating...        │                                 │
│    ✅ Image generated           │                                 │
│ ✅ Generated 3 images           │                                 │
│                                 │                                 │
│ 10:30:44 - INFO - ✅ Job       │ 📊 Poll #15                     │
│ completed: abc-123              │ ✅ Job completed successfully!  │
│                                 │ 🎬 Loading scenes...            │
│                                 │ ✅ Scenes loaded: 3 scenes      │
│                                 │ 🎉 PROCESS COMPLETE             │
│                                 │                                 │
└─────────────────────────────────┴─────────────────────────────────┘
```

---

## Common Issues & Solutions

### Issue 1: UI Stuck on "Loading..."

**Frontend Console Shows:**
```
🔄 Starting polling...
📊 Poll #1 - Checking job status...
❌ Failed to fetch
```

**Backend Terminal Shows:**
```
(Nothing - server might be down)
```

**Solution:** Backend is not running or wrong URL
```bash
# Check backend is running on port 8000
# Or update .env file with correct URL
```

---

### Issue 2: Job Stays "Pending"

**Frontend Console Shows:**
```
📊 Poll #1 - Job status: pending
📊 Poll #2 - Job status: pending
📊 Poll #3 - Job status: pending
```

**Backend Terminal Shows:**
```
✅ Job created: abc-123
(No further logs - job not processing)
```

**Solution:** Job processor not starting
- Check for errors in backend terminal
- Verify API keys are set (OPENAI_API_KEY, GEMINI_API_KEY)

---

### Issue 3: Prompt Generation Fails

**Frontend Console Shows:**
```
📊 Poll #5 - Job status: failed
❌ Job failed!
Error message: OpenAI API rate limit exceeded
```

**Backend Terminal Shows:**
```
10:30:16 - INFO - Scene 1/3: Welcome...
10:30:17 - ERROR - ❌ Prompt failed: OpenAI API rate limit exceeded
10:30:17 - ERROR - ❌ Job failed: abc-123
```

**Solution:** 
- Check OpenAI API key
- Check rate limits / billing
- Wait and try again

---

### Issue 4: Image Generation Slow

**Frontend Console Shows:**
```
📊 Poll #25 - Job status: generating_images
🎨 AI is creating images...
(Still waiting after 2 minutes)
```

**Backend Terminal Shows:**
```
10:30:19 - INFO - 🎨 Generating images...
10:30:20 - INFO - Scene 1/10: Generating image...
10:30:28 - INFO -    ✅ Image generated
10:30:28 - INFO - Scene 2/10: Generating image...
(On scene 2 of 10)
```

**Solution:** This is normal!
- Each image takes 5-10 seconds
- 10 images = 50-100 seconds
- Progress is shown in backend logs

---

## Debugging Checklist

When something goes wrong, check both logs:

### ✅ Frontend Console
- [ ] Did file upload start?
- [ ] Was text extracted?
- [ ] Did API call succeed (200 status)?
- [ ] Is polling working?
- [ ] What's the current job status?

### ✅ Backend Terminal
- [ ] Was job created?
- [ ] Did processing start?
- [ ] Are sentences being split?
- [ ] Are prompts being generated?
- [ ] Are images being generated?
- [ ] Any error messages?

---

## Pro Tips

### 1. Filter Logs

**Backend:**
```bash
python run.py | grep "ERROR"  # Only show errors
python run.py | grep "Scene"  # Only show scene progress
```

**Browser Console:**
```javascript
// Filter by log type
console.clear()  // Clear old logs
```

### 2. Time Estimates

Based on logs, estimate completion time:

**Backend shows:**
```
Scene 3/10: Generating image...
```

**You know:**
- 3 done, 7 remaining
- ~8 seconds per image
- ~56 seconds remaining

### 3. Compare Job IDs

Make sure both sides are working on the same job:

**Frontend:**
```
🆔 Job ID: 550e8400-e29b-41d4-a716-446655440000
```

**Backend:**
```
✅ Job created: 550e8400-e29b-41d4-a716-446655440000
```

If different, something is very wrong!

---

## Log Emoji Quick Reference

### Frontend
- 🎬 File upload / scenes
- 📄 File details
- 🚀 Creating job
- 🔄 Polling
- 📊 Poll status
- ✅ Success
- ❌ Error

### Backend
- 🚀 Job started
- 📝 Splitting sentences
- 🤖 Generating prompts
- 🎨 Generating images
- ✅ Success
- ⏭️ Skipped
- ❌ Error

---

## Example: Finding Why Job Failed

### 1. Check Frontend Console
```
❌ ===== ERROR IN FILE UPLOAD =====
Error message: Failed to create job
```

### 2. Check Backend Terminal
```
10:30:15 - ERROR - ❌ Job failed to create
10:30:15 - ERROR - Error: OPENAI_API_KEY environment variable is required
```

### 3. Solution Found!
Missing API key in backend `.env` file

---

## Testing Different Scenarios

### Test 1: Small Script (3 sentences, with images)
**Expected Time:** ~30 seconds
**Backend Logs:** Watch for 3 prompt generations + 3 image generations
**Frontend Logs:** Should poll 15-20 times

### Test 2: Medium Script (10 sentences, with images)
**Expected Time:** ~2 minutes
**Backend Logs:** 10 prompts + 10 images
**Frontend Logs:** Should poll 60-80 times

### Test 3: Large Script (20 sentences, no images)
**Expected Time:** ~45 seconds
**Backend Logs:** 20 prompts, skip images
**Frontend Logs:** Polls 20-25 times

---

## Summary

With both frontend and backend logging:

✅ **You see** exactly what's happening on both sides  
✅ **You know** how far along processing is  
✅ **You can** estimate completion time  
✅ **You can** debug issues quickly  
✅ **You understand** the full flow  

**No more guessing!** 🎉

---

## Quick Commands

```bash
# Terminal 1: Backend
cd /path/to/backend
python run.py

# Terminal 2: Frontend
cd /Users/hectorsilvarobles/Documents/projects/yt/yt-visual-generator-ui
npm run dev

# Browser: Open DevTools
Press F12 or Cmd+Option+I
Click Console tab
```

Now you're ready to debug like a pro! 🚀
