import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Play, Clock, Eye, Calendar, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import YouTubeAPIService from '@/services/youtubeAPI';
import { YouTubePlaylist, YouTubePlaylistItem } from '@/types/youtube';

interface PlaylistViewerProps {
  playlistId: string;
  apiKey: string;
}

const PlaylistViewer = ({ playlistId, apiKey }: PlaylistViewerProps) => {
  const [playlist, setPlaylist] = useState<YouTubePlaylist | null>(null);
  const [playlistItems, setPlaylistItems] = useState<YouTubePlaylistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  const youtubeAPI = new YouTubeAPIService(apiKey);

  useEffect(() => {
    fetchPlaylistInfo();
  }, [playlistId]);

  const fetchPlaylistInfo = async () => {
    try {
      setLoading(true);
      const playlistData = await youtubeAPI.getPlaylistInfo(playlistId);
      setPlaylist(playlistData);
    } catch (error) {
      console.error('Error fetching playlist info:', error);
      toast.error('Failed to load playlist information');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaylistItems = async () => {
    try {
      setLoadingItems(true);
      const itemsData = await youtubeAPI.getPlaylistItems(playlistId, 50);
      setPlaylistItems(itemsData);
    } catch (error) {
      console.error('Error fetching playlist items:', error);
      toast.error('Failed to load playlist items');
    } finally {
      setLoadingItems(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-lg">Loading playlist...</span>
        </div>
      </Card>
    );
  }

  if (!playlist) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">Playlist not found</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Playlist Info</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          <div className="space-y-6">
            {/* Playlist Header */}
            <div className="flex items-start gap-4">
              <img
                src={playlist.snippet.thumbnails.high.url}
                alt={playlist.snippet.title}
                className="w-32 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">{playlist.snippet.title}</h2>
                <p className="text-muted-foreground mb-2">by {playlist.snippet.channelTitle}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Play className="h-4 w-4" />
                    {playlist.contentDetails.itemCount} videos
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(playlist.snippet.publishedAt).toLocaleDateString()}
                  </span>
                  <Badge variant="secondary">
                    {playlist.status.privacyStatus}
                  </Badge>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Playlist
              </Button>
            </div>

            {/* Playlist Description */}
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {playlist.snippet.description || 'No description available'}
              </p>
            </div>

            {/* Playlist Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <Play className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{playlist.contentDetails.itemCount}</div>
                <div className="text-sm text-muted-foreground">Total Videos</div>
              </Card>

              <Card className="p-4 text-center">
                <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">
                  {new Date(playlist.snippet.publishedAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-muted-foreground">Created</div>
              </Card>

              <Card className="p-4 text-center">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {playlist.status.privacyStatus}
                </Badge>
                <div className="text-sm text-muted-foreground mt-2">Privacy</div>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Videos in Playlist</h3>
              <Button
                onClick={fetchPlaylistItems}
                disabled={loadingItems}
                variant="outline"
                size="sm"
              >
                {loadingItems ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Load Videos
                  </>
                )}
              </Button>
            </div>

            {playlistItems.length === 0 ? (
              <div className="text-center py-8">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No videos loaded</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load Videos" to fetch playlist videos
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {playlistItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="relative">
                          <img
                            src={item.snippet.thumbnails.medium.url}
                            alt={item.snippet.title}
                            className="w-32 h-20 object-cover rounded"
                          />
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 rounded">
                            #{index + 1}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold mb-1 line-clamp-2">{item.snippet.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {item.snippet.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.snippet.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Play className="h-3 w-3" />
                            Position: {item.snippet.position}
                          </span>
                          {item.contentDetails.startAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Starts at: {item.contentDetails.startAt}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="outline" size="sm">
                          <Play className="mr-2 h-4 w-4" />
                          Watch
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PlaylistViewer;



