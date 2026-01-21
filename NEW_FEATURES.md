# New Features - Custom Backgrounds & Simple Editing

## ✅ Both Features Integrated!

---

## 🎬 Feature 1: Custom Background/Location Selection

Users can now select **preferred locations** for their video scenes instead of leaving it entirely to the AI.

### Where It's Located

**Style Configuration Panel** → Preferred Locations section (with checkboxes)

### How It Works

1. User clicks "Customize Visual Style (Optional)"
2. Scrolls to **"🎬 Preferred Locations (Optional)"**
3. Selects 4-8 locations from categorized list
4. These locations are sent to backend in `style_config.preferred_settings`

### Available Locations

The UI offers 4 categories with popular locations:

#### ☕ Public Spaces (5 options)
- Coffee Shop
- Library
- Gym
- Restaurant
- Mall

#### 🏠 Interior (4 options)
- Bedroom Desk
- Living Room
- Home Office
- Kitchen

#### 💼 Work/School (4 options)
- Office
- Conference Room
- Classroom
- Campus

#### 🌳 Outdoor (5 options)
- Park Bench
- City Street
- Rooftop
- Beach
- Walking Path

### UI Implementation

**File:** `src/components/StyleConfig.jsx`

```jsx
// New field added to style config
preferred_settings: []  // Array of location strings

// Example: User selects 3 locations
preferred_settings: [
  "coffee_shop_by_window",
  "park_bench_under_tree",
  "modern_office_desk"
]
```

### What Gets Sent to Backend

```json
{
  "script_text": "Your script...",
  "generate_images": true,
  "style_config": {
    "art_style": "realistic",
    "lighting": "natural_lighting",
    "color_palette": "warm_neutral",
    "character_description": "...",
    "aspect_ratio": "16:9",
    "preferred_settings": [
      "coffee_shop_by_window",
      "park_bench_under_tree",
      "city_street_sidewalk"
    ]
  }
}
```

### User Experience

- **Optional field** - If empty, AI chooses automatically
- **Checkbox interface** - Easy multi-select
- **Visual counter** - Shows how many locations selected
- **Organized by category** - Easy to find what you want
- **Recommendation** - "Select 4-8 locations for variety"

---

## ✏️ Feature 2: Simple Text-Based Scene Editing

Users can now edit scenes with **plain English instructions** instead of complex JSON editing.

### Where It's Located

**Scene Card** → Edit button (pencil icon) → Edit modal

### How It Works

1. User clicks edit button (✏️) on any scene
2. Modal opens with text input
3. User types simple instruction like "make character smile"
4. Backend applies the instruction and regenerates image
5. UI polls for updated scene

### New Endpoint Used

**Changed from:**
```
POST /scenes/{scene_id}/regenerate-image
Body: { edit_instructions: "..." }
```

**Changed to:**
```
POST /scenes/{scene_id}/regenerate-with-instruction
Body: { instruction: "..." }
```

### Example Instructions

Users can type things like:

**Expressions:**
- "make character smile warmly"
- "make character look worried"
- "add a slight smile"

**Props/Objects:**
- "add laptop on desk"
- "add coffee cup in hand"
- "remove the phone"

**Setting:**
- "change to coffee shop"
- "change to outdoor park"
- "make it a cozy living room"

**Camera:**
- "zoom in on face"
- "zoom out to show full body"
- "change to profile view"

**Lighting:**
- "make it darker and moodier"
- "add more natural light"
- "add sunset lighting"

**Multiple Changes:**
- "make character smile and add laptop"
- "change to park and zoom out"

### UI Implementation

**Files Updated:**
- `src/App.jsx` - Changed endpoint and request body format
- `src/components/EditSceneModal.jsx` - Updated placeholder examples

**Code Changes:**

```javascript
// OLD
body: JSON.stringify({
  edit_instructions: editData.editInstructions
})

// NEW
body: JSON.stringify({
  instruction: editData.editInstructions
})
```

### User Experience

- **Simple text input** - No complex JSON
- **Natural language** - Just describe what you want
- **Helpful examples** - Placeholder shows common instructions
- **Real-time feedback** - Scene shows "pending" while regenerating
- **Automatic polling** - UI waits for new image and updates

---

## Testing Both Features

### Test Scenario 1: Custom Locations

1. Upload a script
2. Before submitting, click "Customize Visual Style"
3. Scroll to "Preferred Locations"
4. Select 4-5 locations (e.g., Coffee Shop, Park, Office, Bedroom, Rooftop)
5. Submit job
6. Check console logs - should show `preferred_settings` array
7. Wait for completion - scenes should use those locations

**Console Output:**
```
📤 Request body: {
  style_config: {
    preferred_settings: ['coffee_shop_by_window', 'park_bench_under_tree', ...]
  }
}
```

### Test Scenario 2: Simple Scene Editing

1. After scenes are generated
2. Click edit button (✏️) on any scene
3. Type: "make character smile"
4. Click "Save & Regenerate"
5. Scene should show "pending" status
6. Wait ~10-15 seconds
7. Scene updates with new image showing character smiling

**Console Output:**
```
✏️ Editing scene: abc-123
📝 Edit instructions: make character smile
✅ Scene edit submitted with instruction, regenerating...
🔄 Instruction: make character smile
```

### Test Scenario 3: Combined Features

1. Upload script with custom locations selected
2. Wait for scenes to generate
3. Edit one scene: "add laptop on desk"
4. Edit another: "change to coffee shop"
5. Both should regenerate with the changes applied

---

## Code Changes Summary

### Files Modified

| File | Changes |
|------|---------|
| `src/components/StyleConfig.jsx` | ✅ Added "Preferred Locations" section with checkboxes (18 locations, 4 categories) |
| `src/App.jsx` | ✅ Added `preferred_settings: []` to default style config<br>✅ Changed edit endpoint to `/regenerate-with-instruction`<br>✅ Changed request body from `edit_instructions` to `instruction` |
| `src/components/EditSceneModal.jsx` | ✅ Updated placeholder examples to match new instruction format |

### New State

```javascript
// Default styleConfig now includes:
styleConfig: {
  art_style: 'realistic',
  lighting: 'natural_lighting',
  color_palette: 'warm_neutral',
  background: 'clean_simple',
  character_description: '',
  camera_angle: 'medium_shot',
  framing: 'centered',
  aspect_ratio: '16:9',
  preferred_settings: []  // ← NEW!
}
```

---

## User Benefits

### Custom Locations
✅ **Control** - Choose specific settings that fit your content  
✅ **Consistency** - Reuse same locations across videos  
✅ **Branding** - Create a signature look with specific environments  
✅ **Flexibility** - Still optional, can let AI choose if preferred  

### Simple Editing
✅ **Easy** - No JSON knowledge required  
✅ **Fast** - Quick text instructions vs complex editing  
✅ **Intuitive** - Natural language like "make it brighter"  
✅ **Powerful** - Can change expressions, props, settings, camera, lighting  

---

## Backward Compatibility

✅ **Both features are optional**  
✅ **Empty `preferred_settings` array works fine**  
✅ **Old endpoints still available if needed**  
✅ **No breaking changes to existing functionality**  

---

## Next Steps

1. **Test with real backend** - Upload a script and try both features
2. **Gather feedback** - See which locations users want most
3. **Expand locations** - Add more options if needed
4. **Quick edit buttons** - Could add preset edit buttons like "😊 Make Smile"

---

## Questions?

- Check `context.md` for full backend API details
- See backend docs for complete list of available locations
- Test the instruction endpoint with various commands

**Status:** ✅ Both features fully integrated and ready to use!
