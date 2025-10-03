import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, FileText, Clock, ArrowLeft, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

type VideoNotes = Tables<'video_notes'>;

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [notes, setNotes] = useState<VideoNotes[]>([]);
  const [loading, setLoading] = useState(true);

  // Debug authentication immediately
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('User:', user);
    console.log('Profile:', profile);
    console.log('User ID:', user?.id);
    console.log('User Email:', user?.email);
    console.log('========================');
  }, [user, profile]);

  // Simple data fetch
  useEffect(() => {
    console.log('useEffect triggered - user:', !!user);
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('TIMEOUT: Forcing loading to false');
      setLoading(false);
    }, 5000); // 5 second timeout

    if (user) {
      console.log('User exists, fetching notes...');
      fetchNotes();
    } else {
      console.log('No user, setting loading to false');
      setLoading(false);
    }

    return () => clearTimeout(timeout);
  }, [user]);

  const fetchNotes = async () => {
    try {
      console.log('=== FETCHING FROM VIDEO_NOTES TABLE ===');
      console.log('User ID:', user?.id);
      
      // Direct query to video_notes table
      const { data, error } = await supabase
        .from('video_notes')
        .select('*')
        .eq('user_id', user.id);
      
      console.log('Query result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        setNotes([]);
      } else {
        console.log('Successfully fetched notes:', data?.length || 0);
        console.log('Notes data:', data);
        setNotes(data || []);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {profile?.username || user?.email?.split('@')[0] || 'User'}!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/profile">
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => {
                console.log('=== DEBUG ===');
                console.log('User:', user?.id);
                console.log('Notes:', notes.length);
                console.log('Notes data:', notes);
                
                // Test query with current user
                supabase.from('video_notes').select('*').eq('user_id', user.id).then(result => {
                  console.log('Query result:', result);
                });
                
                // Get all notes to see user_ids
                supabase.from('video_notes').select('user_id').then(result => {
                  console.log('All user_ids:', result.data);
                });
              }}
            >
              Debug
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('=== SIMPLE TEST ===');
                console.log('User ID:', user.id);
                
                // Test the exact query
                const { data, error } = await supabase
                  .from('video_notes')
                  .select('*')
                  .eq('user_id', user.id);
                
                console.log('Query result:', { data, error });
                
                if (data && data.length > 0) {
                  console.log('Found notes!', data);
                  setNotes(data);
                } else {
                  console.log('No notes found for this user');
                  
                  // Check if there are any notes at all
                  const { data: allNotes } = await supabase
                    .from('video_notes')
                    .select('*');
                  console.log('All notes in database:', allNotes);
                }
              }}
            >
              Test Query
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="notes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
            <TabsTrigger value="notes">
              <FileText className="mr-2 h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="timestamps">
              <Clock className="mr-2 h-4 w-4" />
              Timestamps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <Card className="p-6">
              <p className="text-center text-muted-foreground py-8">
                Watch history will appear here.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            {notes.length === 0 ? (
              <Card className="p-6">
                <p className="text-center text-muted-foreground py-8">
                  No notes saved yet. Add notes while watching videos to see them here!
                </p>
              </Card>
            ) : (
              notes.map((note) => (
                <Card key={note.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{note.video_title || 'Untitled Video'}</h3>
                      <p className="text-muted-foreground mb-2">{note.content}</p>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeAgo(note.created_at)}
                      </span>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="timestamps" className="space-y-4">
            <Card className="p-6">
              <p className="text-center text-muted-foreground py-8">
                Timestamps will appear here.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
