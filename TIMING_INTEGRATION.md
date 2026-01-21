# Timing Integration - Backend to UI

## ✅ Complete! Backend & Frontend Integrated

The UI now displays accurate timing information for job completion.

---

## Backend API Changes

The backend now returns these timing fields in the Job response:

```json
{
  "id": "93032f12-1308-41f8-b9fa-87e8f06e9295",
  "status": "completed",
  "created_at": "2026-01-19T17:33:09.123Z",
  "started_at": "2026-01-19T17:33:09.500Z",    // ✨ NEW
  "completed_at": "2026-01-19T17:38:15.789Z",  // ✨ NEW
  "duration_seconds": 306.3,                   // ✨ NEW (most accurate!)
  "cost": {
    "total_cost": 0.0145,
    ...
  }
}
```

### Timing Fields Explained

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `created_at` | ISO 8601 | When job was first created | `"2026-01-19T17:33:09.123Z"` |
| `started_at` | ISO 8601 | When processing actually began | `"2026-01-19T17:33:09.500Z"` |
| `completed_at` | ISO 8601 | When processing finished | `"2026-01-19T17:38:15.789Z"` |
| `duration_seconds` | Float | Total processing time in seconds | `306.3` (5m 6s) |

---

## UI Integration

### Priority System

The UI uses a **fallback priority system** to ensure timing is always displayed:

```javascript
// Priority 1: Use duration_seconds (most accurate)
if (job.duration_seconds != null) {
  duration = job.duration_seconds * 1000; // Convert to ms
  console.log('⏱️ ✅ Using backend duration_seconds');
}

// Priority 2: Calculate from started_at/completed_at
else if (job.started_at && job.completed_at) {
  duration = new Date(job.completed_at) - new Date(job.started_at);
  console.log('⏱️ Calculated from started_at/completed_at');
}

// Priority 3: Calculate from created_at/completed_at
else if (job.created_at && job.completed_at) {
  duration = new Date(job.completed_at) - new Date(job.created_at);
  console.log('⏱️ Calculated from created_at/completed_at');
}

// Priority 4: Check for processing_time_ms
else if (job.processing_time_ms) {
  duration = job.processing_time_ms;
  console.log('⏱️ Used processing_time_ms');
}

// Priority 5: Fallback to client-side timer (least accurate)
else if (clientStartTime) {
  duration = Date.now() - clientStartTime;
  console.log('⏱️ ⚠️ Using client-side timer (fallback)');
}
```

### Why This Priority Order?

1. **`duration_seconds`** - Backend measures actual processing time, most accurate
2. **`started_at/completed_at`** - Accurate timestamps for processing window
3. **`created_at/completed_at`** - Includes time job sat in queue
4. **`processing_time_ms`** - Legacy field support
5. **Client-side timer** - Last resort, includes network latency

---

## Where It's Displayed

### 1. Storyboard Header
Shows total generation time next to scene count:

```
Your Storyboard (18 scenes)
⏱️ Generated in 5m 6s  ❤️ 3 approved
```

**Code:** `src/App.jsx` line 541-547

---

### 2. Cost Display Card
Shows in job summary header next to total cost:

```
Job Summary                    $0.0145
                          ⏱️ 5m 6s
```

**Code:** `src/components/CostDisplay.jsx` line 36-40

---

### 3. Per-Scene Time
Calculates average time per scene:

```
⏱️ Per Scene
16.8s
```

**Code:** `src/components/CostDisplay.jsx` line 88-98

---

## Example Console Output

When job completes, you'll see:

```
✅ ===== JOB COMPLETED! =====
🛑 Stopping polling interval
🔍 Checking job timing data...
📦 Full job object: { ... }
⏱️ ✅ Using backend duration_seconds: 306.3 seconds
⏱️ Formatted: 5m 6s
📥 Fetching scenes from /scenes/job/abc-123
✅ SCENES LOADED SUCCESSFULLY!
🎉 ===== PROCESS COMPLETE =====
```

---

## Time Formatting

The UI formats milliseconds into human-readable strings:

```javascript
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;  // "5m 6s"
  }
  return `${seconds}s`;  // "45s"
}
```

**Examples:**
- `5123` ms → `"5s"`
- `65789` ms → `"1m 5s"`
- `306300` ms → `"5m 6s"`

---

## Testing

### Expected Behavior

1. **Upload a script** → Client timer starts
2. **Job processes** → Backend tracks timing
3. **Job completes** → Backend sends `duration_seconds`
4. **UI displays** → Shows formatted time in 2 places

### Verify It's Working

Check the console for:
```
⏱️ ✅ Using backend duration_seconds: 306.3 seconds
⏱️ Formatted: 5m 6s
```

If you see:
```
⏱️ ⚠️ Using client-side timer (fallback): 5m 8s
```
Then the backend didn't send `duration_seconds` (check backend logs).

---

## Troubleshooting

### Problem: UI shows client-side timer warning

**Cause:** Backend not sending `duration_seconds`

**Fix:** Check backend logs, ensure the job completion code sets `duration_seconds`

---

### Problem: Duration shows "N/A"

**Cause:** No timing data available at all

**Fix:** 
1. Check network tab for job response
2. Verify backend is setting timestamps
3. Check console for errors

---

### Problem: Time seems inaccurate

**Cause:** Using client-side timer or wrong timestamps

**Fix:** 
1. Check console to see which timer is being used
2. Ensure backend sends `duration_seconds`
3. Verify timestamps are in ISO 8601 format

---

## Benefits

✅ **Accurate** - Backend measures actual processing time  
✅ **Reliable** - Not affected by network latency  
✅ **Consistent** - Same calculation across all clients  
✅ **Fallback** - Multiple backup options if backend data missing  
✅ **User Insight** - Shows real generation time and per-scene average  

---

## Related Files

- `/src/App.jsx` - Main timing logic (lines 185-238)
- `/src/components/CostDisplay.jsx` - Displays timing (lines 5, 36-40, 88-98)
- `BACKEND_TIMING_SPEC.md` - Backend implementation guide

---

## Status

✅ **Backend** - Returns `duration_seconds`, `started_at`, `completed_at`  
✅ **Frontend** - Receives, prioritizes, and displays timing  
✅ **Testing** - Ready to test with next job upload  

**Next Step:** Upload a script and verify the timing displays correctly! 🎉
