# Hyper Focus

A powerful productivity application designed to help you maintain deep focus while consuming educational content. Hyper Focus combines YouTube video analysis with intelligent note-taking and timestamp management to enhance your learning experience.

## 🎯 What is Hyper Focus?

Hyper Focus is a modern web application that transforms how you interact with educational content. It's designed for students, professionals, and lifelong learners who want to extract maximum value from video content through structured note-taking and focused analysis.

## ✨ Key Features

### 🎥 **Smart Video Analysis**
- **Intelligent Search**: Find relevant educational content quickly
- **Video Insights**: Comprehensive video details and statistics
- **Related Content**: Discover connected videos and topics
- **Channel Exploration**: Deep dive into educational channels

### 📝 **Advanced Note-Taking**
- **Real-time Notes**: Take notes while watching videos
- **Timestamp Management**: Link notes to specific video moments
- **Smart Organization**: Automatically categorize and tag notes
- **Search & Filter**: Find your notes instantly

### 🧠 **Focus Enhancement**
- **Distraction-Free Interface**: Clean, minimal design for deep focus
- **Progress Tracking**: Monitor your learning journey
- **Goal Setting**: Set and track learning objectives
- **Analytics**: Understand your learning patterns

### 👤 **Personal Dashboard**
- **Note Library**: Access all your saved notes
- **Watch History**: Track your learning progress
- **Achievement System**: Celebrate learning milestones
- **Export Options**: Download notes for offline study

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API Integration**: YouTube Data API v3
- **State Management**: React Context + Hooks

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- YouTube Data API key
- Supabase account

### Installation

1. **Clone the Repository**
```bash
git clone <your-repo-url>
cd hyper-focus
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Setup**
Create a `.env.local` file:
```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# YouTube API Configuration
VITE_YOUTUBE_API_KEY=your_youtube_api_key
```

4. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:5173` to start focusing!

## 🎯 How Hyper Focus Works

### 1. **Discover Content**
Search for educational videos using intelligent filters and recommendations.

### 2. **Deep Dive**
Watch videos in a distraction-free environment designed for learning.

### 3. **Take Smart Notes**
Capture insights with timestamp-linked notes that stay connected to specific moments.

### 4. **Organize & Review**
Access your notes library, search through your insights, and track your learning progress.

### 5. **Achieve Goals**
Set learning objectives and celebrate milestones as you build your knowledge base.

## 📊 API Usage & Optimization

### YouTube Data API Quotas
- **Free Tier**: 10,000 units/day
- **Search**: 100 units per request
- **Video Details**: 1 unit per request
- **Comments**: 1 unit per request

### Smart Optimization
- Intelligent caching reduces API calls
- Lazy loading for better performance
- Batch requests for efficiency
- Usage monitoring and alerts

## 🗄️ Data Architecture

### Core Tables
- `profiles` - User profiles and preferences
- `video_notes` - Timestamped learning notes
- `video_timestamps` - Precise moment markers
- `watch_history` - Learning journey tracking
- `learning_goals` - Personal objectives and progress

## 🚀 Deployment

### Quick Deploy with Vercel
1. Connect your GitHub repository
2. Add environment variables
3. Deploy with one click

### Other Platforms
Hyper Focus works on any modern hosting platform:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🎯 Use Cases

### 📚 **Students**
- Take structured notes during online lectures
- Create study materials from video content
- Track learning progress across subjects

### 💼 **Professionals**
- Extract insights from training videos
- Build knowledge repositories
- Share learning resources with teams

### 🧑‍🎓 **Lifelong Learners**
- Organize learning from various sources
- Create personal knowledge bases
- Track skill development over time

## 🤝 Contributing

We welcome contributions to make Hyper Focus even better!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- YouTube Data API v3 for content access
- Supabase for robust backend services
- shadcn/ui for beautiful, accessible components
- Tailwind CSS for efficient styling
- The learning community for inspiration

## 📞 Support & Community

- 📖 **Documentation**: Check our comprehensive guides
- 🐛 **Issues**: Report bugs and request features
- 💬 **Discussions**: Join our community conversations
- 📧 **Contact**: Reach out for support

---

**Ready to achieve hyper focus in your learning journey?** 🚀

Start building your knowledge base today with Hyper Focus.