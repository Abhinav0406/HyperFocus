// Google OAuth 2.0 Service for YouTube Data API
class GoogleOAuthService {
  private clientId: string;
  private redirectUri: string;
  private scopes: string[];

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    this.redirectUri = `${window.location.origin}/auth/callback`;
    this.scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/youtube.force-ssl'
    ];
  }

  // Generate OAuth URL
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateState()
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  // Generate random state for security
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Exchange authorization code for tokens
  async exchangeCodeForTokens(code: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    return await response.json();
  }

  // Refresh access token
  async refreshToken(refreshToken: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    return await response.json();
  }

  // Store tokens in localStorage
  storeTokens(tokens: any): void {
    localStorage.setItem('youtube_access_token', tokens.access_token);
    localStorage.setItem('youtube_refresh_token', tokens.refresh_token);
    localStorage.setItem('youtube_token_expiry', 
      (Date.now() + (tokens.expires_in * 1000)).toString()
    );
  }

  // Get stored access token
  getAccessToken(): string | null {
    return localStorage.getItem('youtube_access_token');
  }

  // Get stored refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('youtube_refresh_token');
  }

  // Check if token is expired
  isTokenExpired(): boolean {
    const expiry = localStorage.getItem('youtube_token_expiry');
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string | null> {
    if (this.isTokenExpired()) {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) return null;

      try {
        const newTokens = await this.refreshToken(refreshToken);
        this.storeTokens(newTokens);
        return newTokens.access_token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        this.clearTokens();
        return null;
      }
    }

    return this.getAccessToken();
  }

  // Clear stored tokens
  clearTokens(): void {
    localStorage.removeItem('youtube_access_token');
    localStorage.removeItem('youtube_refresh_token');
    localStorage.removeItem('youtube_token_expiry');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  }

  // Revoke token (logout)
  async revokeToken(): Promise<void> {
    const token = this.getAccessToken();
    if (token) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
          method: 'POST',
        });
      } catch (error) {
        console.error('Failed to revoke token:', error);
      }
    }
    this.clearTokens();
  }
}

export default GoogleOAuthService;

