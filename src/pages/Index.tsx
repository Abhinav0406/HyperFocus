import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Sparkles, History, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserProfile } from "@/components/UserProfile";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Clean Header with Glass Effect */}
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center glow-subtle">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">
              Hyper Focus
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                  <History className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
                <UserProfile />
              </>
            ) : (
              <Button variant="outline" onClick={() => navigate("/auth")}>
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Clean Hero Section */}
      <main className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-foreground leading-tight">
            Learn faster with
            <br />
            <span className="text-primary">AI-powered insights</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform any YouTube video into structured learning content. 
            Get instant summaries, key points, and intelligent timestamps.
          </p>

          {/* Clean Search Bar with Glass Effect */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for any topic..."
                  className="pl-12 h-12 text-lg border-border focus:border-primary bg-card/50 backdrop-blur-sm"
                />
              </div>
              <Button type="submit" className="btn-glass h-12 px-8">
                Search
              </Button>
            </div>
          </form>

          {/* Quick Topics */}
          <div className="flex flex-wrap gap-3 justify-center">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {["Machine Learning", "React", "Python", "Design", "Data Science"].map((topic) => (
              <Button
                key={topic}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery(topic);
                  navigate(`/search?q=${encodeURIComponent(topic)}`);
                }}
                className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 hover:shadow-md"
              >
                {topic}
              </Button>
            ))}
          </div>
        </div>
      </main>

      {/* Clean Features Grid with Glass Cards */}
      <section className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="card-glass">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-subtle">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Smart Discovery</h3>
            <p className="text-muted-foreground leading-relaxed">
              Find the most relevant educational content with AI-powered search and intelligent filtering.
            </p>
          </div>
          <div className="card-glass">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-subtle">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">AI Insights</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get instant summaries, key points, and intelligent timestamps from any video.
            </p>
          </div>
          <div className="card-glass">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 glow-subtle">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-3 text-foreground">Track Progress</h3>
            <p className="text-muted-foreground leading-relaxed">
              Save notes, mark timestamps, and build your personal learning knowledge base.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
