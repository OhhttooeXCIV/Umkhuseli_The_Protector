import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Shuffle,
  Repeat,
  Heart,
  Search,
  Volume2,
  VolumeX,
  Disc,
  ListMusic,
  DownloadCloud,
  CheckCircle2,
} from 'lucide-react';

export interface CocoBongoMusicFacadeProps {
  onUnlockSafeHaven: () => void;
  onDuressTrigger?: () => void;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  genre: 'Amapiano' | 'Afro House' | 'Gospel' | 'Kwaito';
  coverGradient: string;
}

const PLAYLIST_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Banyana Bafana (Summer Groove)',
    artist: 'DJ Edge City ft. Coco Bongo All-Stars',
    album: 'Edge City Nights Vol. 3',
    duration: '06:14',
    genre: 'Amapiano',
    coverGradient: 'from-amber-500 via-rose-600 to-violet-800',
  },
  {
    id: 'track-2',
    title: 'Siyabonga Baba (Praise Refrain)',
    artist: 'Soweto Youth Gospel Choir',
    album: 'Izwi Laphakade',
    duration: '05:32',
    genre: 'Gospel',
    coverGradient: 'from-sky-500 via-indigo-600 to-purple-800',
  },
  {
    id: 'track-3',
    title: 'Durban Deep Ocean Sunset',
    artist: 'Milo Grooves',
    album: 'Club Bongo Sessions',
    duration: '07:18',
    genre: 'Afro House',
    coverGradient: 'from-emerald-500 via-teal-600 to-cyan-800',
  },
  {
    id: 'track-4',
    title: 'Gumboots & Kwaito Rhythm',
    artist: 'Orlando Brothers',
    album: 'Soweto Soul Classics',
    duration: '04:45',
    genre: 'Kwaito',
    coverGradient: 'from-fuchsia-500 via-pink-600 to-rose-800',
  },
  {
    id: 'track-5',
    title: 'Midnight in Edge City (Loki Funk)',
    artist: 'The Yellow Suit Ensemble',
    album: 'Hey Pachuco Grooves',
    duration: '08:42',
    genre: 'Amapiano',
    coverGradient: 'from-yellow-400 via-emerald-600 to-slate-900',
  },
];

