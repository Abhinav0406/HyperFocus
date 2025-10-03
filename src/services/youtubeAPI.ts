import {
  YouTubeChannel,
  YouTubePlaylist,
  YouTubePlaylistItem,
  YouTubeActivity,
  YouTubeSubscription,
  YouTubeLanguage,
  YouTubeRegion,
  YouTubeGuideCategory,
  YouTubeChannelSection
} from '../types/youtube';
import GoogleOAuthService from './googleOAuth';

class YouTubeAPIService {
  private apiKey: string;
  private oauthService: GoogleOAuthService;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.oauthService = new GoogleOAuthService();
  }

  // Helper method to make authenticated requests
  private async makeAuthenticatedRequest(url: string): Promise<Response> {
    const accessToken = await this.oauthService.getValidAccessToken();
    if (!accessToken) {
      throw new Error('No valid access token available. Please authenticate with Google.');
    }

    return fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });
  }

  // Channel Data Methods
  async getChannelInfo(channelId: string): Promise<YouTubeChannel | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Channel API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching channel info:', error);
      throw error;
    }
  }

  async getChannelSections(channelId: string): Promise<YouTubeChannelSection[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channelSections?part=snippet,contentDetails&channelId=${channelId}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Channel sections API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching channel sections:', error);
      throw error;
    }
  }

  // Playlist Data Methods
  async getPlaylists(channelId: string, maxResults: number = 20): Promise<YouTubePlaylist[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&channelId=${channelId}&maxResults=${maxResults}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Playlists API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching playlists:', error);
      throw error;
    }
  }

  async getPlaylistItems(playlistId: string, maxResults: number = 20): Promise<YouTubePlaylistItem[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Playlist items API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching playlist items:', error);
      throw error;
    }
  }

  async getPlaylistInfo(playlistId: string): Promise<YouTubePlaylist | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails,status&id=${playlistId}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Playlist info API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items?.[0] || null;
    } catch (error) {
      console.error('Error fetching playlist info:', error);
      throw error;
    }
  }

  // User Activity Methods (requires OAuth)
  async getUserActivities(maxResults: number = 20): Promise<YouTubeActivity[]> {
    try {
      const url = `https://www.googleapis.com/youtube/v3/activities?part=snippet,contentDetails&home=true&maxResults=${maxResults}`;
      const response = await this.makeAuthenticatedRequest(url);
      
      if (!response.ok) {
        throw new Error(`User activities API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching user activities:', error);
      throw error;
    }
  }

  async getUserSubscriptions(maxResults: number = 20): Promise<YouTubeSubscription[]> {
    try {
      const url = `https://www.googleapis.com/youtube/v3/subscriptions?part=snippet,contentDetails&mySubscriptions=true&maxResults=${maxResults}`;
      const response = await this.makeAuthenticatedRequest(url);
      
      if (!response.ok) {
        throw new Error(`User subscriptions API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      throw error;
    }
  }

  // Localization Data Methods
  async getLanguages(): Promise<YouTubeLanguage[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/i18nLanguages?part=snippet&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Languages API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw error;
    }
  }

  async getRegions(): Promise<YouTubeRegion[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/i18nRegions?part=snippet&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Regions API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching regions:', error);
      throw error;
    }
  }

  async getGuideCategories(regionCode: string = 'US'): Promise<YouTubeGuideCategory[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/guideCategories?part=snippet&regionCode=${regionCode}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Guide categories API error: ${response.status}`);
      }

      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching guide categories:', error);
      throw error;
    }
  }

  // Get related videos
  async getRelatedVideos(videoId: string, maxResults: number = 10): Promise<any[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`Related videos API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Get additional video details for duration and view count
      if (data.items && data.items.length > 0) {
        const videoIds = data.items.map((item: any) => item.id.videoId).join(',');
        const detailsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
        );
        
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json();
          
          // Merge search results with video details
          return data.items.map((item: any) => {
            const details = detailsData.items.find((d: any) => d.id === item.id.videoId);
            return {
              id: item.id.videoId,
              title: item.snippet.title,
              description: item.snippet.description,
              thumbnail: item.snippet.thumbnails.medium.url,
              channelTitle: item.snippet.channelTitle,
              publishedAt: item.snippet.publishedAt,
              duration: details?.contentDetails?.duration,
              viewCount: details?.statistics?.viewCount
            };
          });
        }
      }
      
      return data.items || [];
    } catch (error) {
      console.error('Error fetching related videos:', error);
      throw error;
    }
  }

  // Utility Methods
  formatSubscriberCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  formatViewCount(count: string): string {
    const num = parseInt(count);
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  formatDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // OAuth Methods
  getAuthUrl(): string {
    return this.oauthService.getAuthUrl();
  }

  async exchangeCodeForTokens(code: string): Promise<any> {
    return await this.oauthService.exchangeCodeForTokens(code);
  }

  storeTokens(tokens: any): void {
    this.oauthService.storeTokens(tokens);
  }

  isAuthenticated(): boolean {
    return this.oauthService.isAuthenticated();
  }

  async logout(): Promise<void> {
    await this.oauthService.revokeToken();
  }

  getAccessToken(): string | null {
    return this.oauthService.getAccessToken();
  }
}

export default YouTubeAPIService;
