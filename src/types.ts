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
}

export interface User {
  id: number;
  username: string;
  email: string;
  tier: 'free' | 'premium';
}

export interface Playlist {
  id: number;
  name: string;
  owner_id: number;
  is_public: boolean;
}
