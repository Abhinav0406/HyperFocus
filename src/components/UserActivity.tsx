import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Activity, Heart, Upload, UserPlus, MessageSquare, Bell, LogIn, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import YouTubeAPIService from '@/services/youtubeAPI';
import { YouTubeActivity, YouTubeSubscription } from '@/types/youtube';

interface UserActivityProps {
  apiKey: string;
}

const UserActivity = ({ apiKey }: UserActivityProps) => {
  const [activities, setActivities] = useState<YouTubeActivity[]>([]);
  const [subscriptions, setSubscriptions] = useState<YouTubeSubscription[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const youtubeAPI = new YouTubeAPIService(apiKey);

  useEffect(() => {
    setIsAuthenticated(youtubeAPI.isAuthenticated());
  }, []);

  const handleGoogleLogin = () => {
    const authUrl = youtubeAPI.getAuthUrl();
    window.location.href = authUrl;
  };

  const handleGoogleLogout = async () => {
    try {
      await youtubeAPI.logout();
      setIsAuthenticated(false);
      setActivities([]);
      setSubscriptions([]);
      toast.success('Successfully logged out from Google');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const fetchActivities = async () => {
    if (!isAuthenticated) {
      toast.error('Please login with Google first');
      return;
    }

    try {
      setLoadingActivities(true);
      const activitiesData = await youtubeAPI.getUserActivities(20);
      setActivities(activitiesData);
    } catch (error) {
      console.error('Error fetching user activities:', error);
      if (error instanceof Error && error.message.includes('access token')) {
        toast.error('Authentication expired. Please login again.');
        setIsAuthenticated(false);
      } else {
        toast.error('Failed to load user activities');
      }
    } finally {
      setLoadingActivities(false);
    }
  };

  const fetchSubscriptions = async () => {
    if (!isAuthenticated) {
      toast.error('Please login with Google first');
      return;
    }

    try {
      setLoadingSubscriptions(true);
      const subscriptionsData = await youtubeAPI.getUserSubscriptions(20);
      setSubscriptions(subscriptionsData);
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      if (error instanceof Error && error.message.includes('access token')) {
        toast.error('Authentication expired. Please login again.');
        setIsAuthenticated(false);
      } else {
        toast.error('Failed to load subscriptions');
      }
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      case 'subscription':
        return <UserPlus className="h-4 w-4" />;
      case 'bulletin':
        return <Bell className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: YouTubeActivity) => {
    const type = activity.snippet.type;
    const channelTitle = activity.snippet.channelTitle;
    
    switch (type) {
      case 'upload':
        return `Uploaded a new video`;
      case 'like':
        return `Liked a video`;
      case 'subscription':
        return `Subscribed to ${channelTitle}`;
      case 'bulletin':
        return `Posted a channel bulletin`;
      case 'comment':
        return `Commented on a video`;
      default:
        return `Performed an activity`;
    }
  };

  return (
    <Card className="p-6">
      <Tabs defaultValue="activities" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activities">Recent Activity</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="activities" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Recent Activity</h3>
              <div className="flex gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={fetchActivities}
                      disabled={loadingActivities}
                      variant="outline"
                      size="sm"
                    >
                      {loadingActivities ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-4 w-4" />
                          Load Activities
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleGoogleLogout}
                      variant="outline"
                      size="sm"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleGoogleLogin}
                    variant="default"
                    size="sm"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login with Google
                  </Button>
                )}
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium">Authentication Required:</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Please login with your Google account to access your YouTube activity and subscriptions.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium">Authenticated:</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You are logged in with Google. You can now access your YouTube activity and subscriptions.
                </p>
              </div>
            )}

            {activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No activities loaded</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load Activities" to fetch your recent activity
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <Card key={activity.id} className="p-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          {getActivityIcon(activity.snippet.type)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{activity.snippet.channelTitle}</span>
                          <Badge variant="secondary" className="text-xs">
                            {activity.snippet.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {getActivityText(activity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.snippet.publishedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <img
                          src={activity.snippet.thumbnails.medium.url}
                          alt="Activity thumbnail"
                          className="w-16 h-12 object-cover rounded"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Your Subscriptions</h3>
              <div className="flex gap-2">
                {isAuthenticated ? (
                  <>
                    <Button
                      onClick={fetchSubscriptions}
                      disabled={loadingSubscriptions}
                      variant="outline"
                      size="sm"
                    >
                      {loadingSubscriptions ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Load Subscriptions
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleGoogleLogout}
                      variant="outline"
                      size="sm"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleGoogleLogin}
                    variant="default"
                    size="sm"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login with Google
                  </Button>
                )}
              </div>
            </div>

            {!isAuthenticated ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium">Authentication Required:</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Please login with your Google account to access your YouTube subscriptions.
                </p>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-green-800">
                  <Bell className="h-4 w-4" />
                  <span className="font-medium">Authenticated:</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  You are logged in with Google. You can now access your YouTube subscriptions.
                </p>
              </div>
            )}

            {subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No subscriptions loaded</p>
                <p className="text-sm text-muted-foreground">
                  Click "Load Subscriptions" to fetch your subscribed channels
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {subscriptions.map((subscription) => (
                  <Card key={subscription.id} className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={subscription.snippet.thumbnails.medium.url}
                        alt={subscription.snippet.title}
                        className="w-16 h-16 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{subscription.snippet.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {subscription.snippet.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UserPlus className="h-3 w-3" />
                            Subscribed {new Date(subscription.snippet.publishedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {subscription.contentDetails.totalItemCount} videos
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {subscription.contentDetails.activityType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="outline" size="sm">
                          Visit Channel
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

export default UserActivity;
