import React from 'react';
import { 
  Home, Search, Library, Mic2, Radio, PlusSquare, Heart, Play, 
  SkipBack, SkipForward, Repeat, Shuffle, Volume2, MoreHorizontal, 
  User, Sparkles, Wand2, DollarSign, TrendingUp, BarChart3, X, 
  MessageSquare, Target, Globe, Send, Music, Calendar, Newspaper,
  BadgeCheck, Users, Link as LinkIcon, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track, NjebelePost, Goal } from './types';
import { usePlayer } from './context/PlayerContext';
import { identifySong, getRecommendations, getLyrics } from './services/geminiService';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: React.ElementType, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-all border-l-4 ${active ? 'bg-zed-green/10 border-zed-green text-zed-green' : 'border-transparent text-zinc-500 hover:text-zed-white hover:bg-white/5'}`}
  >
    <Icon size={24} strokeWidth={active ? 3 : 2} />
    <span className={`font-display font-bold uppercase tracking-tight ${active ? 'text-lg' : 'text-base'}`}>{label}</span>
  </div>
);

const BrutalCard = ({ children, className = "" }: { children: React.ReactNode, className?: string, key?: React.Key }) => (
  <div className={`brutal-card ${className}`}>
    {children}
  </div>
);

const TrackCard = ({ track }: { track: Track, key?: React.Key }) => {
  const { playTrack, currentTrack, isPlaying } = usePlayer();
  const active = currentTrack?.id === track.id;

  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`relative group cursor-pointer border-2 p-4 transition-all ${active ? 'border-zed-green bg-zed-green/5' : 'border-zed-white hover:border-zed-purple'}`}
      onClick={() => playTrack(track)}
    >
      <div className="relative aspect-square mb-4 overflow-hidden border-2 border-zed-white">
        <img 
          src={track.cover_url} 
          alt={track.title} 
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${active ? 'bg-zed-green/20 opacity-100' : 'bg-black/60 opacity-0 group-hover:opacity-100'}`}>
          <div className={`w-16 h-16 flex items-center justify-center border-4 border-zed-white bg-zed-black shadow-[4px_4px_0px_0px_white]`}>
            {active && isPlaying ? (
              <div className="flex gap-1 items-end h-6">
                <motion.div animate={{ height: [8, 24, 8] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-zed-green" />
                <motion.div animate={{ height: [12, 18, 12] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 bg-zed-green" />
                <motion.div animate={{ height: [16, 10, 16] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-zed-green" />
              </div>
            ) : (
              <Play fill="white" size={32} />
            )}
          </div>
        </div>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display font-black text-xl truncate mb-1">{track.title}</h3>
          <div className="flex items-center gap-1">
            <p className="font-mono text-sm text-zinc-400 uppercase truncate">{track.artist}</p>
            {track.is_verified && <BadgeCheck size={14} className="text-zed-green flex-shrink-0" />}
          </div>
        </div>
      </div>
      
      {track.plays > 0 && (
        <div className="absolute top-6 right-6 bg-zed-green text-zed-black px-2 py-1 font-mono text-[10px] font-black border-2 border-zed-black shadow-[2px_2px_0px_0px_black]">
          {track.plays} PLAYS
        </div>
      )}
    </motion.div>
  );
};

const SyncPanel = () => {
  const { roomCode, createRoom, joinRoom, leaveRoom } = usePlayer();
  const [inputCode, setInputCode] = React.useState('');

  return (
    <BrutalCard className="border-zed-green bg-zed-black">
      <div className="flex items-center gap-3 mb-4">
        <Users className="text-zed-green" size={24} />
        <h3 className="text-xl font-black">VIBE-SYNC</h3>
      </div>
      
      {!roomCode ? (
        <div className="space-y-4">
          <button 
            onClick={createRoom}
            className="w-full py-2 bg-zed-green text-zed-black font-black border-2 border-zed-black shadow-[4px_4px_0px_0px_black] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
          >
            CREATE ROOM
          </button>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="ROOM CODE" 
              className="flex-1 bg-transparent border-2 border-zed-white px-3 py-2 font-bold focus:border-zed-green focus:ring-0 uppercase"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
            />
            <button 
              onClick={() => joinRoom(inputCode)}
              className="px-4 bg-zed-purple text-zed-white font-black border-2 border-zed-black shadow-[4px_4px_0px_0px_black]"
            >
              JOIN
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 border-2 border-dashed border-zed-green bg-zed-green/5 text-center">
            <p className="text-xs font-mono text-zinc-500 mb-1">YOUR ROOM CODE</p>
            <p className="text-3xl font-black tracking-widest text-zed-green">{roomCode}</p>
          </div>
          <button 
            onClick={leaveRoom}
            className="w-full py-2 bg-zed-orange text-zed-white font-black border-2 border-zed-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> LEAVE SESSION
          </button>
        </div>
      )}
    </BrutalCard>
  );
};

// --- Main App ---

export default function App() {
  const { currentTrack, isPlaying, togglePlay, nextTrack, prevTrack } = usePlayer();
  const [view, setView] = React.useState<'home' | 'njebele' | 'hustle' | 'discovery' | 'charts' | 'dashboard'>('home');
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [njebelePosts, setNjebelePosts] = React.useState<NjebelePost[]>([]);
  const [goals, setGoals] = React.useState<Goal[]>([]);
  const [lyrics, setLyrics] = React.useState<{time: number, text: string}[]>([]);
  const [showLyrics, setShowLyrics] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isIdentifying, setIsIdentifying] = React.useState(false);

  const [userBadges, setUserBadges] = React.useState<string[]>([]);

  // Fetch Data
  const fetchData = async () => {
    const [tRes, nRes, gRes, bRes] = await Promise.all([
      fetch('/api/tracks'),
      fetch('/api/njebele'),
      fetch('/api/goals'),
      fetch('/api/user/1/badges')
    ]);
    setTracks(await tRes.json());
    setNjebelePosts(await nRes.json());
    setGoals(await gRes.json());
    setUserBadges(await bRes.json());
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  // Sync Lyrics
  React.useEffect(() => {
    if (currentTrack) {
      getLyrics(currentTrack.title, currentTrack.artist).then(setLyrics);
    }
  }, [currentTrack]);

  const handleIdentify = async () => {
    setIsIdentifying(true);
    const result = await identifySong();
    alert(`Z-PULSE IDENTIFIED: ${result.title} by ${result.artist}\n\nZED FACT: ${result.funFact}`);
    setIsIdentifying(false);
  };

  const handlePostNjebele = async (content: string) => {
    await fetch('/api/njebele', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, username: 'ZedViber', track_id: currentTrack?.id })
    });
    fetchData();
  };

  return (
    <div className="flex h-screen bg-zed-black text-zed-white overflow-hidden font-sans selection:bg-zed-green selection:text-zed-black">
      {/* Sidebar */}
      <aside className="w-72 bg-zed-black border-r-4 border-zed-white flex flex-col z-30">
        <div className="p-8 border-b-4 border-zed-white">
          <h1 className="text-5xl font-black tracking-tighter italic leading-none">
            Z-PULSE
            <span className="block text-xs font-mono not-italic tracking-widest text-zed-green mt-2">AFRO-BRUTALIST OS v1.0</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-4 overflow-y-auto">
          <SidebarItem icon={Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
          <SidebarItem icon={MessageSquare} label="Njebele" active={view === 'njebele'} onClick={() => setView('njebele')} />
          <SidebarItem icon={Target} label="Hustle" active={view === 'hustle'} onClick={() => setView('hustle')} />
          <SidebarItem icon={Globe} label="Discovery" active={view === 'discovery'} onClick={() => setView('discovery')} />
          <SidebarItem icon={TrendingUp} label="Charts" active={view === 'charts'} onClick={() => setView('charts')} />
          
          <div className="mt-8 px-8 mb-4">
            <h2 className="text-xs font-mono font-black text-zinc-500 uppercase tracking-widest">Your Space</h2>
          </div>
          <SidebarItem icon={Heart} label="Liked" />
          <SidebarItem icon={Library} label="Library" />
          <SidebarItem icon={BarChart3} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        </nav>

          <div className="p-6 border-t-4 border-zed-white space-y-4">
            <SyncPanel />
            <BrutalCard className="bg-zed-purple border-zed-black shadow-[4px_4px_0px_0px_#000]">
              <p className="text-xs font-black mb-1">GO PRO</p>
              <p className="text-sm font-bold leading-tight mb-3">Support local talent & get offline mode.</p>
              <button className="w-full py-2 bg-zed-black text-zed-white font-black text-xs border-2 border-zed-white hover:bg-zed-green hover:text-zed-black transition-colors">UPGRADE</button>
            </BrutalCard>
          </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pb-32">
        {/* Background Marquee */}
        <div className="fixed inset-0 flex flex-col justify-around opacity-5 pointer-events-none z-0">
          <div className="marquee-text animate-pulse">LUSAKA ZAMBIA LUSAKA ZAMBIA</div>
          <div className="marquee-text animate-pulse delay-700">HUSTLE HARD HUSTLE HARD</div>
          <div className="marquee-text animate-pulse delay-1000">Z-PULSE VIBES Z-PULSE VIBES</div>
        </div>

        <header className="sticky top-0 z-20 bg-zed-black/90 backdrop-blur-sm border-b-4 border-zed-white p-6 flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zed-white group-focus-within:text-zed-green" size={24} />
              <input 
                type="text" 
                placeholder="SEARCH THE VIBE..."
                className="w-full bg-transparent border-4 border-zed-white py-3 pl-14 pr-6 font-display font-bold text-xl focus:border-zed-green focus:ring-0 transition-all placeholder:text-zinc-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-6 ml-8">
            <button 
              onClick={handleIdentify}
              disabled={isIdentifying}
              className={`brutal-border-orange px-6 py-3 font-display font-black text-sm flex items-center gap-2 transition-all active:translate-x-1 active:translate-y-1 active:shadow-none ${isIdentifying ? 'opacity-50' : 'hover:bg-zed-orange hover:text-zed-white'}`}
            >
              <Sparkles size={20} className={isIdentifying ? 'animate-spin' : ''} />
              {isIdentifying ? 'LISTENING...' : 'IDENTIFY'}
            </button>
            <div className="w-14 h-14 border-4 border-zed-white bg-zed-purple flex items-center justify-center shadow-[4px_4px_0px_0px_white] cursor-pointer hover:bg-zed-green transition-colors">
              <User size={32} />
            </div>
          </div>
        </header>

        <div className="p-10 relative z-10">
          <AnimatePresence mode="wait">
            {view === 'home' && (
              <motion.div 
                key="home"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-16"
              >
                {/* Hero */}
                <section>
                  <div className="brutal-border-green bg-zed-green p-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="flex-1">
                      <h2 className="text-8xl font-black leading-[0.8] mb-6 text-zed-black">LUSAKA<br/>PULSE</h2>
                      <p className="text-2xl font-bold text-zed-black mb-8 max-w-lg leading-tight">The raw sound of the streets. No filters, just pure Zed energy.</p>
                      <button 
                        onClick={() => setView('charts')}
                        className="bg-zed-black text-zed-white px-10 py-4 font-display font-black text-xl border-4 border-zed-white shadow-[8px_8px_0px_0px_white] hover:bg-zed-purple transition-all active:translate-x-1 active:translate-y-1 active:shadow-none"
                      >
                        EXPLORE CHARTS
                      </button>
                    </div>
                    <div className="w-full md:w-1/3 aspect-square border-8 border-zed-black bg-zed-purple flex items-center justify-center shadow-[16px_16px_0px_0px_black]">
                      <TrendingUp size={120} strokeWidth={3} className="text-zed-black" />
                    </div>
                  </div>
                </section>

                {/* AI Recs */}
                <section>
                  <div className="flex items-center gap-4 mb-8">
                    <Wand2 size={40} className="text-zed-purple" />
                    <h2 className="text-4xl font-black">AI VIBE PICKS</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {tracks.slice(0, 3).map((track) => (
                      <BrutalCard key={`vibe-${track.id}`} className="border-zed-purple">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 border-2 border-zed-white overflow-hidden">
                            <img src={track.cover_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <h3 className="font-display font-bold text-lg">{track.title}</h3>
                            <p className="font-mono text-xs text-zinc-500 uppercase">{track.artist}</p>
                          </div>
                        </div>
                      </BrutalCard>
                    ))}
                  </div>
                </section>

                {/* Local Grid */}
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-4xl font-black">LUSAKA LOCAL</h2>
                    <button className="font-mono font-black text-zed-green hover:underline">VIEW ALL</button>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                    {tracks.filter(t => t.is_local).map(track => (
                      <TrackCard key={`local-${track.id}`} track={track} />
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {view === 'njebele' && (
              <motion.div 
                key="njebele"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-3xl mx-auto space-y-10"
              >
                <div className="brutal-border-orange bg-zed-orange p-8 text-zed-black">
                  <h2 className="text-6xl font-black mb-2">NJEBELE</h2>
                  <p className="text-xl font-bold uppercase tracking-tight">Shout out the vibe. Real talk, real music.</p>
                </div>

                <div className="brutal-card border-zed-green">
                  <textarea 
                    placeholder="WHA'S THE VIBE?"
                    className="w-full bg-transparent border-none p-0 text-2xl font-bold focus:ring-0 placeholder:text-zinc-800 h-32"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handlePostNjebele(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-zed-white/20">
                    <div className="flex gap-4">
                      <button className="text-zinc-500 hover:text-zed-green"><Mic2 size={24} /></button>
                      <button className="text-zinc-500 hover:text-zed-green"><Music size={24} /></button>
                    </div>
                    <button className="bg-zed-green text-zed-black px-6 py-2 font-black text-sm border-2 border-zed-black shadow-[4px_4px_0px_0px_black]">POST</button>
                  </div>
                </div>

                <div className="space-y-6">
                  {njebelePosts.map(post => (
                    <motion.div 
                      key={`post-${post.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="brutal-card"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 border-2 border-zed-white bg-zed-purple flex items-center justify-center font-black">
                            {post.username[0]}
                          </div>
                          <div>
                            <p className="font-black text-zed-green">@{post.username.toUpperCase()}</p>
                            <p className="text-[10px] font-mono text-zinc-500">{new Date(post.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                        <MoreHorizontal className="text-zinc-500" />
                      </div>
                      <p className="text-xl font-bold leading-tight mb-4">{post.content}</p>
                      {post.track_id && (
                        <div className="bg-white/5 p-3 border-l-4 border-zed-purple flex items-center gap-3">
                          <Music size={16} className="text-zed-purple" />
                          <p className="text-xs font-mono font-bold">LISTENING TO: ZED_TRACK_{post.track_id}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {view === 'hustle' && (
              <motion.div 
                key="hustle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-12"
              >
                <div className="brutal-border bg-zed-purple p-10">
                  <h2 className="text-7xl font-black mb-4">HUSTLE MODE</h2>
                  <p className="text-2xl font-bold max-w-2xl">Track your study sessions, gym grinds, and creative sprints. Music that keeps you moving.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-8">
                    <BrutalCard className="border-zed-green">
                      <h3 className="text-2xl font-black mb-6">NEW GOAL</h3>
                      <div className="space-y-4">
                        <input type="text" placeholder="GOAL TITLE" className="w-full bg-transparent border-2 border-zed-white p-3 font-bold focus:border-zed-green focus:ring-0" />
                        <input type="number" placeholder="TARGET HOURS" className="w-full bg-transparent border-2 border-zed-white p-3 font-bold focus:border-zed-green focus:ring-0" />
                        <button className="w-full py-3 bg-zed-green text-zed-black font-black border-2 border-zed-black shadow-[4px_4px_0px_0px_black]">START HUSTLE</button>
                      </div>
                    </BrutalCard>
                    
                    <BrutalCard className="bg-zed-black border-zed-orange">
                      <h3 className="text-xl font-black mb-2 text-zed-orange">HUSTLE STATS</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between font-mono text-sm">
                          <span>TOTAL HUSTLE</span>
                          <span className="text-zed-green">124.5 HRS</span>
                        </div>
                        <div className="flex justify-between font-mono text-sm">
                          <span>RANK</span>
                          <span className="text-zed-purple">LSK_HUSTLER</span>
                        </div>
                      </div>
                    </BrutalCard>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {goals.map(goal => (
                      <BrutalCard key={`goal-${goal.id}`} className={goal.status === 'completed' ? 'opacity-50 grayscale' : ''}>
                        <div className="flex justify-between items-start mb-6">
                          <h3 className="text-2xl font-black leading-none">{goal.title}</h3>
                          <Target className={goal.status === 'completed' ? 'text-zinc-500' : 'text-zed-green'} />
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between font-mono text-xs">
                            <span>PROGRESS</span>
                            <span>{Math.round((goal.current_hours / goal.target_hours) * 100)}%</span>
                          </div>
                          <div className="h-6 border-2 border-zed-white bg-white/5 p-1">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(goal.current_hours / goal.target_hours) * 100}%` }}
                              className="h-full bg-zed-green"
                            />
                          </div>
                          <div className="flex justify-between font-mono text-[10px] text-zinc-500">
                            <span>{goal.current_hours} HRS</span>
                            <span>{goal.target_hours} HRS</span>
                          </div>
                        </div>
                      </BrutalCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12"
              >
                <div className="brutal-border bg-zed-green p-10 text-zed-black">
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-24 h-24 border-4 border-zed-black bg-zed-purple flex items-center justify-center shadow-[8px_8px_0px_0px_black]">
                      <User size={64} />
                    </div>
                    <div>
                      <h2 className="text-6xl font-black leading-none">ZED_VIBER</h2>
                      <p className="text-xl font-bold uppercase">LSK Resident • Premium Member</p>
                    </div>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {userBadges.map((badge, i) => (
                      <div key={i} className="bg-zed-black text-zed-white px-4 py-2 border-2 border-zed-white font-black text-sm flex items-center gap-2 shadow-[4px_4px_0px_0px_white]">
                        <BadgeCheck size={18} className="text-zed-green" />
                        {badge}
                      </div>
                    ))}
                    {userBadges.length === 0 && <p className="font-mono text-sm italic opacity-60">No badges earned yet. Start the hustle!</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <BrutalCard className="border-zed-purple">
                    <h3 className="text-2xl font-black mb-6">ARTIST VERIFICATION</h3>
                    <p className="text-zinc-400 mb-6">Are you a creator? Claim your profile to get the verified badge and unlock artist analytics.</p>
                    <div className="space-y-4">
                      <input type="text" placeholder="ARTIST NAME" className="w-full bg-transparent border-2 border-zed-white p-3 font-bold focus:border-zed-green focus:ring-0" />
                      <button 
                        onClick={async () => {
                          const name = prompt("Enter artist name to verify:");
                          if (name) {
                            await fetch('/api/artists/verify', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ artistName: name })
                            });
                            fetchData();
                            alert(`${name} is now verified!`);
                          }
                        }}
                        className="w-full py-3 bg-zed-purple text-zed-white font-black border-2 border-zed-black shadow-[4px_4px_0px_0px_black]"
                      >
                        CLAIM PROFILE
                      </button>
                    </div>
                  </BrutalCard>

                  <BrutalCard className="border-zed-orange">
                    <h3 className="text-2xl font-black mb-6">HUSTLE SUMMARY</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm">ACTIVE GOALS</span>
                        <span className="text-2xl font-black">{goals.filter(g => g.status === 'active').length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-sm">COMPLETED</span>
                        <span className="text-2xl font-black text-zed-green">{goals.filter(g => g.status === 'completed').length}</span>
                      </div>
                      <div className="pt-4 border-t-2 border-zed-white/10">
                        <button onClick={() => setView('hustle')} className="text-zed-orange font-black hover:underline">MANAGE GOALS →</button>
                      </div>
                    </div>
                  </BrutalCard>
                </div>
              </motion.div>
            )}

            {view === 'discovery' && (
              <motion.div 
                key="discovery"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-16"
              >
                <div className="flex items-center gap-6">
                  <Globe size={60} className="text-zed-green" />
                  <h2 className="text-7xl font-black">DISCOVERY HUB</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  {/* News */}
                  <div className="lg:col-span-2 space-y-10">
                    <h3 className="text-3xl font-black flex items-center gap-3">
                      <Newspaper className="text-zed-orange" />
                      LATEST NEWS
                    </h3>
                    <div className="space-y-8">
                      {[1, 2].map(i => (
                        <div key={`news-${i}`} className="flex flex-col md:flex-row gap-8 group cursor-pointer">
                          <div className="w-full md:w-64 aspect-video border-4 border-zed-white overflow-hidden flex-shrink-0">
                            <img src={`https://picsum.photos/seed/news${i}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <div className="flex gap-2 mb-2">
                              <span className="bg-zed-purple text-zed-white px-2 py-0.5 text-[10px] font-black">CULTURE</span>
                              <span className="text-[10px] font-mono text-zinc-500">MARCH 11, 2026</span>
                            </div>
                            <h4 className="text-2xl font-black leading-tight mb-3 group-hover:text-zed-green transition-colors">
                              {i === 1 ? "HOW ZAMBIAN GEN Z IS RECLAIMING AFRO-BEATS" : "THE RISE OF LUSAKA'S UNDERGROUND SYNTH SCENE"}
                            </h4>
                            <p className="text-zinc-400 line-clamp-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gig Guide */}
                  <div className="lg:col-span-1 space-y-10">
                    <h3 className="text-3xl font-black flex items-center gap-3">
                      <Calendar className="text-zed-purple" />
                      GIG GUIDE
                    </h3>
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <BrutalCard key={`gig-${i}`} className="p-4 border-zed-white hover:border-zed-green">
                          <div className="flex gap-4">
                            <div className="w-16 h-16 bg-zed-white text-zed-black flex flex-col items-center justify-center font-black leading-none">
                              <span className="text-xs">MAR</span>
                              <span className="text-2xl">{15 + i}</span>
                            </div>
                            <div>
                              <h4 className="font-black text-lg leading-none mb-1">Z-PULSE LIVE @ LSK</h4>
                              <p className="text-xs font-mono text-zinc-500">MANDA HILL • 20:00</p>
                              <button className="mt-3 text-[10px] font-black text-zed-green hover:underline">GET TICKETS</button>
                            </div>
                          </div>
                        </BrutalCard>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Player Bar */}
      <AnimatePresence>
        {currentTrack && (
          <motion.footer 
            initial={{ y: 150 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-zed-black border-t-4 border-zed-white p-6 z-40"
          >
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-12">
              {/* Track Info */}
              <div className="flex items-center gap-6 w-1/4">
                <div 
                  className="w-20 h-20 border-4 border-zed-white cursor-pointer group relative overflow-hidden"
                  onClick={() => setShowLyrics(!showLyrics)}
                >
                  <img 
                    src={currentTrack.cover_url} 
                    alt={currentTrack.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-zed-green/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare size={32} className="text-zed-black" />
                  </div>
                </div>
                <div className="min-w-0">
                  <h4 className="text-2xl font-black truncate leading-none mb-1">{currentTrack.title}</h4>
                  <p className="font-mono text-xs text-zinc-500 uppercase">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-4 flex-1">
                <div className="flex items-center gap-10">
                  <button className="text-zinc-500 hover:text-zed-white transition-colors"><Shuffle size={24} /></button>
                  <button onClick={prevTrack} className="text-zinc-500 hover:text-zed-white transition-colors"><SkipBack size={32} /></button>
                  <button 
                    onClick={togglePlay}
                    className="w-16 h-16 border-4 border-zed-white bg-zed-white text-zed-black flex items-center justify-center hover:bg-zed-green transition-colors shadow-[4px_4px_0px_0px_#8A2BE2]"
                  >
                    {isPlaying ? <div className="flex gap-1.5"><div className="w-2 h-6 bg-zed-black"></div><div className="w-2 h-6 bg-zed-black"></div></div> : <Play fill="black" size={32} className="ml-1" />}
                  </button>
                  <button onClick={nextTrack} className="text-zinc-500 hover:text-zed-white transition-colors"><SkipForward size={32} /></button>
                  <button className="text-zinc-500 hover:text-zed-white transition-colors"><Repeat size={24} /></button>
                </div>
                <div className="w-full max-w-2xl flex items-center gap-4">
                  <span className="font-mono text-[10px] text-zinc-500">1:24</span>
                  <div className="flex-1 h-3 border-2 border-zed-white bg-white/5 p-0.5">
                    <div className="h-full w-1/3 bg-zed-green" />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500">3:45</span>
                </div>
              </div>

              {/* Volume & Extras */}
              <div className="flex items-center justify-end gap-6 w-1/4">
                <button 
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`transition-colors ${showLyrics ? 'text-zed-green' : 'text-zinc-500 hover:text-zed-white'}`}
                >
                  <MessageSquare size={24} />
                </button>
                <div className="flex items-center gap-3 group">
                  <Volume2 size={24} className="text-zinc-500 group-hover:text-zed-white" />
                  <div className="w-24 h-2 border-2 border-zed-white bg-white/5">
                    <div className="h-full w-2/3 bg-zed-white" />
                  </div>
                </div>
                <button className="text-zinc-500 hover:text-zed-white transition-colors"><MoreHorizontal size={24} /></button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>

      {/* Lyrics Overlay */}
      <AnimatePresence>
        {showLyrics && currentTrack && (
          <motion.div 
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-zed-black flex flex-col"
          >
            <header className="p-8 flex justify-between items-center border-b-4 border-zed-white">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 border-4 border-zed-white">
                  <img src={currentTrack.cover_url} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div>
                  <h2 className="text-3xl font-black leading-none">{currentTrack.title}</h2>
                  <p className="font-mono text-sm text-zed-green uppercase">{currentTrack.artist}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowLyrics(false)}
                className="w-14 h-14 border-4 border-zed-white flex items-center justify-center hover:bg-zed-orange transition-colors"
              >
                <X size={32} />
              </button>
            </header>
            
            <div className="flex-1 overflow-y-auto p-10 md:p-20 space-y-12 text-center">
              {lyrics.map((line, i) => (
                <motion.p 
                  key={`lyric-${i}`}
                  initial={{ opacity: 0.2 }}
                  animate={{ opacity: i === 2 ? 1 : 0.2, scale: i === 2 ? 1.1 : 1 }}
                  className={`text-4xl md:text-7xl font-black uppercase tracking-tighter leading-tight ${i === 2 ? 'text-zed-green' : 'text-zed-white'}`}
                >
                  {line.text}
                </motion.p>
              ))}
            </div>

            <footer className="p-10 border-t-4 border-zed-white flex justify-center">
              <div className="flex items-center gap-12">
                 <button onClick={prevTrack} className="text-zed-white hover:text-zed-green transition-colors"><SkipBack size={48} /></button>
                 <button 
                    onClick={togglePlay}
                    className="w-24 h-24 border-4 border-zed-white bg-zed-white text-zed-black flex items-center justify-center hover:bg-zed-green transition-colors shadow-[8px_8px_0px_0px_#8A2BE2]"
                  >
                    {isPlaying ? <div className="flex gap-2"><div className="w-3 h-10 bg-zed-black"></div><div className="w-3 h-10 bg-zed-black"></div></div> : <Play fill="black" size={48} className="ml-2" />}
                  </button>
                 <button onClick={nextTrack} className="text-zed-white hover:text-zed-green transition-colors"><SkipForward size={48} /></button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