export const CocoBongoMusicFacade: React.FC<CocoBongoMusicFacadeProps> = ({
  onUnlockSafeHaven,
  onDuressTrigger,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set(['track-1']));
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [progressSec, setProgressSec] = useState<number>(145);

  // Covert 3-tap gesture tracking on album art
  const tapTimesRef = useRef<number[]>([]);
  // Long-press timer on heart button for covert Duress SOS
  const heartPressTimerRef = useRef<number | null>(null);

  const currentTrack = PLAYLIST_TRACKS[currentTrackIndex];

  // Handle Search Submission (Covert PIN triggers)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.trim();

    if (clean === '8426') {
      onUnlockSafeHaven();
      return;
    }

    if (clean === '9999') {
      if (onDuressTrigger) {
        onDuressTrigger();
      }
      setSearchFeedback('Loading offline audio cache for station #9999...');
      setTimeout(() => setSearchFeedback(null), 3000);
      setSearchQuery('');
      return;
    }

    if (clean.length > 0) {
      const matchIndex = PLAYLIST_TRACKS.findIndex(
        (t) =>
          t.title.toLowerCase().includes(clean.toLowerCase()) ||
          t.artist.toLowerCase().includes(clean.toLowerCase()) ||
          t.genre.toLowerCase().includes(clean.toLowerCase())
      );
      if (matchIndex !== -1) {
        setCurrentTrackIndex(matchIndex);
        setIsPlaying(true);
        setSearchFeedback(`Playing match: ${PLAYLIST_TRACKS[matchIndex].title}`);
      } else {
        setSearchFeedback(`Searching catalog for "${clean}"...`);
      }
      setTimeout(() => setSearchFeedback(null), 3000);
    }
  };

  // Covert 3-Tap gesture on Album Art
  const handleAlbumArtClick = () => {
    const now = Date.now();
    tapTimesRef.current = [...tapTimesRef.current.filter((t) => now - t < 800), now];
    if (tapTimesRef.current.length >= 3) {
      tapTimesRef.current = [];
      onUnlockSafeHaven();
    }
  };

  // Covert Heart Long-Press (Duress SOS)
  const handleHeartPointerDown = () => {
    heartPressTimerRef.current = window.setTimeout(() => {
      if (onDuressTrigger) {
        onDuressTrigger();
      }
      setSearchFeedback('Track added to Private Offline Favorites');
      setTimeout(() => setSearchFeedback(null), 2500);
    }, 3500);
  };

  const handleHeartPointerUp = () => {
    if (heartPressTimerRef.current) {
      clearTimeout(heartPressTimerRef.current);
      heartPressTimerRef.current = null;
    }
  };

  const toggleFavorite = (trackId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST_TRACKS.length);
    setProgressSec(0);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + PLAYLIST_TRACKS.length) % PLAYLIST_TRACKS.length);
    setProgressSec(0);
    setIsPlaying(true);
  };

  // Covert Scrubber Click (Trigger at 08:42 timestamp)
  const handleSecretScrubberClick = () => {
    onUnlockSafeHaven();
  };

  const filteredTracks = selectedGenre === 'All'
    ? PLAYLIST_TRACKS
    : PLAYLIST_TRACKS.filter((t) => t.genre === selectedGenre);

  return (
    <div
      data-testid="coco-bongo-music-facade"
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between max-w-md mx-auto select-none border-x border-slate-800 font-sans pb-6"
    >
      {/* Tactical Decoy Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 p-4 sticky top-0 z-40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Disc className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tight text-white flex items-center gap-1.5">
                <span>COCO BONGO BEATS</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-mono font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                  HD
                </span>
              </h1>
              <span className="text-[10px] text-slate-400 block font-mono">
                Edge City Soundworks • Mzansi Edition
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] bg-slate-800/80 px-2 py-1 rounded-full text-slate-300 border border-slate-700">
            <DownloadCloud className="w-3 h-3 text-emerald-400" />
            <span>48 Tracks Cached</span>
          </div>
        </div>

        {/* Search Bar with Covert PIN Entry */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracks, artists, amapiano..."
            aria-label="Search music catalog"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-8 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              type="submit"
              className="absolute right-2.5 top-2 text-[10px] font-bold text-emerald-400 hover:text-emerald-300"
            >
              Go
            </button>
          )}
        </form>

        {searchFeedback && (
          <div className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 p-2 rounded-lg text-center font-mono animate-fadeIn">
            {searchFeedback}
          </div>
        )}
      </header>

      {/* Main Music Player View */}
      <main className="p-4 flex-1 space-y-4 overflow-y-auto">
        {/* Album Art & Vinyl Disc Display (Sensor for Covert 3-Tap) */}
        <div className="relative bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl p-5 border border-slate-800 shadow-xl overflow-hidden text-center">
          <div
            data-testid="album-art-sensor"
            onClick={handleAlbumArtClick}
            className="relative mx-auto w-48 h-48 rounded-2xl shadow-2xl cursor-pointer group transition-transform active:scale-95 flex items-center justify-center overflow-hidden border-2 border-slate-700/60"
            title="Album Artwork"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentTrack.coverGradient} opacity-90 transition-all`}
            />
            {/* Spinning Vinyl Record Visual */}
            <div
              className={`w-36 h-36 rounded-full border-4 border-slate-900/80 bg-slate-950/90 flex items-center justify-center shadow-inner ${
                isPlaying ? 'animate-spin' : ''
              }`}
              style={{ animationDuration: '6s' }}
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-rose-600 flex items-center justify-center border-2 border-white/20">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-950" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 text-[9px] bg-slate-950/80 text-slate-300 px-2 py-0.5 rounded-md font-mono border border-slate-700">
              {currentTrack.genre}
            </div>
          </div>

          {/* Track Details */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-left flex-1 min-w-0 pr-2">
              <h2 className="text-sm font-bold text-white truncate">{currentTrack.title}</h2>
              <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">{currentTrack.album}</p>
            </div>

            {/* Favorite Heart with Covert Long-Press Sensor */}
            <button
              type="button"
              data-testid="favorite-heart-button"
              onClick={() => toggleFavorite(currentTrack.id)}
              onPointerDown={handleHeartPointerDown}
              onPointerUp={handleHeartPointerUp}
              onPointerLeave={handleHeartPointerUp}
              aria-label={favorites.has(currentTrack.id) ? 'Unlike track' : 'Like track'}
              className="p-2.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <Heart
                className={`w-4 h-4 ${
                  favorites.has(currentTrack.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                }`}
              />
            </button>
          </div>

          {/* Audio Scrubber & Waveform Visualizer */}
          <div className="mt-4 space-y-1.5">
            {/* Animated CSS Waveform */}
            <div className="h-6 flex items-center justify-center gap-1 px-4 py-1">
              {[18, 32, 45, 20, 60, 80, 50, 30, 70, 95, 65, 40, 25, 55, 75, 45, 30, 20].map(
                (height, i) => (
                  <span
                    key={i}
                    className={`w-1 rounded-full bg-emerald-400 transition-all duration-150 ${
                      isPlaying ? 'opacity-90' : 'opacity-30'
                    }`}
                    style={{
                      height: isPlaying ? `${Math.max(12, (height * (i % 2 === 0 ? 1 : 0.8)))}%` : '20%',
                    }}
                  />
                )
              )}
            </div>

            {/* Progress Slider */}
            <input
              type="range"
              min={0}
              max={300}
              value={progressSec}
              onChange={(e) => setProgressSec(Number(e.target.value))}
              aria-label="Track progress slider"
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>02:25</span>
              {/* Covert 08:42 trigger indicator */}
              <button
                type="button"
                data-testid="secret-scrubber-timestamp"
                onClick={handleSecretScrubberClick}
                className="hover:text-slate-400 transition-colors"
                title="Total track duration"
              >
                {currentTrack.duration}
              </button>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIsShuffle(!isShuffle)}
              aria-label="Toggle shuffle"
              className={`p-2 rounded-lg transition-colors ${
                isShuffle ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handlePrevTrack}
              aria-label="Previous track"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              type="button"
              data-testid="play-pause-button"
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause music' : 'Play music'}
              className="p-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-slate-950" /> : <Play className="w-5 h-5 fill-slate-950 ml-0.5" />}
            </button>

            <button
              type="button"
              onClick={handleNextTrack}
              aria-label="Next track"
              className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsRepeat(!isRepeat)}
              aria-label="Toggle repeat"
              className={`p-2 rounded-lg transition-colors ${
                isRepeat ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Genre Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {['All', 'Amapiano', 'Gospel', 'Afro House', 'Kwaito'].map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-full font-medium transition-colors shrink-0 text-xs ${
                selectedGenre === genre
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Track Playlist Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            <span className="flex items-center gap-1.5">
              <ListMusic className="w-3.5 h-3.5 text-emerald-400" />
              Playlist Queue
            </span>
            <span className="font-mono text-[10px]">{filteredTracks.length} Songs</span>
          </div>

          <div className="space-y-1.5">
            {filteredTracks.map((track, idx) => {
              const isSelected = PLAYLIST_TRACKS[currentTrackIndex].id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => {
                    const globalIdx = PLAYLIST_TRACKS.findIndex((t) => t.id === track.id);
                    if (globalIdx !== -1) setCurrentTrackIndex(globalIdx);
                    setIsPlaying(true);
                  }}
                  className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-colors text-xs ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-white'
                      : 'bg-slate-900/80 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="text-[10px] font-mono text-slate-500 w-4 text-center">
                      {idx + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${track.coverGradient} flex items-center justify-center shrink-0`}>
                      {isSelected && isPlaying ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      ) : (
                        <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white truncate text-xs">{track.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-slate-500">{track.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="p-3 border-t border-slate-900 text-center text-[10px] text-slate-500">
        Coco Bongo Media Player • Edge City Sounds v2.6.0
      </footer>
    </div>
  );
};
