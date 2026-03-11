export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  genre: string;
  duration: number;
  cover_url: string;
  audio_url: string;
  is_local: boolean;
  plays: number;
  is_verified?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  tier: 'free' | 'premium';
  badges?: string[];
}

export interface Playlist {
  id: number;
  name: string;
  owner_id: number;
  is_public: boolean;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  target_hours: number;
  current_hours: number;
  status: 'active' | 'completed';
}

export interface NjebelePost {
  id: number;
  user_id: number;
  username: string;
  content: string;
  track_id?: number;
  timestamp: string;
}

export interface SyncSession {
  roomCode: string;
  hostId: number;
  currentTrackId?: number;
  isPlaying: boolean;
  currentTime: number;
}
