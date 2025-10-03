import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Search as SearchIcon, Filter, ArrowLeft, Loader2, X, Check } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";

interface Video {
  id: string;
  title: string;
  duration: string;
  views: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
}

const Search = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [searchTerm, setSearchTerm] = useState(query);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [durationFilter, setDurationFilter] = useState<string>("any");
  const [sortBy, setSortBy] = useState<string>("relevance");
  
  // Animation states
  const [isFocused, setIsFocused] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showClearButton, setShowClearButton] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Animation handlers
  const handleInputFocus = () => {
    setIsFocused(true);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsTyping(true);
    setShowClearButton(value.length > 0);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing animation after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
    
    // Generate suggestions based on input
    generateSuggestions(value);
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setShowClearButton(false);
    setIsTyping(false);
    setShowSuggestions(false);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const generateSuggestions = (input: string) => {
    if (input.length < 2) {
      setSuggestions([]);
      return;
    }
    
    // Mock suggestions - in a real app, these would come from an API
    const mockSuggestions = [
      `${input} tutorial`,
      `${input} review`,
      `${input} guide`,
      `${input} tips`,
      `${input} 2024`
    ].filter(s => s.toLowerCase().includes(input.toLowerCase()));
    
    setSuggestions(mockSuggestions.slice(0, 5));
  };

  // Search YouTube videos
  const searchVideos = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearchSuccess(false);
    console.log("Starting search for:", searchQuery);
    
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      console.log("API Key exists:", !!apiKey);
      console.log("API Key value:", apiKey ? `${apiKey.substring(0, 10)}...` : "undefined");
      console.log("All env vars:", import.meta.env);
      
      if (!apiKey) {
        toast.error("YouTube API key not configured");
        console.error("YouTube API key not found in environment variables");
        return;
      }

      // Build search parameters
      const params = new URLSearchParams({
        part: 'snippet',
        type: 'video',
        q: searchQuery,
        maxResults: '20',
        order: sortBy,
        key: apiKey
      });

      if (durationFilter && durationFilter !== 'any') {
        params.append('videoDuration', durationFilter);
      }

             const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`);

             if (!response.ok) {
               if (response.status === 403) {
                 toast.error("YouTube API quota exceeded. Try again tomorrow.");
                 return;
               }
               throw new Error('YouTube API request failed');
             }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        setVideos([]);
        toast.info("No videos found for your search");
        return;
      }

      // Get video details for duration and view count
      const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${apiKey}`
      );
      
      const detailsData = await detailsResponse.json();
      
      // Format videos with enhanced data
      const formattedVideos: Video[] = data.items.map((item: any) => {
        const details = detailsData.items.find((d: any) => d.id === item.id.videoId);
        const duration = details?.contentDetails?.duration || 'PT0S';
        const viewCount = details?.statistics?.viewCount || '0';
        
        return {
          id: item.id.videoId,
          title: item.snippet.title,
          duration: formatDuration(duration),
          views: formatViewCount(viewCount),
          thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
          channelTitle: item.snippet.channelTitle,
          publishedAt: item.snippet.publishedAt
        };
      });

      setVideos(formattedVideos);
      setSearchSuccess(true);
      setShowSuggestions(false);
      
      // Reset success state after animation
      setTimeout(() => setSearchSuccess(false), 2000);
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Failed to search videos. Please try again.");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  // Format YouTube duration (PT4M13S -> 4:13)
  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';
    
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format view count (1234567 -> 1.2M)
  const formatViewCount = (count: string): string => {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  // Search when component mounts or query changes
  useEffect(() => {
    if (query) {
      searchVideos(query);
    }
  }, [query, sortBy, durationFilter]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Add error boundary
  if (!query) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">No search query provided</h1>
          <Link to="/">
            <Button>Go back to home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchVideos(searchTerm);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="glass-header sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  ref={searchInputRef}
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  placeholder="Search for topics..."
                  className={`pl-12 pr-10 h-10 bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                    isFocused ? 'search-focus-glow' : ''
                  } ${isTyping ? 'search-typing-pulse' : ''}`}
                />
                
                {/* Clear Button */}
                {showClearButton && (
                  <button
                    onClick={handleClearSearch}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-secondary/50 transition-all duration-200 search-clear-slide show`}
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                
                {/* Auto-suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className={`absolute top-full left-0 right-0 mt-2 bg-card/90 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg z-50 suggestions-dropdown show`}>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setSearchTerm(suggestion);
                          setShowSuggestions(false);
                          searchVideos(suggestion);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-secondary/50 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                      >
                        <SearchIcon className="inline h-3 w-3 mr-2 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <Button 
                variant="default" 
                onClick={() => searchVideos(searchTerm)} 
                disabled={loading}
                className={`btn-glass transition-all duration-300 ${
                  searchSuccess ? 'search-button-success' : ''
                }`}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : searchSuccess ? (
                  <Check className="h-4 w-4" />
                ) : (
                  "Search"
                )}
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Clean Filters Sidebar with Glass */}
          <aside className="w-64 flex-shrink-0">
            <div className="card-glass sticky top-24">
              <h2 className="font-semibold text-lg mb-6 text-foreground">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Duration</label>
                  <Select value={durationFilter} onValueChange={setDurationFilter}>
                    <SelectTrigger className="bg-card/50 backdrop-blur-sm">
                      <SelectValue placeholder="Any duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any duration</SelectItem>
                      <SelectItem value="short">Under 4 minutes</SelectItem>
                      <SelectItem value="medium">4-20 minutes</SelectItem>
                      <SelectItem value="long">Over 20 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block text-foreground">Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="bg-card/50 backdrop-blur-sm">
                      <SelectValue placeholder="Relevance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="date">Upload date</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="viewCount">Most views</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </aside>

          {/* Clean Results with Glass Cards */}
          <main className="flex-1">
            <div className="mb-8">
              <h1 className="text-2xl font-semibold mb-2 text-foreground">Search Results</h1>
              <p className="text-muted-foreground">
                {loading ? "Searching..." : `${videos.length} videos found for "${query}"`}
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4 glow-subtle" />
                  <p className="text-muted-foreground">Searching YouTube...</p>
                </div>
              </div>
            ) : videos.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 glow-subtle">
                  <SearchIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">No videos found</h3>
                <p className="text-muted-foreground">Try a different search term or adjust your filters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {videos.map((video) => (
                  <Link key={video.id} to={`/video/${video.id}`}>
                    <div className="card-glass hover:bg-secondary/20 transition-all duration-200">
                      <div className="flex gap-4">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-48 h-28 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground">{video.title}</h3>
                          <p className="text-sm text-primary mb-2">{video.channelTitle}</p>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{video.views} views</span>
                            <span>{video.duration}</span>
                            <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Search;
