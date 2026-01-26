# 🪄 Edit Assistant Feature

**Added**: January 2026

This feature enhances the scene editing experience with AI-powered suggestions and instruction refinement.

---

## 📚 Overview

The Edit Assistant provides two powerful capabilities when editing scenes:

1. **Edit Suggestions** - See what elements can be changed in the current scene
2. **Instruction Refinement** - Turn vague instructions into detailed, specific edits

---

## 🎯 Features

### 1. Edit Suggestions

When you click "Edit" on a scene, the modal automatically fetches intelligent suggestions based on the current scene state.

**What You Get:**
- **Current Scene State** - See exactly what's in the scene now (character pose, expression, setting, lighting, camera angle)
- **Edit Categories** - Organized groups of possible changes:
  - Character Pose & Expression
  - Setting & Environment
  - Camera & Composition
  - Lighting & Mood
  - Additional Elements

**How to Use:**
1. Click "Edit" on any scene
2. Click "Need ideas? See what you can change" to expand suggestions
3. Click any suggestion to apply it to the text field
4. Modify if needed and click "Apply Changes"

**Example Suggestions:**
```
Category: Character Pose & Expression
- "make the character standing and stretching"
- "change expression to bright smile with open laugh"
- "show character looking down at phone"

Category: Setting & Environment
- "change setting to coffee shop with window seating"
- "move to outdoor park with trees in background"
- "set in modern minimalist office space"

Category: Lighting & Mood
- "use golden hour warm lighting"
- "create dramatic moody atmosphere with shadows"
- "brighten scene with natural daylight"
```

---

### 2. Instruction Refinement

Turn vague instructions like "make it better" into specific, actionable edits.

**When to Use:**
- Your instruction is vague ("make it happier", "improve it")
- You're not sure how to describe what you want
- You want AI to expand on your brief idea

**How to Use:**
1. Type a vague instruction (e.g., "make it more energetic")
2. Click "Make More Specific" button
3. AI refines it to something detailed
4. Review and click "Apply Changes"

**Example Transformations:**

| Original (Vague) | Refined (Specific) |
|------------------|-------------------|
| "make it happier" | "change character expression to bright smile with relaxed posture, add warm golden hour lighting, create uplifting atmosphere" |
| "make it more dramatic" | "use low-key dramatic lighting with strong shadows, change character to intense focused expression, add moody dark color palette" |
| "make it look professional" | "set in modern office with clean background, character in business casual attire, use soft even studio lighting, professional medium shot framing" |
| "add more energy" | "show character in active dynamic pose with animated gesture, use bright vibrant color palette, add motion blur effect for energy" |

---

## 🔧 Technical Details

### API Endpoints Used

#### 1. Get Edit Suggestions
```javascript
GET /scenes/{scene_id}/edit-suggestions

Response:
{
  "current_state": {
    "character": {
      "pose": "sitting_at_desk",
      "expression": "worried_anxious"
    },
    "setting": {
      "location": "home_office",
      "lighting": "harsh_fluorescent"
    },
    "camera": {
      "shot": "medium_shot",
      "angle": "eye_level"
    }
  },
  "edit_categories": [
    {
      "category": "Character Pose & Expression",
      "suggestions": [
        {
          "description": "Change what the character is doing",
          "example_instruction": "make the character standing and stretching"
        },
        {
          "description": "Modify facial expression",
          "example_instruction": "change expression to bright smile with confidence"
        }
      ]
    }
  ]
}
```

#### 2. Refine Instruction
```javascript
POST /scenes/{scene_id}/refine-instruction
{
  "instruction": "make it happier"
}

Response:
{
  "original": "make it happier",
  "refined": "change character expression to bright smile with relaxed posture, add warm golden hour lighting, create uplifting atmosphere",
  "cost": 0.0001
}
```

---

## 📊 Component Structure

### EditSceneModal.jsx

**New State:**
```javascript
const [suggestions, setSuggestions] = useState(null);
const [loadingSuggestions, setLoadingSuggestions] = useState(false);
const [refining, setRefining] = useState(false);
const [showSuggestions, setShowSuggestions] = useState(false);
```

