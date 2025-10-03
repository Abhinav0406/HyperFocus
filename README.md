# YouTube Data API Explorer

A modern web application for exploring YouTube videos, managing notes, and analyzing video data using the YouTube Data API v3.

## 🚀 Features

- **Video Search**: Search and discover YouTube videos
- **Video Details**: View comprehensive video information
- **Comments System**: Load and view video comments
- **Related Videos**: Discover related content
- **Notes Management**: Save and manage personal notes for videos
- **Timestamps**: Add timestamped notes while watching
- **User Dashboard**: View your saved notes and watch history
- **Channel Information**: Explore channel details and playlists
- **Responsive Design**: Modern UI with dark/light theme support

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API**: YouTube Data API v3
- **State Management**: React Context + Hooks

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- YouTube Data API key
- Supabase account

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd joystream-labs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# YouTube API Configuration
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

### 4. Database Setup

Run the Supabase migrations to set up the database schema:

```bash
# If using Supabase CLI
supabase db reset
```

### 5. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to view the application.

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── contexts/           # React contexts (Auth, etc.)
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
└── lib/                # Utility functions
```

## 🔧 API Usage & Costs

### YouTube Data API Quotas

- **Free Tier**: 10,000 units/day
- **Search**: 100 units per request
- **Video Details**: 1 unit per request
- **Comments**: 1 unit per request

### Cost Optimization

- Implement caching for frequently accessed data
- Use lazy loading for comments and related videos
- Batch requests when possible
- Monitor usage in Google Cloud Console

## 🗄️ Database Schema

### Tables

- `profiles` - User profile information
- `video_notes` - User's saved notes for videos
- `video_timestamps` - Timestamped notes
- `watch_history` - User's video watch history
- `video_summaries` - AI-generated video summaries

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### Other Platforms

The app can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- YouTube Data API v3
- Supabase for backend services
- shadcn/ui for beautiful components
- Tailwind CSS for styling

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Include error messages and steps to reproduce

---

**Note**: This project requires valid API keys for YouTube Data API and Supabase to function properly.