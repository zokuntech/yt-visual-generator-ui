# YouTube Visual Generator UI

A beautiful, modern React application for generating AI-powered visual storyboards from YouTube scripts. Built with React, Vite, Tailwind CSS, and shadcn/ui.

## Features

✨ **Drag & Drop File Upload** - Easy .doc/.docx file upload or paste script text  
🤖 **AI-Powered** - Automatic visual prompt generation  
🎨 **Custom Style Control** - Choose art style, lighting, colors, and more  
🎬 **B-Roll Support** - Dynamic mix of character scenes and B-roll footage  
💰 **Live Cost Tracking** - Real-time AI API cost monitoring  
📊 **Real-time Progress** - Live status updates during generation  
🔄 **Smart Editing** - AI-powered suggestions and instruction refinement  
❤️ **Scene Approval** - Mark favorite scenes you want to keep  
🎥 **Video Animation** - Turn images into 8-second videos with Veo 3.1  
📱 **Mobile Responsive** - Works great on all devices  
⚡ **Fast & Modern** - Built with Vite and Tailwind CSS  

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Lucide React** - Beautiful icon library
- **Mammoth.js** - .docx file parsing

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend URL (Optional)

Create a `.env` file:

```bash
cp .env.example .env
```

Edit `.env` if your backend is not running on `http://localhost:8000`:

```
VITE_API_URL=http://your-backend-url:8000
```

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

### 4. Make Sure Backend is Running

Ensure your backend API is running at `http://localhost:8000`

## How to Use - Wizard Experience

The app now uses a 4-step wizard flow for better control:

### Step 1: Upload Script
- Click or drag & drop your .doc/.docx file
- (Optional) Click "Customize Visual Style" to configure:
  - Art style (realistic, anime, cartoon, etc.)
  - Lighting (natural, dramatic, studio, etc.)
  - Color palette (warm, vibrant, muted, etc.)
  - Background, character description, camera angles
  - Aspect ratio (16:9, 9:16, 1:1, etc.)

### Step 2: Review Director's Plans ⭐ NEW!
- AI Director analyzes your script's narrative structure
- See emotional tone, energy level, camera intent for each scene
- View props and setting recommendations
- **Approve** to continue to generation

### Step 3: Generate Visuals
- Watch as AI creates detailed prompts and images
- Real-time progress updates
- See cost accumulating

### Step 4: View Results
- Browse your completed storyboard
- See total cost breakdown
- Regenerate individual scenes
- Create new storyboard

## Key Features

### 🎬 B-Roll & Dynamic Visuals

The AI Director automatically creates a professional mix of:
- **~40% Character Scenes** - Main person visible, talking, doing activities
- **~60% B-Roll Scenes** - Objects, environments, details (no character)

**B-roll scenes include:**
- Object close-ups (coffee cup, phone, keyboard)
- Environmental shots (sunrise, rain on window, empty street)
- Detail shots (hands typing, feet walking)
- Atmospheric visuals (shadows, reflections, weather)

Each scene is clearly labeled with a badge: 👤 Character or 📷 B-Roll

### ✏️ Smart Scene Editing

Click "Edit" on any scene to:
- **View AI Suggestions** - See what can be changed (pose, setting, lighting, camera)
- **Refine Instructions** - Turn "make it better" into specific edits
- **Apply Changes** - Regenerate with your edits

Example edits:
- "make the character smile warmly"
- "change setting to coffee shop"  
- "zoom in closer on the coffee cup" (for B-roll)
- "add dramatic lighting"

### 🎥 Video Animation

Turn any scene into an 8-second video:
- Powered by Google Veo 3.1
- Works for both character and B-roll scenes
- Takes 30s - 6min to generate
- Cost: ~$0.09 per video

### 💰 Live Cost Tracking

Watch costs update in real-time:
- AI Prompts (GPT-4)
- AI Images (Gemini)
- AI Videos (Veo 3.1)
- Per-scene breakdown
- Total job cost

## Project Structure

```
src/
├── components/
│   ├── ui/                # shadcn/ui components
│   │   ├── button.jsx
│   │   ├── card.jsx
│   │   ├── badge.jsx
│   │   └── progress.jsx
│   ├── FileUpload.jsx     # File upload component
│   ├── StyleConfig.jsx    # Style customization UI
│   ├── CostDisplay.jsx    # Cost tracking display
│   ├── StatusBar.jsx      # Progress indicator
│   ├── SceneGrid.jsx      # Grid layout for scenes
│   └── SceneCard.jsx      # Individual scene card
├── lib/
│   └── utils.js          # Utility functions
├── App.jsx               # Main application
├── main.jsx              # Entry point
└── index.css             # Global styles + Tailwind
```

## shadcn/ui Components

This project uses the following shadcn/ui components:

- **Button** - Interactive buttons with variants
- **Card** - Container component for content
- **Badge** - Status indicators
- **Progress** - Progress bar for job status

To add more shadcn/ui components, visit [ui.shadcn.com](https://ui.shadcn.com) and follow the installation instructions.

## API Integration

This UI integrates with the YT Visual Generator Backend API:

- `POST /jobs` - Create new job
- `GET /jobs/{id}` - Check job status
- `GET /scenes/job/{id}` - Get all scenes
- `POST /scenes/{id}/regenerate-image` - Regenerate image

For more details, see the [integration guide](context.md).

## Building for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## Customization

### Colors

Edit the theme colors in `tailwind.config.js` and `src/index.css` to customize the color scheme.

### Components

All UI components are in `src/components/ui/` and can be easily customized using Tailwind classes.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### "Failed to create job" error
- Make sure the backend is running
- Check that the backend URL is correct in `.env`

### Images not displaying
- The backend returns base64 data URIs - they should display automatically
- Check browser console for errors

### File upload not working
- Only .doc and .docx files are supported
- Max file size is 10MB

### Styling issues
- Make sure Tailwind CSS is properly configured
- Run `npm install` to ensure all dependencies are installed

## License

MIT

## Support

For questions about the backend API, see [context.md](context.md) or contact the backend team.

---

**Built with ❤️ using React, Tailwind CSS, and shadcn/ui**
