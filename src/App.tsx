import React from 'react';
import { Home, Search, Library, Mic2, Radio, PlusSquare, Heart, Play, SkipBack, SkipForward, Repeat, Shuffle, Volume2, MoreHorizontal, User, Sparkles, Wand2, DollarSign, TrendingUp, BarChart3, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Track } from './types';
import { identifySong, getRecommendations } from './services/geminiService';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: React.ElementType, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors ${active ? 'text-vibe-blue' : 'text-zinc-400 hover:text-white'}`}
  >
    <Icon size={24} />
    <span className="font-medium">{label}</span>
  </div>
);

const TrackCard = ({ track, onPlay }: { track: Track, onPlay: (t: Track) => void, key?: React.Key }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-zinc-900/50 p-4 rounded-xl hover:bg-zinc-800/50 transition-all group cursor-pointer"
    onClick={() => onPlay(track)}
  >
    <div className="relative aspect-square mb-4 overflow-hidden rounded-lg">
      <img 
        src={track.cover_url} 
        alt={track.title} 
        className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="w-12 h-12 rounded-full vibe-gradient flex items-center justify-center shadow-lg">
          <Play fill="white" size={24} />
        </div>
      </div>
      {track.plays > 0 && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
          <TrendingUp size={10} className="text-vibe-green" />
          {track.plays}
        </div>
      )}
    </div>
    <h3 className="font-bold truncate">{track.title}</h3>
    <p className="text-sm text-zinc-400 truncate">{track.artist}</p>
  </motion.div>
);

const TipModal = ({ artistName, onClose, onSuccess }: { artistName: string, onClose: () => void, onSuccess: () => void }) => {
  const [amount, setAmount] = React.useState('5');
  const [message, setMessage] = React.useState('');
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleTip = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    await new Promise(r => setTimeout(r, 1500));
    
    await fetch('/api/artists/tip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        artist_name: artistName,
        amount: parseFloat(amount),
        sender_name: 'VibeFuse User',
        message
      })
    });
    
    setIsProcessing(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Support {artistName}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X /></button>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Amount (ZMW)</label>
            <div className="grid grid-cols-3 gap-3">
              {['5', '20', '50', '100', '200', '500'].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                  className={`py-3 rounded-xl font-bold transition-all ${amount === val ? 'vibe-gradient text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                >
                  K{val}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2 uppercase tracking-widest">Message (Optional)</label>
            <textarea 
              className="w-full bg-zinc-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-vibe-blue transition-all"
              placeholder="Say something nice..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <button 
            onClick={handleTip}
            disabled={isProcessing}
            className="w-full py-4 rounded-xl vibe-gradient font-bold text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <DollarSign size={20} />
                Send Tip
              </>
            )}
          </button>
          <p className="text-center text-xs text-zinc-500">Secure payment powered by VibeFuse Pay</p>
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  const [view, setView] = React.useState<'home' | 'charts' | 'dashboard'>('home');
  const [tracks, setTracks] = React.useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = React.useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isIdentifying, setIsIdentifying] = React.useState(false);
  const [aiRecs, setAiRecs] = React.useState<{title: string, artist: string}[]>([]);
  const [showTipModal, setShowTipModal] = React.useState<string | null>(null);
  const [artistStats, setArtistStats] = React.useState<{plays: number, tips: any[], totalTips: number} | null>(null);

  const fetchTracks = () => {
    fetch('/api/tracks')
      .then(res => res.json())
      .then(setTracks);
  };

  React.useEffect(() => {
    fetchTracks();
  }, []);

  const handlePlay = async (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    await fetch(`/api/tracks/${track.id}/play`, { method: 'POST' });
    fetchTracks(); // Refresh to show updated play counts
  };

  const handleIdentify = async () => {
    setIsIdentifying(true);
    const result = await identifySong();
    // Simulate finding it in our DB or just showing a toast
    alert(`VibeFuse identified: ${result.title} by ${result.artist}\n\nFun Fact: ${result.funFact}`);
    setIsIdentifying(false);
  };

  const handleGetRecs = async () => {
    if (tracks.length === 0) return;
    const history = tracks.slice(0, 3).map(t => `${t.title} by ${t.artist}`);
    const recs = await getRecommendations(history);
    setAiRecs(recs);
  };

  const filteredTracks = tracks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const localTracks = tracks.filter(t => t.is_local);

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-950 flex flex-col border-r border-zinc-800">
        <div className="p-6">
          <h1 className="text-2xl font-black tracking-tighter vibe-gradient bg-clip-text text-transparent italic">VIBEFUSE</h1>
        </div>
        
        <nav className="flex-1">
          <SidebarItem icon={Home} label="Home" active={view === 'home'} onClick={() => setView('home')} />
          <SidebarItem icon={TrendingUp} label="Lusaka Pulse" active={view === 'charts'} onClick={() => setView('charts')} />
          <SidebarItem icon={BarChart3} label="Artist Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarItem icon={Library} label="Your Library" />
          
          <div className="mt-8 px-6 mb-4">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Playlists</h2>
          </div>
          <SidebarItem icon={PlusSquare} label="Create Playlist" />
          <SidebarItem icon={Heart} label="Liked Songs" />
          <SidebarItem icon={Radio} label="Live Sessions" />
          <SidebarItem icon={Mic2} label="Lusaka Local" />
        </nav>

        <div className="p-4">
          <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
            <p className="text-xs font-bold text-vibe-blue mb-1">PREMIUM</p>
            <p className="text-sm font-medium mb-3">Get ad-free music & offline mode.</p>
            <button className="w-full py-2 rounded-lg vibe-gradient text-sm font-bold">Upgrade Now</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-black pb-32">
        <header className="sticky top-0 z-10 bg-zinc-900/80 backdrop-blur-md p-6 flex items-center justify-between">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
              <input 
                type="text" 
                placeholder="Search for artists, songs, or vibes..."
                className="w-full bg-zinc-800 border-none rounded-full py-2 pl-12 pr-4 focus:ring-2 focus:ring-vibe-blue transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleIdentify}
              disabled={isIdentifying}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all ${isIdentifying ? 'bg-zinc-800 text-zinc-500' : 'bg-vibe-purple hover:scale-105'}`}
            >
              <Sparkles size={18} className={isIdentifying ? 'animate-spin' : ''} />
              {isIdentifying ? 'Listening...' : 'Identify Vibe'}
            </button>
            <button className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <User size={24} />
            </button>
          </div>
        </header>

        <div className="p-8">
          {view === 'home' && (
            <>
              {/* Hero Section */}
              {!searchQuery && (
                <section className="mb-12">
                  <div className="vibe-gradient rounded-3xl p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                      <h2 className="text-5xl font-black mb-4 tracking-tight">Lusaka Pulse</h2>
                      <p className="text-xl mb-6 opacity-90 max-w-md">Discover the hottest tracks trending right now in the heart of Zambia.</p>
                      <button 
                        onClick={() => setView('charts')}
                        className="bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
                      >
                        Listen Now
                      </button>
                    </div>
                    <div className="absolute right-0 top-0 h-full w-1/2 opacity-20 pointer-events-none">
                       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
                    </div>
                  </div>
                </section>
              )}

              {/* AI Recommendations */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold">AI Vibe Picks</h2>
                    <Wand2 size={20} className="text-vibe-pink" />
                  </div>
                  <button 
                    onClick={handleGetRecs}
                    className="text-sm font-bold text-vibe-blue hover:underline uppercase tracking-widest"
                  >
                    Refresh Recs
                  </button>
                </div>
                {aiRecs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {aiRecs.map((rec, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-zinc-900/80 p-6 rounded-2xl border border-white/5 flex items-center gap-4"
                      >
                        <div className="w-12 h-12 rounded-full vibe-gradient-alt flex items-center justify-center flex-shrink-0">
                          <Sparkles size={20} />
                        </div>
                        <div>
                          <h3 className="font-bold">{rec.title}</h3>
                          <p className="text-sm text-zinc-400">{rec.artist}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-2xl p-12 text-center">
                    <p className="text-zinc-500 mb-4">Let our AI curate your next favorite track.</p>
                    <button 
                      onClick={handleGetRecs}
                      className="px-6 py-2 rounded-full border border-vibe-blue text-vibe-blue font-bold hover:bg-vibe-blue hover:text-black transition-all"
                    >
                      Generate Recommendations
                    </button>
                  </div>
                )}
              </section>

              {/* Local Artists */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Lusaka Local</h2>
                  <button className="text-sm font-bold text-zinc-400 hover:text-white uppercase tracking-widest">Show all</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {localTracks.map(track => (
                    <div key={track.id} className="relative group">
                      <TrackCard track={track} onPlay={handlePlay} />
                      <button 
                        onClick={(e) => { e.stopPropagation(); setShowTipModal(track.artist); }}
                        className="absolute bottom-20 right-6 w-8 h-8 rounded-full bg-vibe-green text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
                      >
                        <DollarSign size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Live Sessions */}
              <section className="mb-12">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Live Sessions</h2>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest">Live Now</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer">
                    <img src="https://picsum.photos/seed/live1/800/400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold">Chef 187: Unplugged</h3>
                      <p className="text-sm text-zinc-300">Live from Lusaka • 1.2k watching</p>
                    </div>
                  </div>
                  <div className="relative h-48 rounded-2xl overflow-hidden group cursor-pointer">
                    <img src="https://picsum.photos/seed/live2/800/400" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                      <h3 className="text-xl font-bold">Cleo Ice Queen: Studio Vibes</h3>
                      <p className="text-sm text-zinc-300">Live from Ndola • 850 watching</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Global Hits */}
              <section>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Global Vibes</h2>
                  <button className="text-sm font-bold text-zinc-400 hover:text-white uppercase tracking-widest">Show all</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {tracks.filter(t => !t.is_local).map(track => (
                    <TrackCard key={track.id} track={track} onPlay={handlePlay} />
                  ))}
                </div>
              </section>
            </>
          )}

          {view === 'charts' && (
            <section className="max-w-4xl mx-auto">
              <div className="flex items-end gap-8 mb-12">
                <div className="w-48 h-48 vibe-gradient rounded-2xl shadow-2xl flex items-center justify-center">
                  <TrendingUp size={80} className="text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-2">Playlist</h2>
                  <h1 className="text-7xl font-black tracking-tight mb-4">Lusaka Pulse</h1>
                  <p className="text-zinc-400">The most played tracks in Lusaka right now. Updated every hour.</p>
                </div>
              </div>

              <div className="bg-zinc-900/50 rounded-3xl overflow-hidden border border-zinc-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-zinc-500 text-xs uppercase tracking-widest border-b border-zinc-800">
                      <th className="p-4 w-12 text-center">#</th>
                      <th className="p-4">Title</th>
                      <th className="p-4">Album</th>
                      <th className="p-4 text-right">Plays</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracks.sort((a, b) => b.plays - a.plays).map((track, i) => (
                      <tr 
                        key={track.id} 
                        onClick={() => handlePlay(track)}
                        className="group hover:bg-white/5 transition-colors cursor-pointer border-b border-zinc-800/50 last:border-none"
                      >
                        <td className="p-4 text-center text-zinc-500 font-mono">{i + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <img src={track.cover_url} className="w-10 h-10 rounded object-cover" referrerPolicy="no-referrer" />
                            <div>
                              <div className="font-bold group-hover:text-vibe-blue transition-colors">{track.title}</div>
                              <div className="text-sm text-zinc-400">{track.artist}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-zinc-400">{track.album}</td>
                        <td className="p-4 text-right font-mono text-vibe-green">{track.plays}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {view === 'dashboard' && (
            <section className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <h1 className="text-4xl font-black tracking-tight">Artist Dashboard</h1>
                <div className="flex gap-4">
                  <select 
                    className="bg-zinc-800 border-none rounded-xl px-4 py-2 text-sm font-bold"
                    onChange={async (e) => {
                      const res = await fetch(`/api/artists/${e.target.value}/stats`);
                      const data = await res.json();
                      setArtistStats(data);
                    }}
                  >
                    <option value="">Select Artist Profile</option>
                    {Array.from(new Set(tracks.map(t => t.artist))).map(a => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>
              </div>

              {artistStats ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-8">
                    <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Plays</p>
                      <h3 className="text-5xl font-black text-vibe-blue">{artistStats.plays}</h3>
                    </div>
                    <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
                      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Total Tips</p>
                      <h3 className="text-5xl font-black text-vibe-green">K{artistStats.totalTips.toFixed(2)}</h3>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <div className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden">
                      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                        <h3 className="font-bold">Recent Tips</h3>
                        <DollarSign className="text-vibe-green" />
                      </div>
                      <div className="divide-y divide-zinc-800">
                        {artistStats.tips.length > 0 ? artistStats.tips.map((tip, i) => (
                          <div key={i} className="p-6 flex justify-between items-start">
                            <div>
                              <p className="font-bold">{tip.sender_name}</p>
                              <p className="text-sm text-zinc-400 italic">"{tip.message}"</p>
                              <p className="text-[10px] text-zinc-600 mt-2 uppercase">{new Date(tip.timestamp).toLocaleString()}</p>
                            </div>
                            <div className="text-vibe-green font-black text-xl">+K{tip.amount}</div>
                          </div>
                        )) : (
                          <div className="p-12 text-center text-zinc-500">No tips received yet. Keep vibing!</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/30 border border-dashed border-zinc-800 rounded-3xl p-24 text-center">
                  <BarChart3 size={48} className="mx-auto text-zinc-700 mb-4" />
                  <p className="text-zinc-500">Select an artist profile to view analytics and tips.</p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* Player Bar */}
      <AnimatePresence>
        {showTipModal && (
          <TipModal 
            artistName={showTipModal} 
            onClose={() => setShowTipModal(null)} 
            onSuccess={() => alert('Tip sent! Your support means the world to the artist.')}
          />
        )}
        {currentTrack && (
          <motion.footer 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 p-4 z-20"
          >
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-8">
              {/* Track Info */}
              <div className="flex items-center gap-4 w-1/3">
                <img 
                  src={currentTrack.cover_url} 
                  alt={currentTrack.title} 
                  className="w-14 h-14 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <h4 className="font-bold truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-zinc-400 truncate">{currentTrack.artist}</p>
                </div>
                <button className="text-zinc-400 hover:text-vibe-pink transition-colors">
                  <Heart size={20} />
                </button>
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-2 flex-1">
                <div className="flex items-center gap-6">
                  <button className="text-zinc-400 hover:text-white transition-colors"><Shuffle size={20} /></button>
                  <button className="text-zinc-400 hover:text-white transition-colors"><SkipBack size={24} /></button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                  >
                    {isPlaying ? <div className="flex gap-1"><div className="w-1 h-4 bg-black"></div><div className="w-1 h-4 bg-black"></div></div> : <Play fill="black" size={20} className="ml-1" />}
                  </button>
                  <button className="text-zinc-400 hover:text-white transition-colors"><SkipForward size={24} /></button>
                  <button className="text-zinc-400 hover:text-white transition-colors"><Repeat size={20} /></button>
                </div>
                <div className="w-full max-w-md flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">0:00</span>
                  <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden group cursor-pointer">
                    <div className="h-full w-1/3 vibe-gradient group-hover:bg-vibe-blue transition-colors"></div>
                  </div>
                  <span className="text-[10px] text-zinc-500">3:45</span>
                </div>
              </div>

              {/* Volume & Extras */}
              <div className="flex items-center justify-end gap-4 w-1/3">
                <button className="text-zinc-400 hover:text-white transition-colors"><Mic2 size={20} /></button>
                <button className="text-zinc-400 hover:text-white transition-colors"><Volume2 size={20} /></button>
                <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-zinc-400"></div>
                </div>
                <button className="text-zinc-400 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
              </div>
            </div>
          </motion.footer>
        )}
      </AnimatePresence>
    </div>
  );
}
