import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Clock, FileText, Sparkles, Camera, MessageSquare, Loader2, Save, Users, Play, Globe } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import ChannelInfo from "@/components/ChannelInfo";
import PlaylistViewer from "@/components/PlaylistViewer";
import UserActivity from "@/components/UserActivity";
import LocalizationData from "@/components/LocalizationData";
import YouTubeAPIService from "@/services/youtubeAPI";

interface VideoDetails {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  viewCount: string;
  publishedAt: string;
  thumbnail: string;
}

interface Comment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  publishedAt: string;
  totalReplyCount?: number;
  replies?: Comment[];
}

interface CommentThread {
  id: string;
  snippet: {
    topLevelComment: {
      snippet: Comment;
    };
    totalReplyCount: number;
  };
}

type VideoNotes = Tables<'video_notes'>;
type VideoTimestamps = Tables<'video_timestamps'>;
type WatchHistory = Tables<'watch_history'>;

const Video = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [timestamps, setTimestamps] = useState<VideoTimestamps[]>([]);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [loadingRelatedVideos, setLoadingRelatedVideos] = useState(false);

  // Fetch video details (no login required)
  useEffect(() => {
    const fetchVideoDetails = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        // Fetch video details
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        if (!apiKey) {
          toast.error("YouTube API key not configured");
          return;
        }

        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${id}&key=${apiKey}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch video details');
        }

        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const video = data.items[0];
          setVideoDetails({
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            channelTitle: video.snippet.channelTitle,
            viewCount: formatViewCount(video.statistics.viewCount),
            publishedAt: video.snippet.publishedAt,
            thumbnail: video.snippet.thumbnails.medium?.url || video.snippet.thumbnails.default?.url
          });
          // Extract channel ID for additional features
          setChannelId(video.snippet.channelId);
        }

      } catch (error) {
        console.error('Error fetching video details:', error);
        toast.error("Failed to load video details");
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [id]);

  // Fetch user-specific data (only if logged in)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id || !user) return;

      try {
        // Fetch user's notes for this video
        const { data: notesData } = await supabase
          .from('video_notes')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', id)
          .single();

        if (notesData) {
          setNotes(notesData.content);
        }

        // Fetch user's timestamps for this video
        const { data: timestampsData } = await supabase
          .from('video_timestamps')
          .select('*')
          .eq('user_id', user.id)
          .eq('video_id', id)
          .order('timestamp_seconds', { ascending: true });

        if (timestampsData) {
          setTimestamps(timestampsData);
        }

        // Update watch history
        await updateWatchHistory();

      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [id, user]);

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

  // Update watch history
  const updateWatchHistory = async () => {
    if (!user || !id || !videoDetails) return;

    try {
      const { error } = await supabase
        .from('watch_history')
        .upsert({
          user_id: user.id,
          video_id: id,
          video_title: videoDetails.title,
          video_thumbnail: videoDetails.thumbnail,
          last_watched_at: new Date().toISOString(),
          progress_percentage: 0 // In production, get from video player
        });

      if (error) {
        console.error('Error updating watch history:', error);
      }
    } catch (error) {
      console.error('Error updating watch history:', error);
    }
  };

  // Save notes
  const saveNotes = async () => {
    console.log('saveNotes called with:', { 
      user: user?.id, 
      videoId: id, 
      videoTitle: videoDetails?.title,
      notesLength: notes.length,
      hasNotes: !!notes.trim(),
      loading: loading
    });

    // Check authentication state
    if (loading) {
      console.warn('Authentication still loading, please wait...');
      toast.error("Please wait for authentication to complete");
      return;
    }

    if (!user) {
      console.error('No user found - authentication may have failed');
      toast.error("Please log in to save notes. If you're already logged in, try refreshing the page.");
      return;
    }

    if (!id) {
      console.error('No video ID found');
      toast.error("Video ID is missing");
      return;
    }

    if (!videoDetails) {
      console.error('No video details found');
      toast.error("Video details are not loaded");
      return;
    }

    if (!notes.trim()) {
      console.warn('No notes content to save');
      toast.error("Please enter some notes before saving");
      return;
    }

    setSaving(true);
    try {
      console.log('Attempting to save notes to Supabase...');
      
      const { data, error } = await supabase
        .from('video_notes')
        .upsert({
          user_id: user.id,
          video_id: id,
          video_title: videoDetails.title,
          content: notes
        })
        .select();

      console.log('Supabase response:', { data, error });

      if (error) {
        console.error('Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error;
      }

      console.log('Notes saved successfully:', data);
      toast.success("Notes saved successfully!");
    } catch (error) {
      console.error('Error saving notes:', error);
      toast.error(`Failed to save notes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  // Add timestamp
  const addTimestamp = async () => {
    if (!user || !id || !videoDetails) {
      toast.error("Please log in to add timestamps");
      return;
    }

    const currentTime = 0; // In production, get from video player
    const note = prompt("Add a note for this timestamp:");
    
    if (!note) return;

    try {
      const { error } = await supabase
        .from('video_timestamps')
        .insert({
          user_id: user.id,
          video_id: id,
          timestamp_seconds: currentTime,
          note: note
        });

      if (error) {
        throw error;
      }

      toast.success("Timestamp added successfully!");
    } catch (error) {
      console.error('Error adding timestamp:', error);
      toast.error(`Failed to add timestamp: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to format timestamp
  const formatTimestamp = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const generateSummary = () => {
    toast.info("Generating AI summary...");
    // In production, call AI API
  };

  // Test Supabase connection
  const testConnection = async () => {
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('Connection test result:', { data, error });
      
      if (error) {
        toast.error(`Connection failed: ${error.message}`);
      } else {
        toast.success("Supabase connection successful!");
      }
    } catch (error) {
      console.error('Connection test error:', error);
      toast.error(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Debug authentication status
  const debugAuth = () => {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('User:', user);
    console.log('User ID:', user?.id);
    console.log('User Email:', user?.email);
    console.log('Loading:', loading);
    console.log('Session:', session);
    console.log('Profile:', profile);
    console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
    console.log('Has Supabase Key:', !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
    console.log('========================');
    
    toast.info(`Auth Status: ${user ? 'Logged In' : 'Not Logged In'} | Loading: ${loading}`);
  };

  // Test YouTube API key
  const testYouTubeAPI = async () => {
    try {
      console.log('Testing YouTube API key...');
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      
      if (!apiKey) {
        toast.error("YouTube API key not found in environment variables");
        return;
      }
      
      console.log('API Key exists:', !!apiKey);
      console.log('API Key preview:', apiKey.substring(0, 10) + '...');
      
      // Test with a simple API call
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${apiKey}`
      );
      
      console.log('YouTube API test response status:', response.status);
      
      if (response.ok) {
        toast.success("YouTube API key is working!");
      } else {
        const errorData = await response.json();
        console.error('YouTube API error:', errorData);
        toast.error(`YouTube API error: ${errorData.error?.message || response.status}`);
      }
    } catch (error) {
      console.error('YouTube API test error:', error);
      toast.error(`YouTube API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Fetch YouTube comments with optimized settings
  const fetchComments = async () => {
    if (!id) return;
    
    setLoadingComments(true);
    
    // Shorter timeout for faster feedback
    const timeoutId = setTimeout(() => {
      if (loadingComments) {
        console.warn('Comments loading timeout - forcing loading to false');
        setLoadingComments(false);
        toast.error("Comments loading timed out. Try loading fewer comments.");
      }
    }, 5000); // Reduced to 5 seconds
    
    try {
      console.log('Fetching comments for video:', id);
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        toast.error("YouTube API key not configured");
        clearTimeout(timeoutId);
        return;
      }

      // Optimized API call with fewer comments and better parameters
      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${id}&maxResults=5&order=relevance&key=${apiKey}`;
      console.log('API URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout to the fetch request itself
        signal: AbortSignal.timeout(8000) // 8 second timeout
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        if (response.status === 403) {
          toast.error("YouTube API quota exceeded. Try again later.");
        } else if (response.status === 400) {
          toast.error("Comments are disabled for this video or invalid video ID");
        } else if (response.status === 404) {
          toast.error("Video not found or comments disabled");
        } else {
          toast.error(`API Error: ${response.status} - ${response.statusText}`);
        }
        clearTimeout(timeoutId);
        return;
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      if (data.items && data.items.length > 0) {
        const formattedComments = data.items.map((thread: CommentThread) => ({
          id: thread.snippet.topLevelComment.snippet.id,
          authorDisplayName: thread.snippet.topLevelComment.snippet.authorDisplayName,
          authorProfileImageUrl: thread.snippet.topLevelComment.snippet.authorProfileImageUrl,
          textDisplay: thread.snippet.topLevelComment.snippet.textDisplay,
          likeCount: thread.snippet.topLevelComment.snippet.likeCount,
          publishedAt: thread.snippet.topLevelComment.snippet.publishedAt,
          totalReplyCount: thread.snippet.totalReplyCount
        }));
        
        console.log('Successfully formatted comments:', formattedComments.length);
        setComments(formattedComments);
        setNextPageToken(data.nextPageToken || null);
        setHasMoreComments(!!data.nextPageToken);
        toast.success(`Loaded ${formattedComments.length} comments successfully!`);
      } else {
        console.log('No comments found in response');
        toast.info("No comments found for this video");
        setComments([]);
        setHasMoreComments(false);
      }

    } catch (error) {
      console.error('Error fetching comments:', error);
      
      if (error instanceof Error) {
        if (error.name === 'TimeoutError') {
          toast.error("Request timed out. The video might have too many comments. Try again.");
        } else if (error.name === 'AbortError') {
          toast.error("Request was cancelled. Please try again.");
        } else {
          toast.error(`Error: ${error.message}`);
        }
      } else {
        toast.error("Unknown error occurred while loading comments");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoadingComments(false);
    }
  };

  // Load more comments function
  const loadMoreComments = async () => {
    if (!id || !nextPageToken || loadingComments) return;
    
    setLoadingComments(true);
    
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        toast.error("YouTube API key not configured");
        return;
      }

      const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${id}&maxResults=5&order=relevance&pageToken=${nextPageToken}&key=${apiKey}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(8000)
      });
      
      if (!response.ok) {
        toast.error(`Failed to load more comments: ${response.status}`);
        return;
      }

      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const newComments = data.items.map((thread: CommentThread) => ({
          id: thread.snippet.topLevelComment.snippet.id,
          authorDisplayName: thread.snippet.topLevelComment.snippet.authorDisplayName,
          authorProfileImageUrl: thread.snippet.topLevelComment.snippet.authorProfileImageUrl,
          textDisplay: thread.snippet.topLevelComment.snippet.textDisplay,
          likeCount: thread.snippet.topLevelComment.snippet.likeCount,
          publishedAt: thread.snippet.topLevelComment.snippet.publishedAt,
          totalReplyCount: thread.snippet.totalReplyCount
        }));
        
        setComments(prev => [...prev, ...newComments]);
        setNextPageToken(data.nextPageToken || null);
        setHasMoreComments(!!data.nextPageToken);
        toast.success(`Loaded ${newComments.length} more comments!`);
      } else {
        setHasMoreComments(false);
        toast.info("No more comments available");
      }

    } catch (error) {
      console.error('Error loading more comments:', error);
      toast.error("Failed to load more comments");
    } finally {
      setLoadingComments(false);
    }
  };

  // Fetch related videos
  const fetchRelatedVideos = async () => {
    if (!id) return;
    
    setLoadingRelatedVideos(true);
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (!apiKey) {
        toast.error("YouTube API key not configured");
        return;
      }

      const youtubeAPI = new YouTubeAPIService(apiKey);
      const relatedVideosData = await youtubeAPI.getRelatedVideos(id, 10);
      setRelatedVideos(relatedVideosData);
      toast.success(`Loaded ${relatedVideosData.length} related videos`);
    } catch (error) {
      console.error('Error fetching related videos:', error);
      toast.error("Failed to load related videos");
    } finally {
      setLoadingRelatedVideos(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Link to="/search?q=python">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to results
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Video Section */}
          <div className="lg:col-span-2">
            <Card className="p-4 mb-6">
              {loading ? (
                <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              ) : videoDetails ? (
                <>
                  <div className="aspect-video bg-black rounded-lg mb-4">
                    <iframe
                      className="w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${id}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">{videoDetails.title}</h1>
                  <p className="text-muted-foreground mb-2">{videoDetails.channelTitle}</p>
                  <p className="text-muted-foreground">
                    {videoDetails.viewCount} views • {new Date(videoDetails.publishedAt).toLocaleDateString()}
                  </p>
                </>
              ) : (
                <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                  <p className="text-white">Video not found</p>
                </div>
              )}
            </Card>

            {/* Enhanced Content Section */}
            <Card className="p-6">
              <Tabs defaultValue="notes" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="comments">Comments</TabsTrigger>
                  <TabsTrigger value="channel">Channel</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="localization">Localization</TabsTrigger>
                </TabsList>
                
                <TabsContent value="notes" className="mt-4">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Your Notes
                  </h2>
                  
                  {user ? (
                    <>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Take notes while watching..."
                        className="min-h-[200px] mb-4"
                      />
                      <div className="flex gap-2">
                        <Button onClick={saveNotes} disabled={saving} className="flex-1">
                          <Save className="mr-2 h-4 w-4" />
                          {saving ? "Saving..." : "Save Notes"}
                        </Button>
                        <Button onClick={generateSummary} variant="outline">
                          <Sparkles className="mr-2 h-4 w-4" />
                          AI Summary
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Sign in to take notes</h3>
                      <p className="text-muted-foreground mb-4">
                        Create an account to save your notes and timestamps for this video.
                      </p>
                      <Link to="/auth">
                        <Button className="w-full">
                          Sign In to Continue
                        </Button>
                      </Link>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="comments" className="mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      Comments
                    </h2>
                    <Button 
                      onClick={fetchComments} 
                      disabled={loadingComments}
                      variant="outline"
                      size="sm"
                    >
                      {loadingComments ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Load Comments
                        </>
                      )}
                    </Button>
                  </div>
                  
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="ml-3 text-lg">Loading comments...</span>
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No comments loaded</h3>
                      <p className="text-muted-foreground mb-4">
                        Click "Load Comments" to fetch YouTube comments for this video.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-sm text-muted-foreground mb-4">
                        Showing {comments.length} comments
                        {hasMoreComments && " (more available)"}
                      </div>
                      <div className="max-h-[600px] overflow-y-auto space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="border rounded-lg p-4 bg-card/50">
                            <div className="flex gap-3">
                              <img 
                                src={comment.authorProfileImageUrl} 
                                alt={comment.authorDisplayName}
                                className="w-10 h-10 rounded-full flex-shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://via.placeholder.com/40x40/666/fff?text=?';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="font-semibold text-sm">{comment.authorDisplayName}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(comment.publishedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div 
                                  className="text-sm text-foreground mb-3 leading-relaxed" 
                                  dangerouslySetInnerHTML={{ __html: comment.textDisplay }} 
                                />
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    👍 {comment.likeCount || 0}
                                  </span>
                                  {comment.totalReplyCount && comment.totalReplyCount > 0 && (
                                    <span className="flex items-center gap-1">
                                      💬 {comment.totalReplyCount} replies
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Load More Button */}
                      {hasMoreComments && (
                        <div className="flex justify-center pt-4">
                          <Button 
                            onClick={loadMoreComments}
                            disabled={loadingComments}
                            variant="outline"
                            className="w-full"
                          >
                            {loadingComments ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading more...
                              </>
                            ) : (
                              <>
                                <MessageSquare className="mr-2 h-4 w-4" />
                                Load More Comments
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="channel" className="mt-4">
                  {channelId && import.meta.env.VITE_YOUTUBE_API_KEY ? (
                    <ChannelInfo 
                      channelId={channelId} 
                      apiKey={import.meta.env.VITE_YOUTUBE_API_KEY} 
                    />
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Channel Information</h3>
                      <p className="text-muted-foreground mb-4">
                        Channel information will be displayed here when available.
                      </p>
                      {!channelId && <p className="text-sm text-muted-foreground">Channel ID not found</p>}
                      {!import.meta.env.VITE_YOUTUBE_API_KEY && <p className="text-sm text-muted-foreground">YouTube API key not configured</p>}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="mt-4">
                  {import.meta.env.VITE_YOUTUBE_API_KEY ? (
                    <UserActivity apiKey={import.meta.env.VITE_YOUTUBE_API_KEY} />
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">User Activity</h3>
                      <p className="text-muted-foreground mb-4">
                        User activity features require YouTube API key configuration.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="localization" className="mt-4">
                  {import.meta.env.VITE_YOUTUBE_API_KEY ? (
                    <LocalizationData apiKey={import.meta.env.VITE_YOUTUBE_API_KEY} />
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Localization Data</h3>
                      <p className="text-muted-foreground mb-4">
                        Localization features require YouTube API key configuration.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Tools</h2>
              
              {/* Debug Info */}
              <div className="mb-4 p-3 bg-secondary/50 rounded-lg text-xs">
                <div className="font-semibold mb-1">Debug Info:</div>
                <div>User: {user ? `${user.email} (${user.id})` : 'Not logged in'}</div>
                <div>Video ID: {id || 'Missing'}</div>
                <div>Video Title: {videoDetails?.title || 'Not loaded'}</div>
                <div>Notes Length: {notes.length}</div>
                <div>Saving: {saving ? 'Yes' : 'No'}</div>
              </div>
              
              <div className="space-y-3">
                {user ? (
                  <>
                    <Button onClick={addTimestamp} variant="outline" className="w-full justify-start">
                      <Clock className="mr-2 h-4 w-4" />
                      Mark Timestamp
                    </Button>
                    <Button onClick={generateSummary} variant="outline" className="w-full justify-start">
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI Summary
                    </Button>
                    <Button onClick={testConnection} variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Test Connection
                    </Button>
                    <Button onClick={testYouTubeAPI} variant="outline" className="w-full justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Test YouTube API
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Camera className="mr-2 h-4 w-4" />
                      Screenshot
                    </Button>
                    <Button 
                      onClick={fetchComments} 
                      disabled={loadingComments}
                      variant="outline" 
                      className="w-full justify-start"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      {loadingComments ? "Loading..." : comments.length > 0 ? `Comments (${comments.length})` : "Load Comments"}
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Sign in to use interactive tools
                    </p>
                    <Link to="/auth">
                      <Button size="sm" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <Tabs defaultValue="timestamps">
                <TabsList className="w-full">
                  <TabsTrigger value="timestamps" className="flex-1">Timestamps</TabsTrigger>
                  <TabsTrigger value="related" className="flex-1">Related</TabsTrigger>
                </TabsList>
                <TabsContent value="timestamps" className="mt-4">
                  {user ? (
                    timestamps.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No timestamps yet. Click "Mark Timestamp" to add one.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {timestamps.map((ts) => (
                          <div key={ts.id} className="p-3 bg-secondary rounded-lg">
                            <span className="font-mono text-sm text-primary">
                              {formatTimestamp(ts.timestamp_seconds)}
                            </span>
                            <p className="text-sm mt-1">{ts.note || 'No note'}</p>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <div className="text-center py-4">
                      <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Sign in to view your timestamps
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="related" className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Related Videos</h3>
                      <Button
                        onClick={fetchRelatedVideos}
                        disabled={loadingRelatedVideos}
                        variant="outline"
                        size="sm"
                      >
                        {loadingRelatedVideos ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Load Related Videos
                          </>
                        )}
                      </Button>
                    </div>

                    {relatedVideos.length === 0 ? (
                      <div className="text-center py-8">
                        <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No related videos loaded</p>
                        <p className="text-sm text-muted-foreground">
                          Click "Load Related Videos" to fetch videos related to this one
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {relatedVideos.map((video) => (
                          <Link key={video.id} to={`/video/${video.id}`}>
                            <div className="flex gap-3 hover:bg-secondary/50 p-3 rounded-lg cursor-pointer transition-colors">
                              <img 
                                src={video.thumbnail} 
                                alt={video.title}
                                className="w-32 h-20 object-cover rounded flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-sm line-clamp-2 mb-1">{video.title}</h4>
                                <p className="text-xs text-muted-foreground mb-1">{video.channelTitle}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {video.viewCount && (
                                    <span>{new Intl.NumberFormat().format(parseInt(video.viewCount))} views</span>
                                  )}
                                  <span>•</span>
                                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                                  {video.duration && (
                                    <>
                                      <span>•</span>
                                      <span>{new YouTubeAPIService('').formatDuration(video.duration)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Video;
