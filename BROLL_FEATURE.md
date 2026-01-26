# 🎬 B-Roll & Creative Visuals Feature

**Added**: January 2026

The backend Director now creates more dynamic, professional storyboards by mixing character scenes with B-roll shots.

---

## 📚 Overview

### What Changed?

Instead of showing your character in every single scene, the Director now intelligently mixes:

- **~40% Character Scenes** - Your main person visible, talking, doing activities
- **~60% B-Roll Scenes** - Objects, environments, details, atmosphere (NO character visible)

This creates a more professional, engaging video that mimics real YouTube editing with cutaways and B-roll footage.

---

## 🎯 What is B-Roll?

**B-roll** refers to supplemental footage that:
- Shows what's being discussed, not who's discussing it
- Provides visual variety and interest
- Covers cuts and transitions
- Adds professional polish to videos
- Keeps viewers engaged with changing visuals

### Examples of B-Roll Scenes

#### Object Close-ups
```
- Phone screen lighting up on a desk
- Coffee cup steaming
- Keyboard being typed on
- Book pages turning
- Clock showing time passing
- Notebook with handwritten notes
```

#### Environmental Shots
```
- Empty street at dawn
- Rain streaming down a window
- City skyline at sunset
- Park bench under a tree
- Bedroom at night
- Office space with natural light
```

#### Detail Shots (Hands/Feet Only)
```
- Hands typing (no face shown)
- Feet walking down a street
- Hand reaching for a door handle
- Fingers scrolling on phone
- Hands holding a coffee cup
```

#### Atmospheric/Symbolic
```
- Shadows on a wall
- Reflections in water
- Light streaming through window
- Weather transitions
- Clouds moving across sky
```

---

## 🔍 Technical Implementation

### How to Detect B-Roll Scenes

B-roll scenes have an **empty `characters` array**:

```javascript
// Character Scene
{
  "sentence_text": "I felt overwhelmed with work.",
  "visual_prompt": {
    "characters": [{
      "role": "main_character",
      "expression": { "primary": "stressed" },
      "pose": { "stance": "seated", "hand_position": "on_forehead" }
    }],
    "setting": "home office with laptop",
    "props": ["laptop", "coffee_cup", "papers"]
  }
}

// B-Roll Scene (NO character)
{
  "sentence_text": "Deadlines were piling up.",
  "visual_prompt": {
    "characters": [],  // ← Empty!
    "setting": "close-up of calendar with multiple red X marks and deadline notes, harsh overhead lighting",
    "props": ["calendar", "red_marker", "sticky_notes", "deadline_dates"]
  }
}
```

### Detecting in Code

```javascript
const isBRoll = !scene.visual_prompt?.characters || 
                scene.visual_prompt.characters.length === 0;

if (isBRoll) {
  // Show B-roll UI
  console.log('B-Roll scene - no character');
} else {
  // Show character UI
  console.log('Character scene');
}
```

---

## 🎨 UI Implementation

### Scene Card Badge

Each scene now displays a badge to indicate its type:

```javascript
{isBRoll ? (
  <Badge className="bg-orange-500">
    <Camera className="w-3 h-3 mr-1" />
    B-Roll
  </Badge>
) : (
  <Badge className="bg-blue-500">
    <User className="w-3 h-3 mr-1" />
    Character
  </Badge>
)}
```

**Visual Result:**
```
┌────────────────────────────────┐
│ Scene 1  [👤 Character]    [❤️] │
├────────────────────────────────┤
│ [Image of person talking]      │
│                                │
│ "Welcome to my channel."       │
└────────────────────────────────┘

┌────────────────────────────────┐
│ Scene 2  [📷 B-Roll]       [❤️] │
├────────────────────────────────┤
│ [Image of coffee cup steaming] │
│                                │
│ "Let's discuss productivity."  │
└────────────────────────────────┘
```

---

### Details Display

#### Character Scene Details
```
Style
• Art Style: professional_youtube_style
• Lighting: natural_lighting

Characters
• Role: main_character
• Expression: confident_calm
• Pose: seated, hands_on_desk

Composition
• Camera Angle: medium_shot
• Framing: centered
```

#### B-Roll Scene Details
```
Style
• Art Style: professional_youtube_style
• Lighting: warm_golden_hour

🎬 B-Roll Scene
This scene focuses on environmental, atmospheric, or detail
shots without the main character visible.

Visual Focus
Close-up of steaming coffee cup on wooden desk with morning
light streaming from window

Key Elements
[coffee_cup] [steam] [desk] [window_light] [morning_sun]

Composition
• Camera Angle: extreme_close_up
• Framing: tight_detail_shot
```

---

## 📝 Scene Examples

### Typical Storyboard Mix

For a 10-scene video about productivity:

```
1. [👤 Character] "Welcome to my channel..."
2. [📷 B-Roll] Coffee cup on desk (intro atmosphere)
3. [👤 Character] "Today we're discussing productivity..."
4. [📷 B-Roll] Clock showing early morning time
5. [👤 Character] "First tip: wake up early."
6. [📷 B-Roll] Sunrise through window
7. [👤 Character] "Second tip: plan your day..."
8. [📷 B-Roll] Notebook with to-do list
9. [👤 Character] "Third tip: take breaks..."
10. [📷 B-Roll] Empty chair by window (break time)
```

