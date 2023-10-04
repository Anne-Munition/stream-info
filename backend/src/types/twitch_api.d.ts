interface TwitchUserResponse {
  data: TwitchUser[];
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: 'staff' | 'admin' | 'global_mod' | '';
  broadcaster_type: 'partner' | 'affiliate' | '';
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email?: string;
  created_at: string;
}

interface TwitchToken {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
}

interface TwitchChannelResponse {
  data: TwitchChannel[];
}

interface TwitchChannel {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
}

interface TwitchSubscriptionResponse {
  data: TwitchSubscription[];
  pagination: {
    cursor: string;
  };
  total: number;
  points: number;
}

interface TwitchSubscription {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  gifter_id: string;
  gifter_login: string;
  gifter_name: string;
  is_gift: boolean;
  plan_name: string;
  tier: '1000' | '2000' | '3000' | 'prime';
  user_id: string;
  user_name: string;
  user_login: string;
}

interface TwitchGameResponse {
  data: TwitchGame[];
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
}

interface TwitchClipResponse {
  data: TwitchClip[];
  pagination: {
    cursor?: string;
  };
}

interface TwitchClip {
  id: string;
  url: string;
  embed_url: string;
  broadcaster_id: string;
  broadcaster_name: string;
  creator_id: string;
  creator_name: string;
  video_id: string;
  game_id: string;
  language: string;
  title: string;
  view_count: number;
  created_at: string;
  thumbnail_url: string;
  duration: number;
}

interface TwitchStreamResponse {
  data: TwitchStream[];
  pagination?: {
    cursor?: string;
  };
}

interface TwitchStream {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: 'live' | '';
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
}

interface TwitchUserVideosResponse {
  data: TwitchVideo[];
  pagination?: {
    cursor?: string;
  };
}

interface TwitchVideo {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: 'public' | 'private';
  view_count: number;
  language: string;
  type: 'upload' | 'archive' | 'highlight';
  duration: string;
  muted_segments: MutedSegments[] | null;
}

interface MutedSegments {
  duration: number;
  offset: number;
}

interface TwitchCheermoteResponse {
  data: Cheermote[];
}

interface Cheermote {
  prefix: string;
  tiers: [
    {
      min_bits: number;
      id: string;
      color: string;
      images: {
        dark: {
          animated: CheermoteImages;
          static: CheermoteImages;
        };
        light: {
          animated: CheermoteImages;
          static: CheermoteImages;
        };
      };
      can_cheer: boolean;
      show_in_bits_card: boolean;
    },
  ];
  type: string;
  order: number;
  last_updated: string;
  is_charitable: boolean;
}

interface CheermoteImages {
  '1': string;
  '1.5': string;
  '2': string;
  '3': string;
  '4': string;
}

interface TwitchAppToken {
  access_token: string;
  expires_in: number;
  token_type: 'bearer';
}

interface TwitchGameResponse {
  data: TwitchGame[];
}

interface TwitchGame {
  id: string;
  name: string;
  box_art_url: string;
}

type LiveSub = TwitchStream & TwitchGame;

interface TwitchUserToken {
  access_token: string;
  refresh_token: string;
  scope: string[];
  token_type: 'bearer';
}

interface AWSKeys {
  access_token: string;
  client_id: string;
}
