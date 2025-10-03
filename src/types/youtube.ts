// YouTube Data API Types
export interface YouTubeChannel {
  id: string;
  snippet: {
    title: string;
    description: string;
    customUrl?: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    country?: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  statistics: {
    viewCount: string;
    subscriberCount: string;
    hiddenSubscriberCount: boolean;
    videoCount: string;
  };
  brandingSettings?: {
    channel: {
      title: string;
      description: string;
      keywords: string;
      unsubscribedTrailer?: string;
      country: string;
    };
    image: {
      bannerExternalUrl: string;
    };
  };
}

export interface YouTubePlaylist {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    localized?: {
      title: string;
      description: string;
    };
  };
  contentDetails: {
    itemCount: number;
  };
  status: {
    privacyStatus: string;
  };
}

export interface YouTubePlaylistItem {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    playlistId: string;
    position: number;
    resourceId: {
      kind: string;
      videoId: string;
    };
  };
  contentDetails: {
    videoId: string;
    startAt?: string;
    endAt?: string;
    note?: string;
    videoPublishedAt: string;
  };
}

export interface YouTubeActivity {
  id: string;
  snippet: {
    publishedAt: string;
    channelId: string;
    title: string;
    description: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    channelTitle: string;
    type: string;
  };
  contentDetails: {
    upload?: {
      videoId: string;
    };
    like?: {
      resourceId: {
        kind: string;
        videoId: string;
      };
    };
    subscription?: {
      resourceId: {
        kind: string;
        channelId: string;
      };
    };
    bulletin?: {
      resourceId: {
        kind: string;
        channelId: string;
      };
    };
    comment?: {
      resourceId: {
        kind: string;
        videoId: string;
      };
    };
  };
}

export interface YouTubeSubscription {
  id: string;
  snippet: {
    publishedAt: string;
    channelTitle: string;
    title: string;
    description: string;
    resourceId: {
      kind: string;
      channelId: string;
    };
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
  };
  contentDetails: {
    totalItemCount: number;
    newItemCount: number;
    activityType: string;
  };
}

export interface YouTubeLanguage {
  id: string;
  snippet: {
    hl: string;
    name: string;
  };
}

export interface YouTubeRegion {
  id: string;
  snippet: {
    gl: string;
    name: string;
  };
}

export interface YouTubeGuideCategory {
  id: string;
  snippet: {
    title: string;
    channelId: string;
  };
}

export interface YouTubeChannelSection {
  id: string;
  snippet: {
    type: string;
    channelId: string;
    title: string;
    position: number;
  };
  contentDetails: {
    playlists?: string[];
    channels?: string[];
  };
  targeting?: {
    countries?: string[];
    languages?: string[];
  };
}