**Key Functions:**
```javascript
// Fetch suggestions on modal open
fetchSuggestions()

// Refine vague instruction
handleRefine()

// Apply suggestion to text input
applySuggestion(exampleInstruction)
```

**UI Elements:**
1. Collapsible suggestions panel with categories
2. "Make More Specific" button (appears when text is entered)
3. Current scene state display
4. Clickable suggestion chips

---

## 💡 User Experience Flow

### Flow 1: Using Suggestions
```
User clicks "Edit" on scene
    ↓
Modal opens
    ↓
Suggestions load automatically
    ↓
User clicks "Need ideas?"
    ↓
Suggestions expand
    ↓
User sees current state + categories
    ↓
User clicks a suggestion
    ↓
Text field populates
    ↓
User clicks "Apply Changes"
    ↓
Scene regenerates with edit
```

### Flow 2: Refining Vague Instructions
```
User types "make it better"
    ↓
"Make More Specific" button appears
    ↓
User clicks button
    ↓
AI refines to detailed instruction
    ↓
Text field updates with refined version
    ↓
User reviews and clicks "Apply Changes"
    ↓
Scene regenerates with specific edit
```

---

## 🎨 Visual Design

### Suggestions Section
- **Gradient Background**: Blue-to-purple gradient for header
- **Collapsible**: Chevron icon indicates expand/collapse
- **Badge**: Shows number of categories
- **Clickable Cards**: Blue background, hover effect
- **Current State**: Gray background box at top

### Refine Button
- **Icon**: Magic wand (Wand2) icon
- **Appearance**: Only shows when text is entered
- **Loading State**: Spinner + "Refining..." text
- **Helper Text**: Explains what it does

---

## 💰 Cost Impact

| Feature | Cost | When Charged |
|---------|------|-------------|
| Edit Suggestions | Free | On modal open |
| Refine Instruction | ~$0.0001 | Per refinement |
| Apply Changes | ~$0.002 | Per regeneration |

**Note**: Fetching suggestions is free because it just analyzes the existing prompt. Refinement costs a tiny amount (~$0.0001) for the GPT call.

---

## 🐛 Error Handling

### Suggestions Fail to Load
```javascript
// Gracefully degrades - modal still works
// User can type instructions manually
// Console logs error for debugging
```

### Refinement Fails
```javascript
// Shows alert to user
// Text field keeps original instruction
// User can try again or edit manually
```

---

## 🧪 Testing

### Test Edit Suggestions
1. Generate scenes with different content
2. Click "Edit" on various scenes
3. Verify suggestions are relevant to scene content
4. Test clicking suggestions populates text field

### Test Instruction Refinement
1. Type vague instruction: "make it better"
2. Click "Make More Specific"
3. Verify refined instruction is detailed
4. Test with various vague phrases:
   - "improve it"
   - "make it nicer"
   - "add more stuff"
   - "change the vibe"

---

## 📝 Console Logs

### Successful Suggestion Load
```
💡 Edit suggestions loaded: {current_state: {...}, edit_categories: [...]}
```

### Refinement Process
```
🪄 Refining instruction: make it happier
✨ Refined to: change character expression to bright smile with relaxed posture...
```

### Errors
```
❌ Error fetching suggestions: [error details]
❌ Error refining: [error details]
```

---

## 🚀 Future Enhancements

Potential improvements:
- **Suggestion Preview** - Show before/after thumbnail
- **Multi-Select** - Combine multiple suggestions
- **Custom Categories** - User-defined suggestion groups
- **Suggestion History** - Remember past successful edits
- **AI Learning** - Suggestions improve based on user choices

---

## 📚 Related Documentation

- `NEW_FEATURES.md` - Scene editing and approval features
- `TEXT_INPUT_FEATURE.md` - Text input implementation
- Backend API documentation - Edit endpoints reference

---

**Summary**: The Edit Assistant makes scene editing more intuitive and powerful by providing contextual suggestions and intelligent instruction refinement. Users can either pick from AI-generated suggestions or refine their own vague ideas into specific, actionable edits.
