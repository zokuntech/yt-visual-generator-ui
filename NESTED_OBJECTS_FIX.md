# Nested Objects Fix - React Rendering Error

## The Problem

The UI was crashing with this error when viewing scene details:

```
Uncaught Error: Objects are not valid as a React child 
(found: object with keys {primary, micro_expression, eye_focus})
```

## Root Cause

The **backend changed the data structure** for `expression` and `pose` fields in the character objects:

### Old Structure (String)
```json
{
  "characters": [
    {
      "role": "main_subject",
      "description": "...",
      "expression": "confident_calm",  // ← String
      "pose": "front_facing"           // ← String
    }
  ]
}
```

### New Structure (Nested Object)
```json
{
  "characters": [
    {
      "role": "main_subject",
      "description": "...",
      "expression": {                   // ← Object!
        "primary": "confident_calm",
        "micro_expression": "slight_smile",
        "eye_focus": "camera"
      },
      "pose": {                          // ← Object!
        "body_language": "relaxed",
        "hand_position": "natural_sides",
        "stance": "grounded"
      }
    }
  ]
}
```

## Why It Failed

The UI code was trying to render these objects directly:

```jsx
{char.expression && <p><strong>Expression:</strong> {char.expression}</p>}
```

React cannot render plain JavaScript objects as children. It threw an error because `char.expression` was now an object with keys `{primary, micro_expression, eye_focus}` instead of a string.

## The Fix

Updated `SceneCard.jsx` to detect whether the field is a string or object, and render accordingly:

```jsx
{/* Handle expression (can be string or object) */}
{char.expression && (
  <div>
    <strong>Expression:</strong>
    {typeof char.expression === 'string' ? (
      <span> {char.expression}</span>
    ) : (
      <ul className="ml-4 mt-1 space-y-0.5">
        {char.expression.primary && <li>• {char.expression.primary}</li>}
        {char.expression.micro_expression && <li>• Micro: {char.expression.micro_expression}</li>}
        {char.expression.eye_focus && <li>• Eyes: {char.expression.eye_focus}</li>}
      </ul>
    )}
  </div>
)}

{/* Handle pose (can be string or object) */}
{char.pose && (
  <div>
    <strong>Pose:</strong>
    {typeof char.pose === 'string' ? (
      <span> {char.pose}</span>
    ) : (
      <ul className="ml-4 mt-1 space-y-0.5">
        {char.pose.body_language && <li>• Body: {char.pose.body_language}</li>}
        {char.pose.hand_position && <li>• Hands: {char.pose.hand_position}</li>}
        {char.pose.stance && <li>• Stance: {char.pose.stance}</li>}
      </ul>
    )}
  </div>
)}
```

## Benefits of This Approach

1. **Backward Compatible**: Still works if backend sends strings
2. **Type-Safe**: Checks the type before rendering
3. **Better UX**: Shows detailed breakdown of nested data
4. **No Crashes**: Gracefully handles both data structures

## How It Displays Now

**Old string format:**
```
Expression: confident_calm
Pose: front_facing
```

**New nested format:**
```
Expression:
  • confident_calm
  • Micro: slight_smile
  • Eyes: camera

Pose:
  • Body: relaxed
  • Hands: natural_sides
  • Stance: grounded
```

## Testing

To verify the fix works:

1. Upload a script
2. Wait for scenes to generate
3. Click "Show Details" on any scene
4. The character details should now display properly without crashing

## Lesson Learned

**When integrating with a backend API:**
- Always use optional chaining (`?.`) for nested properties
- Check types before rendering (`typeof value === 'string'`)
- Test with real backend data, not just mock data
- Handle both old and new data structures when possible (backward compatibility)

## Related Files

- `/src/components/SceneCard.jsx` - Fixed the rendering logic
- This fix applies to the character details section only
- Other fields (style, composition) were already safe

---

**Status:** ✅ Fixed - UI no longer crashes when viewing scene details
