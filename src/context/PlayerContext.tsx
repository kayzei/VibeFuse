import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track } from '../types';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  queue: Track[];
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  addToQueue: (track: Track) => void;
  roomCode: string | null;
  joinRoom: (code: string) => void;
  createRoom: () => void;
  leaveRoom: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Track[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (roomCode) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}`);
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', roomCode }));
      };

      socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'sync') {
          if (message.trackId) {
            // Fetch track if needed or find in queue
            // For simplicity, we assume we have the track info or just sync play state
            if (message.isPlaying !== undefined) setIsPlaying(message.isPlaying);
          }
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [roomCode]);

  const syncState = (updates: any) => {
    if (socketRef.current?.readyState === WebSocket.OPEN && roomCode) {
      socketRef.current.send(JSON.stringify({
        type: 'sync',
        roomCode,
        ...updates
      }));
    }
  };

  const playTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    syncState({ trackId: track.id, isPlaying: true });
    fetch(`/api/tracks/${track.id}/play`, { method: 'POST' });
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    syncState({ isPlaying: newState });
  };

  const nextTrack = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      const nextIndex = (currentIndex + 1) % queue.length;
      const next = queue[nextIndex];
      setCurrentTrack(next);
      syncState({ trackId: next.id, isPlaying: true });
    }
  };

  const prevTrack = () => {
    if (queue.length > 0) {
      const currentIndex = queue.findIndex(t => t.id === currentTrack?.id);
      const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
      const prev = queue[prevIndex];
      setCurrentTrack(prev);
      syncState({ trackId: prev.id, isPlaying: true });
    }
  };

  const addToQueue = (track: Track) => {
    setQueue(prev => [...prev, track]);
  };

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
  };

  const joinRoom = (code: string) => {
    setRoomCode(code);
  };

  const leaveRoom = () => {
    setRoomCode(null);
    socketRef.current?.close();
  };

  return (
    <PlayerContext.Provider value={{
      currentTrack,
      isPlaying,
      queue,
      playTrack,
      togglePlay,
      nextTrack,
      prevTrack,
      addToQueue,
      roomCode,
      joinRoom,
      createRoom,
      leaveRoom
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