**Result**: 40% character (scenes 1, 3, 5, 7, 9), 60% B-roll (scenes 2, 4, 6, 8, 10)

---

## ✏️ Editing B-Roll Scenes

### What Works for B-Roll Edits

```javascript
// Good B-roll edits
await editScene(sceneId, "zoom in closer on the coffee cup");
await editScene(sceneId, "add more steam and warmth");
await editScene(sceneId, "change to nighttime with city lights");
await editScene(sceneId, "make it look like early morning");
await editScene(sceneId, "add rain on the window");
await editScene(sceneId, "show hands typing instead");
```

### What Won't Work

The system is smart - if a scene is B-roll, edits won't try to force a character in:

```javascript
// These will be ignored or adjusted for B-roll:
await editScene(sceneId, "make the character smile");
// → Will stay B-roll, might add human element like hands

await editScene(sceneId, "change character's expression");
// → Will ignore, keeping scene as B-roll
```

**To Convert B-Roll to Character Scene:**
You'd need to regenerate from scratch with explicit instructions:
```javascript
await editScene(sceneId, "show main character sitting at desk with this coffee cup");
```

---

## 🎥 Video Animation with B-Roll

B-roll scenes animate beautifully into videos! They work exactly the same as character scenes:

```javascript
// Animate any scene (character or B-roll)
await animateScene(sceneId);

// B-roll videos are typically:
// - Slower paced
// - More atmospheric
// - Focused on objects/environment
// - 6-8 seconds each
```

**Example B-Roll Video Motion:**
- Coffee steam rising slowly
- Calendar pages flipping
- Rain streaming down window
- Sun moving across sky
- Shadows shifting on wall

---

## 💡 Why This Improves Your Videos

### 1. Visual Variety
Prevents viewer fatigue from seeing the same person constantly.

### 2. Professional Polish
Real YouTube videos use B-roll extensively - this mimics that.

### 3. Better Storytelling
Shows what you're talking about, not just who's talking.

### 4. Smoother Pacing
Gives viewers' eyes something new to look at every few seconds.

### 5. Engagement
Dynamic visuals keep people watching longer.

### 6. Context
Visual metaphors and details enhance the narrative.

---

## 📊 Statistics

From a typical storyboard:

```javascript
const stats = scenes.reduce((acc, scene) => {
  const isBRoll = !scene.visual_prompt?.characters || 
                  scene.visual_prompt.characters.length === 0;
  
  if (isBRoll) {
    acc.broll++;
  } else {
    acc.character++;
  }
  return acc;
}, { broll: 0, character: 0 });

console.log(`Character scenes: ${stats.character} (${(stats.character/scenes.length*100).toFixed(0)}%)`);
console.log(`B-roll scenes: ${stats.broll} (${(stats.broll/scenes.length*100).toFixed(0)}%)`);
```

**Expected Output:**
```
Character scenes: 4 (40%)
B-roll scenes: 6 (60%)
```

---

## 🧪 Testing

### Test the Feature

1. Generate a new storyboard with at least 10 scenes
2. Check the badges - should see mix of "Character" and "B-Roll"
3. Open details on a B-roll scene
4. Verify it shows:
   - ✅ B-Roll indicator
   - ✅ Visual Focus description
   - ✅ Key Elements badges
   - ✅ No character information
5. Try editing a B-roll scene with environment changes
6. Animate a B-roll scene and verify video generates

### Sample Test Script

```
"Welcome to my productivity guide. Today I'll share three simple tips 
that transformed my daily routine. First, I started waking up at 5 AM 
every morning. The quiet hours before sunrise are perfect for deep work. 
Second, I began planning my day the night before. This simple habit saves 
so much mental energy. Third, I learned to take proper breaks. Your brain 
needs rest to stay productive. These three changes made all the difference 
for me."
```

**Expected**: 
- ~4 character scenes (person talking, explaining)
- ~6 B-roll scenes (clock, sunrise, notebook, relaxing scene, etc.)

---

## 🐛 Troubleshooting

### Issue: All scenes are character scenes
**Solution**: Script might be too dialogue-heavy. The Director creates B-roll for:
- Descriptive passages
- Environmental descriptions
- Object mentions
- Time passages
- Mood setting

### Issue: B-roll details not showing
**Solution**: Check that:
- `scene.visual_prompt.setting` exists
- `scene.visual_prompt.props` exists
- UI is checking `isBRoll` correctly

### Issue: B-roll scene has character data
**Solution**: This shouldn't happen, but if it does, check backend logs. The Director should set `characters: []` for B-roll.

---

## 📚 Related Documentation

- `NEW_FEATURES.md` - Scene editing and approval
- `EDIT_ASSISTANT_FEATURE.md` - Edit suggestions for both scene types
- Backend API docs - B-roll scene structure

---

## 🎬 Best Practices for Users

When reviewing generated scenes:

1. **Don't force characters into B-roll** - Let B-roll be B-roll
2. **Edit B-roll for atmosphere** - Focus on mood, lighting, details
3. **Use B-roll edits for pacing** - Slow down or speed up visual rhythm
4. **Animate B-roll for variety** - Mix static character shots with dynamic B-roll videos

---

**Summary**: B-roll scenes add professional polish and visual variety to your videos by showing objects, environments, and details instead of always showing the character. The UI automatically detects and displays these differently, with appropriate badges, information, and editing suggestions.

🎥 **Your videos just got 10x more dynamic!** 🚀
