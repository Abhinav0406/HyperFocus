import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoId, maxResults = 20, order = 'time' } = await req.json();
    
    if (!videoId) {
      throw new Error('Video ID is required');
    }

    const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY');
    if (!YOUTUBE_API_KEY) {
      throw new Error('YouTube API key not configured');
    }

    // Build YouTube API URL for comment threads
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=${maxResults}&order=${order}&key=${YOUTUBE_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const error = await response.json();
      if (response.status === 403) {
        throw new Error('YouTube API quota exceeded or comments disabled for this video');
      }
      throw new Error(error.error?.message || 'YouTube API request failed');
    }

    const data = await response.json();
    
    // Format comments for easier consumption
    const formattedComments = data.items?.map((thread: any) => ({
      id: thread.snippet.topLevelComment.snippet.id,
      authorDisplayName: thread.snippet.topLevelComment.snippet.authorDisplayName,
      authorProfileImageUrl: thread.snippet.topLevelComment.snippet.authorProfileImageUrl,
      textDisplay: thread.snippet.topLevelComment.snippet.textDisplay,
      likeCount: thread.snippet.topLevelComment.snippet.likeCount,
      publishedAt: thread.snippet.topLevelComment.snippet.publishedAt,
      totalReplyCount: thread.snippet.totalReplyCount
    })) || [];

    return new Response(
      JSON.stringify({ 
        comments: formattedComments,
        totalComments: formattedComments.length,
        videoId: videoId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in youtube-comments function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});



