import React, { useState, useRef } from 'react';
import {
  BookOpen,
  Bookmark,
  Search,
  Cross,
  Share2,
  Sun,
  KeyRound,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Volume2,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

export interface DailyDevotionalFacadeProps {
  onUnlockSafeHaven: () => void;
  onDuressTrigger?: () => void;
}

export type SupportedLanguage = 'en' | 'zu' | 'st';

interface ScripturePassage {
  id: string;
  reference: {
    en: string;
    zu: string;
    st: string;
  };
  title: {
    en: string;
    zu: string;
    st: string;
  };
  text: {
    en: string;
    zu: string;
    st: string;
  };
  reflection: {
    en: string;
    zu: string;
    st: string;
  };
  category: 'psalms' | 'proverbs';
}

interface VoiceNoteSermon {
  id: string;
  speaker: string;
  ministry: string;
  title: {
    en: string;
    zu: string;
    st: string;
  };
  duration: string;
  scriptureTag: string;
}

const DEVOTIONAL_PASSAGES: ScripturePassage[] = [
  {
    id: 'psalm-23',
    reference: {
      en: 'Psalm 23:1-4',
      zu: 'AmaHubo 23:1-4',
      st: 'Pesaleme 23:1-4',
    },
    title: {
      en: 'The Lord is My Shepherd',
      zu: 'UJehova Ungumalusi Wami',
      st: 'Jehova ke Modisa wa Ka',
    },
    text: {
      en: 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures; He leads me beside still waters. He restores my soul; He leads me in paths of righteousness for His name’s sake. Even though I walk through the valley of the shadow of death, I will fear no evil, for You are with me.',
      zu: 'UJehova ungumalusi wami; angiyikuswela. Uyangilalisa emadlelweni aluhlaza; uyangiyisa ngasemanzini okuphumula. Uyawubuyisa umphefumulo wami; uyangihola ezindleleni zokulunga ngenxa yegama lakhe. Noma ngihamba esigodini sethunzi lokufa, angesabi okubi, ngokuba wena unami.',
      st: 'Jehova ke modisa wa ka, nke ke ka hloka letho. O mphomotsa mabaleng a matala, o nkisa pela metsi a nang le phomolo. O tsosa moya wa ka, o ntsamaisa ditseleng tsa ho loka ka baka la lebitso la hae. Leha nka tsamaya kgohlong ya moriti wa lefu, nke ke ka tshaba bobe, hobane o na le nna.',
    },
    reflection: {
      en: 'Take heart today knowing you are guided, guarded, and sustained by an unshakeable love.',
      zu: 'Yiba nesibindi namuhla wazi ukuthi uholwa, uvikelwe, futhi usekelwa uthando olungenakunyakaziswa.',
      st: 'Eba le sebete kajeno o tsebe hore o tataiswa, o sireleditswe ke lerato le sa thekeseleng.',
    },
    category: 'psalms',
  },
  {
    id: 'psalm-91',
    reference: {
      en: 'Psalm 91:1-4',
      zu: 'AmaHubo 91:1-4',
      st: 'Pesaleme 91:1-4',
    },
    title: {
      en: 'Abiding Under the Shadow of the Almighty',
      zu: 'Isiphephelo Somandla',
      st: 'Tshireletso ya Ea Phahameng',
    },
    text: {
      en: 'He who dwells in the secret place of the Most High shall abide under the shadow of the Almighty. I will say of the Lord, "He is my refuge and my fortress; my God, in Him I will trust." Surely He shall deliver you from the snare of the fowler and from the perilous pestilence. He shall cover you with His feathers.',
      zu: 'Ohlezi esiphephelweni soPhezukonke uyakuhlala emthunzini kaSomandla. Ngiyakusho ngoJehova ngithi: "Uliphephelo lami nenqaba yami, uNkulunkulu wami engimethembayo." Ngokuba yena uyakukophula ogibeni lomthiyi nasesifweni esibulalayo. Uyakukusibekela ngezimpiko zakhe.',
      st: 'Ya dutseng tshireletsong ya Ea Phahameng o tla dula moriting wa Ya Matla Ohle. Ke re ho Jehova: "O setshabelo sa ka le qhobosheane ya ka, Modimo wa ka eo ke mo tshepang." Hobane o tla o namolela lerabeng la mothiyi le lefung la sewa le kotsi. O tla o bipa ka dipheo tsa hae.',
    },
    reflection: {
      en: 'In times of trials, divine shelter surrounds you like a fortress.',
      zu: 'Ezikhathini zobunzima, isiphephelo saphezulu sikuzungezile njengenqaba eqinile.',
      st: 'Mehleng ya ditsietsi, seriti sa Modimo se o teetse hare jwaloka qhobosheane.',
    },
    category: 'psalms',
  },
  {
    id: 'psalm-121',
    reference: {
      en: 'Psalm 121:1-3',
      zu: 'AmaHubo 121:1-3',
      st: 'Pesaleme 121:1-3',
    },
    title: {
      en: 'My Help Comes From the Lord',
      zu: 'Usizo Lwami Luvela kuJehova',
      st: 'Thuso ya ka e Tswa ho Jehova',
    },
    text: {
      en: 'I lift up my eyes to the hills—where does my help come from? My help comes from the Lord, the Maker of heaven and earth. He will not let your foot slip—He who watches over you will not slumber.',
      zu: 'Ngiphakamisela amehlo ami ezintabeni: Usizo lwami luyakuvelaphi na? Usizo lwami luvela kuJehova owenza izulu nomhlaba. Akayikuvuma ukuba unyawo lwakho lushelele; lowo okulondolozayo akayikozela.',
      st: 'Ke phamisetsa mahlo a ka dithabeng: Thuso ya ka e tla tswa kae na? Thuso ya ka e tswa ho Jehova, Ya entseng lehodimo le lefatshe. A ke ke a dumella leoto la hao ho thella; Ya o lebelang a ke ke a thoba boroko.',
    },
    reflection: {
      en: 'Never lose hope; the One who protects you is ever vigilant and unwavering.',
      zu: 'Ungalahli ithemba; lowo okugadile uqaphile ngaso sonke isikhathi.',
      st: 'O se fele pelo; Ya o lebelang o fadimehile ka dinako tsohle.',
    },
    category: 'psalms',
  },
  {
    id: 'proverbs-3',
    reference: {
      en: 'Proverbs 3:5-6',
      zu: 'IzAga 3:5-6',
      st: 'Maele 3:5-6',
    },
    title: {
      en: 'Trust in the Lord with All Your Heart',
      zu: 'Themba kuJehova',
      st: 'Tshepa Jehova ka Pelo ya Hao',
    },
    text: {
      en: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight.',
      zu: 'Themba kuJehova ngayo yonke inhliziyo yakho, ungenciki kokwakho ukuqonda; mazise yena ezindleleni zakho zonke, uyakuqondisa imikhondo yakho.',
      st: 'Tshepa Jehova ka pelo ya hao yohle, o se ke wa itshetleha ka kutlwisiso ya hao. Mo tsebe ditseleng tsohle tsa hao, mme o tla tsamaisa mehato ya hao.',
    },
    reflection: {
      en: 'Surrender your anxiety and let wisdom and divine guidance lead each step.',
      zu: 'Dedela ukukhathazeka kwakho uvumele ukuhlakanipha kuhole zonke izinyathelo zakho.',
      st: 'Tlohela matshwenyeho a hao o dumelle bohlale ba Modimo ho o tsamaisa.',
    },
    category: 'proverbs',
  },
  {
    id: 'proverbs-31',
    reference: {
      en: 'Proverbs 31:25-26',
      zu: 'IzAga 31:25-26',
      st: 'Maele 31:25-26',
    },
    title: {
      en: 'Clothed with Strength and Dignity',
      zu: 'Ugqoke Amandla Nesizotha',
      st: 'A apere Matla le Seriti',
    },
    text: {
      en: 'She is clothed with strength and dignity; she can laugh at the days to come. She speaks with wisdom, and faithful instruction is on her tongue.',
      zu: 'Ugqoke amandla nesizotha; uhleka usuku oluzayo. Uvula umlomo wakhe ngokuhlakanipha, nomthetho womusa usolimini lwakhe.',
      st: 'O apere matla le seriti, mme o tsheha letsatsi le tlang. O bua ka bohlale, mme molao wa mosa o lelemeng la hae.',
    },
    reflection: {
      en: 'Honor the resilient spirit within. Strength, grace, and courage are your inheritance.',
      zu: 'Hlonipha amandla nobuqhawe obuphakathi kuwe. Isizotha nesibindi kuyifa lakho.',
      st: 'Hlompha matla a ka hare ho wena. Seriti le sebete ke lefa la hao.',
    },
    category: 'proverbs',
  },
];

const VOICE_NOTE_SERMONS: VoiceNoteSermon[] = [
  {
    id: 'vn-1',
    speaker: 'Pastor Mthembu',
    ministry: 'Soweto Fellowship Mission',
    title: {
      en: 'Walking Through the Shadow Without Fear',
      zu: 'Ukuhamba Esigodini Sesithunzi Somusa',
      st: 'Ho Tsamaya Kgohlong ya Moriti ka Tumelo',
    },
    duration: '02:14',
    scriptureTag: 'Psalm 23:4',
  },
  {
    id: 'vn-2',
    speaker: 'Rev. Khumalo',
    ministry: 'Durban Central Grace Chapel',
    title: {
      en: 'Divine Fortress in Secret Places',
      zu: 'Inqaba Yesivikelo Esiphephelweni',
      st: 'Qhobosheane ya Modimo Tshireletsong',
    },
    duration: '03:45',
    scriptureTag: 'Psalm 91:2',
  },
  {
    id: 'vn-3',
    speaker: 'Sister Bongiwe',
    ministry: 'Johannesburg Women in Faith',
    title: {
      en: 'Clothed with Unshakable Dignity',
      zu: 'Ukugqoka Amandla Nesizotha',
      st: 'Ho Apara Matla le Seriti',
    },
    duration: '01:50',
    scriptureTag: 'Proverbs 31:25',
  },
];

export const DailyDevotionalFacade: React.FC<DailyDevotionalFacadeProps> = ({
  onUnlockSafeHaven,
  onDuressTrigger,
}) => {
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [selectedPassageId, setSelectedPassageId] = useState<string>('psalm-23');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [bookmarks, setBookmarks] = useState<string[]>(['psalm-23']);
  const [showLookupModal, setShowLookupModal] = useState<boolean>(false);
  const [lookupCode, setLookupCode] = useState<string>('');
  const [lookupFeedback, setLookupFeedback] = useState<string | null>(null);

  // Voice Note Playback State
  const [activeVoiceNoteId, setActiveVoiceNoteId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.0x');

  // Community Prayer Request Box State
  const [prayerRequestText, setPrayerRequestText] = useState<string>('');
  const [prayerFeedback, setPrayerFeedback] = useState<string | null>(null);

  // Status Card Share Feedback
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  // Secret 4-tap gesture on the Cross icon
  const tapTimesRef = useRef<number[]>([]);

  const handleCrossTap = () => {
    const now = Date.now();
    const recentTaps = tapTimesRef.current.filter((t) => now - t < 1000);
    recentTaps.push(now);
    tapTimesRef.current = recentTaps;

    if (recentTaps.length >= 4) {
      tapTimesRef.current = [];
      onUnlockSafeHaven();
    }
  };

  // Secret PIN or Duress PIN validation
  const evaluateSecretCode = (code: string) => {
    const sanitized = code.trim();
    if (sanitized === '8426') {
      onUnlockSafeHaven();
      return true;
    }
    if (sanitized === '9999') {
      if (onDuressTrigger) {
        onDuressTrigger();
      }
      setLookupFeedback('Scripture reference not found in current offline edition. Showing Daily Reading.');
      return true;
    }
    return false;
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (evaluateSecretCode(searchQuery)) {
      setSearchQuery('');
      return;
    }

    const found = DEVOTIONAL_PASSAGES.find(
      (p) =>
        p.reference[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.title[lang].toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.text[lang].toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (found) {
      setSelectedPassageId(found.id);
      setLookupFeedback(null);
    } else {
      setLookupFeedback(`No passages found for "${searchQuery}".`);
    }
  };

  const handleLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (evaluateSecretCode(lookupCode)) {
      setLookupCode('');
      setShowLookupModal(false);
      return;
    }
    setLookupFeedback('Passage index verified. Chapter synchronized.');
    setTimeout(() => {
      setShowLookupModal(false);
      setLookupFeedback(null);
    }, 1200);
  };

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = prayerRequestText.trim();
    if (!clean) return;

    if (clean === '8426') {
      onUnlockSafeHaven();
      setPrayerRequestText('');
      return;
    }

    if (clean === '9999') {
      if (onDuressTrigger) {
        onDuressTrigger();
      }
      setPrayerFeedback('Prayer request received. Our intercession team is praying for you.');
      setPrayerRequestText('');
      setTimeout(() => setPrayerFeedback(null), 3500);
      return;
    }

    setPrayerFeedback('Your prayer request has been recorded for today’s evening vigil.');
    setPrayerRequestText('');
    setTimeout(() => setPrayerFeedback(null), 3000);
  };

  const toggleBookmark = (id: string) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleVoiceNote = (id: string) => {
    setActiveVoiceNoteId((prev) => (prev === id ? null : id));
  };

  const cycleSpeed = () => {
    if (playbackSpeed === '1.0x') setPlaybackSpeed('1.5x');
    else if (playbackSpeed === '1.5x') setPlaybackSpeed('2.0x');
    else setPlaybackSpeed('1.0x');
  };

  const handleShareStatusCard = () => {
    setShareFeedback('Verse card copied. Ready to share on WhatsApp Status.');
    setTimeout(() => setShareFeedback(null), 3000);
  };

  const currentPassage =
    DEVOTIONAL_PASSAGES.find((p) => p.id === selectedPassageId) ||
    DEVOTIONAL_PASSAGES[0];

  const isBookmarked = bookmarks.includes(currentPassage.id);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-slate-950/80 border-b border-slate-800 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Discreet 4-tap trigger on the Cross emblem */}
            <button
              type="button"
              title="Scripture Cross Emblem"
              data-testid="devotional-cross-emblem"
              onClick={handleCrossTap}
              className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 hover:bg-amber-500/20 active:scale-95 transition-all cursor-pointer focus:outline-none"
              aria-label="Scripture Cross Emblem"
            >
              <Cross className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif font-bold text-lg text-slate-100 tracking-tight">
                  Daily Verse SA
                </h1>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Offline KJV & IBhayibheli
                </span>
              </div>
              <p className="text-xs text-slate-400">
                IBhayibheli Elingcwele • Bibele • Holy Bible
              </p>
            </div>
          </div>

          {/* Bookmarks Counter & Discreet Study Reference */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowLookupModal(true)}
              className="p-2 rounded-lg bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700 hover:border-slate-600 transition text-xs flex items-center space-x-1"
              title="Study Reference Lookup"
              aria-label="Study Reference Lookup"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lookup</span>
            </button>
            <div
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 text-amber-300 text-xs font-medium border border-slate-700"
              title="Saved verses"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{bookmarks.length}</span>
            </div>
          </div>
        </div>

        {/* Language Tabs */}
        <div className="max-w-3xl mx-auto mt-3 flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 text-xs rounded-md transition font-medium ${
              lang === 'en'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang('zu')}
            className={`px-3 py-1 text-xs rounded-md transition font-medium ${
              lang === 'zu'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            isiZulu (IBhayibheli)
          </button>
          <button
            type="button"
            onClick={() => setLang('st')}
            className={`px-3 py-1 text-xs rounded-md transition font-medium ${
              lang === 'st'
                ? 'bg-amber-500 text-slate-950 font-semibold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Sesotho (Bibele)
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-5">
        {/* Search Bar (Discreet PIN input vector) */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scripture or enter study code..."
            aria-label="Scripture Search"
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-20 py-2.5 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-400 transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-2 px-3 py-1 bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold rounded-lg transition"
          >
            Search
          </button>
        </form>

        {lookupFeedback && (
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg text-xs text-amber-300 flex items-center justify-between">
            <span>{lookupFeedback}</span>
            <button
              onClick={() => setLookupFeedback(null)}
              className="text-slate-400 hover:text-slate-200"
            >
              ×
            </button>
          </div>
        )}

        {/* Shareable Scripture Image Card (WhatsApp Status Style) */}
        <section className="bg-gradient-to-br from-amber-950/40 via-slate-850 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-xs text-amber-400/90 font-medium">
            <span className="flex items-center space-x-1.5">
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Today&apos;s Daily Verse & Reflection</span>
            </span>
            <button
              type="button"
              onClick={() => toggleBookmark(currentPassage.id)}
              className="flex items-center space-x-1 text-slate-400 hover:text-amber-400 transition"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark verse'}
            >
              <Bookmark
                className={`w-4 h-4 ${
                  isBookmarked ? 'fill-amber-400 text-amber-400' : ''
                }`}
              />
              <span className="text-[11px]">
                {isBookmarked ? 'Saved' : 'Save'}
              </span>
            </button>
          </div>

          <div className="space-y-3">
            <div className="border-l-2 border-amber-500/60 pl-3">
              <h2 className="text-sm font-semibold text-amber-300">
                {currentPassage.reference[lang]}
              </h2>
              <p className="text-xs text-slate-400 font-serif italic">
                {currentPassage.title[lang]}
              </p>
            </div>

            <blockquote className="font-serif text-base sm:text-lg text-slate-100 leading-relaxed italic pt-1">
              &ldquo;{currentPassage.text[lang]}&rdquo;
            </blockquote>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-700/60">
              <span className="italic">{currentPassage.reflection[lang]}</span>
            </div>

            {/* Action Bar: Download Image Card / Share to WhatsApp */}
            <div className="pt-2 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={handleShareStatusCard}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-center gap-1.5 font-medium transition-colors"
                title="Share to WhatsApp Status"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Card</span>
              </button>
              <button
                type="button"
                onClick={handleShareStatusCard}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Download status image"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>

          {shareFeedback && (
            <div className="text-[11px] text-emerald-300 bg-emerald-950/80 border border-emerald-800 p-2 rounded-lg text-center font-mono animate-fadeIn">
              {shareFeedback}
            </div>
          )}
        </section>

        {/* Voice Note Sermons Section (Feature 3 Enhancement) */}
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>Voice Note Sermons (Izintshumayelo Zezwi)</span>
            </h3>
            <button
              type="button"
              onClick={cycleSpeed}
              className="text-[10px] font-mono font-bold bg-slate-800 px-2 py-0.5 rounded text-amber-300 border border-slate-700 hover:bg-slate-700 transition"
              title="Playback speed"
            >
              {playbackSpeed}
            </button>
          </div>

          <div className="space-y-2">
            {VOICE_NOTE_SERMONS.map((sermon) => {
              const isActive = activeVoiceNoteId === sermon.id;
              return (
                <div
                  key={sermon.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-amber-950/30 border-amber-500/50 shadow-md'
                      : 'bg-slate-850/80 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleVoiceNote(sermon.id)}
                      className={`p-3 rounded-full shrink-0 transition-transform active:scale-95 ${
                        isActive
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                      }`}
                      aria-label={isActive ? `Pause sermon ${sermon.title[lang]}` : `Play sermon ${sermon.title[lang]}`}
                    >
                      {isActive ? (
                        <Pause className="w-4 h-4 fill-slate-950" />
                      ) : (
                        <Play className="w-4 h-4 fill-amber-400 ml-0.5" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{sermon.speaker}</span>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {sermon.duration}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300/90 truncate font-medium">
                        {sermon.title[lang]}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        {sermon.ministry} • <span className="font-mono text-amber-400/80">{sermon.scriptureTag}</span>
                      </p>

                      {/* WhatsApp-Style Audio Waveform */}
                      <div className="mt-2 flex items-center gap-0.5 h-3">
                        {[12, 24, 38, 18, 50, 75, 40, 25, 60, 85, 55, 30, 20, 45, 65, 35, 20, 15, 30, 50].map(
                          (h, i) => (
                            <span
                              key={i}
                              className={`w-1 rounded-full transition-all duration-150 ${
                                isActive ? 'bg-amber-400 opacity-90' : 'bg-slate-700 opacity-40'
                              }`}
                              style={{
                                height: isActive ? `${Math.max(15, h * (i % 2 === 0 ? 1 : 0.8))}%` : '25%',
                              }}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Community Prayer Request Box (Covert Trigger Vector) */}
        <section className="bg-slate-850/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Community Prayer Requests & Intercession</span>
          </div>

          <form onSubmit={handlePrayerSubmit} className="space-y-2">
            <textarea
              rows={2}
              value={prayerRequestText}
              onChange={(e) => setPrayerRequestText(e.target.value)}
              placeholder="Submit an anonymous prayer request or scripture reflection..."
              aria-label="Community Prayer Request"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 transition resize-none"
            />
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 italic">
                Requests are reviewed privately by community chaplains.
              </span>
              <button
                type="submit"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition"
              >
                Submit Request
              </button>
            </div>
          </form>

          {prayerFeedback && (
            <div className="text-[11px] text-amber-300 bg-amber-950/60 border border-amber-800/60 p-2 rounded-lg font-mono text-center">
              {prayerFeedback}
            </div>
          )}
        </section>

        {/* Chapter Browser / Offline Library */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Psalms & Proverbs Library (Offline)
            </h3>
            <span className="text-[11px] text-slate-500">
              {DEVOTIONAL_PASSAGES.length} chapters loaded
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {DEVOTIONAL_PASSAGES.map((passage) => {
              const active = passage.id === currentPassage.id;
              return (
                <button
                  key={passage.id}
                  type="button"
                  onClick={() => setSelectedPassageId(passage.id)}
                  className={`text-left p-3.5 rounded-xl border transition-all ${
                    active
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                      : 'bg-slate-800/60 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300">
                      {passage.reference[lang]}
                    </span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300">
                      {passage.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 font-serif line-clamp-1 mt-1">
                    {passage.title[lang]}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                    {passage.text[lang]}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </main>

      {/* Secret PIN / Study Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <h3 className="font-semibold text-slate-100 text-sm">
                  Scripture Concordance Lookup
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLookupModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-3">
              Enter scripture index code or verse numerical reference.
            </p>

            <form onSubmit={handleLookupSubmit} className="space-y-3">
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={lookupCode}
                onChange={(e) => setLookupCode(e.target.value)}
                placeholder="Reference Code (e.g. 8426)"
                aria-label="Concordance Code"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center text-lg tracking-widest text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
              />

              <div className="grid grid-cols-3 gap-1.5 pt-1">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(
                  (key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        if (key === 'C') setLookupCode('');
                        else if (key === 'OK') {
                          evaluateSecretCode(lookupCode);
                        } else {
                          if (lookupCode.length < 6) {
                            const next = lookupCode + key;
                            setLookupCode(next);
                            if (next === '8426' || next === '9999') {
                              evaluateSecretCode(next);
                            }
                          }
                        }
                      }}
                      className="py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-medium border border-slate-700 active:scale-95 transition"
                    >
                      {key}
                    </button>
                  )
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLookupModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-semibold text-xs"
                >
                  Verify Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 py-3 text-center text-[11px] text-slate-500">
        <p>Sankofa Daily Devotions • South African Bible Society Edition</p>
      </footer>
    </div>
  );
};
