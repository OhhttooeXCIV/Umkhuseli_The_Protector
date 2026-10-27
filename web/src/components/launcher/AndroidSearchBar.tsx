import React, { useState } from "react";
import { Mic, Camera, Search, Sparkles } from "lucide-react";

interface AndroidSearchBarProps {
  onUnlockSafeHaven: () => void;
  onDuressTrigger: () => void;
}

export const AndroidSearchBar: React.FC<AndroidSearchBarProps> = ({
  onUnlockSafeHaven,
  onDuressTrigger,
}) => {
  const [query, setQuery] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = query.trim();

    if (clean === "8426") {
      setQuery("");
      onUnlockSafeHaven();
      return;
    }

    if (clean === "9999") {
      setQuery("");
      onDuressTrigger();
      setFeedbackMsg("SafeSearch filter applied • Query indexed.");
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    if (clean.length > 0) {
      // Innocent web search behavior
      window.open(`https://www.google.com/search?q=${encodeURIComponent(clean)}`, "_blank", "noopener,noreferrer");
      setQuery("");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    // Immediate check if user typed exactly 8426
    if (val.trim() === "8426") {
      setQuery("");
      onUnlockSafeHaven();
    } else if (val.trim() === "9999") {
      setQuery("");
      onDuressTrigger();
      setFeedbackMsg("SafeSearch filter active.");
      setTimeout(() => setFeedbackMsg(null), 3000);
    }
  };

  return (
    <div className="w-full px-4 my-2">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-full shadow-lg border border-white/20 dark:border-slate-800 px-4 py-2.5 transition-all focus-within:ring-2 focus-within:ring-sky-500/50"
      >
        {/* Google Multi-Color G or Clean Icon */}
        <div className="flex items-center gap-1.5 mr-2.5 text-slate-400 select-none">
          <Search className="w-5 h-5 text-sky-500" />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search Google or type URL..."
          className="flex-1 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none"
          aria-label="Google search bar. Enter search query, or emergency code."
        />

        {/* Action Icons */}
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 ml-2">
          <button
            type="button"
            onClick={() => {
              setFeedbackMsg("Listening for voice search...");
              setTimeout(() => setFeedbackMsg(null), 2500);
            }}
            className="p-1 hover:text-sky-500 active:scale-95 transition-transform"
            aria-label="Voice search"
          >
            <Mic className="w-4 h-4 text-rose-500" />
          </button>
          <button
            type="button"
            onClick={() => {
              setFeedbackMsg("Google Lens: Point camera at search object");
              setTimeout(() => setFeedbackMsg(null), 2500);
            }}
            className="p-1 hover:text-sky-500 active:scale-95 transition-transform"
            aria-label="Google Lens camera search"
          >
            <Camera className="w-4 h-4 text-emerald-500" />
          </button>
        </div>
      </form>

      {/* Simulated Search Feedback */}
      {feedbackMsg && (
        <div className="mt-2 text-center text-xs text-slate-300 bg-slate-900/80 backdrop-blur py-1 px-3 rounded-full border border-slate-700 mx-auto w-fit animate-fade-in flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>{feedbackMsg}</span>
        </div>
      )}
    </div>
  );
};
