import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Video, Eye, Calendar, ExternalLink, Play } from 'lucide-react';
import { toast } from 'sonner';
import YouTubeAPIService from '@/services/youtubeAPI';
import { YouTubeChannel, YouTubePlaylist } from '@/types/youtube';

interface ChannelInfoProps {
  channelId: string;
  apiKey: string;
}

const ChannelInfo = ({ channelId, apiKey }: ChannelInfoProps) => {
  const [channel, setChannel] = useState<YouTubeChannel | null>(null);
  const [playlists, setPlaylists] = useState<YouTubePlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const youtubeAPI = new YouTubeAPIService(apiKey);

  useEffect(() => {
    fetchChannelInfo();
  }, [channelId]);

  const fetchChannelInfo = async () => {
    try {
      setLoading(true);
      const channelData = await youtubeAPI.getChannelInfo(channelId);
      setChannel(channelData);
    } catch (error) {
      console.error('Error fetching channel info:', error);
      toast.error('Failed to load channel information');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylists = async () => {
    try {
      setLoadingPlaylists(true);
      const playlistsData = await youtubeAPI.getPlaylists(channelId, 20);
      setPlaylists(playlistsData);
    } catch (error) {
      console.error('Error fetching playlists:', error);
      toast.error('Failed to load playlists');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading channel information...</span>
        </div>
      </Card>
    );
  }

  if (!channel) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Channel not found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Channel Info</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="space-y-6">
            {/* Channel Header */}
            <div className="flex items-start gap-4">
              <img
                src={channel.snippet.thumbnails.high.url}
                alt={channel.snippet.title}
                className="w-20 h-20 rounded-full"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{channel.snippet.title}</h2>
                {channel.snippet.customUrl && (
                  <p className="text-muted-foreground">@{channel.snippet.customUrl}</p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Joined {new Date(channel.snippet.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Channel
              </Button>
            </div>

            {/* Channel Description */}
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {channel.snippet.description}
              </p>
            </div>

            {/* Channel Banner */}
            {channel.brandingSettings?.image?.bannerExternalUrl && (
              <div>
                <h3 className="font-semibold mb-2">Banner</h3>
                <img
                  src={channel.brandingSettings.image.bannerExternalUrl}
                  alt="Channel banner"
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="playlists" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Playlists</h3>
              <Button
                onClick={fetchPlaylists}
                disabled={loadingPlaylists}
                variant="outline"
                size="sm"
              >
                {loadingPlaylists ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Load Playlists
                  </>
                )}
              </Button>
            </div>

            {playlists.length === 0 ? (
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No playlists loaded</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load Playlists" to fetch channel playlists
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {playlists.map((playlist) => (
                  <Card key={playlist.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={playlist.snippet.thumbnails.medium.url}
                        alt={playlist.snippet.title}
                        className="w-24 h-18 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{playlist.snippet.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {playlist.snippet.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            {playlist.contentDetails.itemCount} videos
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(playlist.snippet.publishedAt).toLocaleDateString()}
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {playlist.status.privacyStatus}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 text-center">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {youtubeAPI.formatSubscriberCount(channel.statistics.subscriberCount)}
              </div>
              <div className="text-sm text-muted-foreground">Subscribers</div>
            </Card>

            <Card className="p-4 text-center">
              <Video className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {youtubeAPI.formatViewCount(channel.statistics.videoCount)}
              </div>
              <div className="text-sm text-muted-foreground">Videos</div>
            </Card>

            <Card className="p-4 text-center">
              <Eye className="h-8 w-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">
                {youtubeAPI.formatViewCount(channel.statistics.viewCount)}
              </div>
              <div className="text-sm text-muted-foreground">Total Views</div>
            </Card>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold mb-4">Channel Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Channel ID:</span>
                <p className="text-muted-foreground font-mono">{channel.id}</p>
              </div>
              <div>
                <span className="font-medium">Country:</span>
                <p className="text-muted-foreground">{channel.snippet.country || 'Not specified'}</p>
              </div>
              <div>
                <span className="font-medium">Published:</span>
                <p className="text-muted-foreground">
                  {new Date(channel.snippet.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="font-medium">Subscriber Count:</span>
                <p className="text-muted-foreground">
                  {channel.statistics.hiddenSubscriberCount ? 'Hidden' : 'Public'}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default ChannelInfo;



