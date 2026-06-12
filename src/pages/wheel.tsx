import * as React from "react";
import { useState, useRef, useEffect, useMemo } from "react";
import { DEFAULT_THEMES, BASIC_THEMES } from "@/data/wheels";
import { SpinWheel } from "@/components/wheel/SpinWheel";
import { ResultBanner } from "@/components/wheel/ResultBanner";
import { HistoryStrip } from "@/components/wheel/HistoryStrip";
import { SoundToggle } from "@/components/wheel/SoundToggle";
import { Confetti } from "@/components/wheel/Confetti";
import { soundManager } from "@/lib/sound";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic2, Plus, X, RotateCcw } from "lucide-react";

const STORAGE_KEY = "karaoke-wheel-themes-v1";
const HISTORY_STORAGE_KEY = "karaoke-wheel-history-v1";
const MUTED_STORAGE_KEY = "karaoke-wheel-muted-v1";
const MAX_THEME_LENGTH = 18;

function loadStoredThemes(): string[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (
        Array.isArray(parsed) &&
        parsed.every((t) => typeof t === "string") &&
        parsed.length > 0
      ) {
        return parsed;
      }
    }
  } catch {
    /* ignore */
  }
  return DEFAULT_THEMES;
}

function loadStoredHistory(validThemes: string[]): string[] {
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.every((t) => typeof t === "string")) {
        // Drop any entries that are no longer in the master theme list so we
        // don't try to "use up" themes that have since been deleted.
        const valid = new Set(validThemes);
        return parsed.filter((t) => valid.has(t));
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function loadStoredMuted(): boolean {
  try {
    const stored = localStorage.getItem(MUTED_STORAGE_KEY);
    if (stored !== null) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === "boolean") return parsed;
    }
  } catch {
    /* ignore */
  }
  return true;
}

export default function WheelPage() {
  const [allThemes, setAllThemes] = useState<string[]>(() => loadStoredThemes());
  const [newTheme, setNewTheme] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() =>
    loadStoredHistory(loadStoredThemes()),
  );
  const [isMuted, setIsMuted] = useState<boolean>(() => loadStoredMuted());
  const [showConfetti, setShowConfetti] = useState(false);
  const [showManage, setShowManage] = useState(true);

  const lastRotationRef = useRef(0);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const spinningRef = useRef(false);

  // Persist master theme list
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allThemes));
    } catch {
      /* ignore */
    }
  }, [allThemes]);

  // Persist the Selected list across refreshes so a karaoke party survives
  // an accidental reload or browser restart.
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      /* ignore */
    }
  }, [history]);

  // Persist the mute toggle.
  useEffect(() => {
    try {
      localStorage.setItem(MUTED_STORAGE_KEY, JSON.stringify(isMuted));
    } catch {
      /* ignore */
    }
  }, [isMuted]);

  // The wheel always shows every theme; used ones are dimmed in place.
  const items = allThemes;
  const usedSet = useMemo(() => new Set(history), [history]);
  const remainingCount = items.length - usedSet.size;
  const allUsed = items.length > 0 && remainingCount === 0;
  const canSpin = remainingCount >= 1 && !spinning;

  const handleSpin = () => {
    if (spinningRef.current) return;
    if (remainingCount < 1) return;

    spinningRef.current = true;
    setSpinning(true);
    setResult(null);
    setShowConfetti(false);

    const segmentAngle = 360 / items.length;

    // Pick from indices that aren't already in the Selected list so the wheel
    // never lands on the same theme twice in a row (or any theme already used).
    const availableIndices = items
      .map((item, idx) => ({ item, idx }))
      .filter(({ item }) => !usedSet.has(item))
      .map(({ idx }) => idx);

    const targetSegment =
      availableIndices[Math.floor(Math.random() * availableIndices.length)];

    const extraSpins = 6 + Math.floor(Math.random() * 5);
    const targetAngleOffset = 360 - targetSegment * segmentAngle;
    const currentBase = lastRotationRef.current - (lastRotationRef.current % 360);
    const newRotation = currentBase + extraSpins * 360 + targetAngleOffset;
    const randomJitter = (Math.random() - 0.5) * (segmentAngle * 0.6);
    const finalRotation = newRotation + randomJitter;

    setRotation(finalRotation);
    lastRotationRef.current = finalRotation;

    if (!isMuted) {
      let tickRate = 50;
      let ticks = 0;
      const doTick = () => {
        soundManager.playTick();
        ticks++;
        tickRate = Math.min(400, tickRate + ticks * 2);

        if (spinningRef.current) {
          tickIntervalRef.current = setTimeout(doTick, tickRate);
        }
      };
      doTick();
    }

    setTimeout(() => {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
      spinningRef.current = false;
      setSpinning(false);
      const wonItem = items[targetSegment];
      setResult(wonItem);
      setShowConfetti(true);
      soundManager.playWin();
      setHistory((prev) => [wonItem, ...prev]);
    }, 5000);
  };

  const handleAddTheme = () => {
    const trimmed = newTheme.trim();
    if (!trimmed) return;
    if (trimmed.length > MAX_THEME_LENGTH) return;
    if (allThemes.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setNewTheme("");
      return;
    }
    setAllThemes((prev) => [...prev, trimmed]);
    setNewTheme("");
  };

  const handleDeleteTheme = (theme: string) => {
    setAllThemes((prev) => prev.filter((t) => t !== theme));
    setHistory((prev) => prev.filter((t) => t !== theme));
  };

  const handleRemoveFromSelected = (index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  };

  const handleResetWheel = () => {
    setHistory([]);
    setResult(null);
    setShowConfetti(false);
  };

  const handleResetThemes = () => {
    setAllThemes(DEFAULT_THEMES);
    setHistory([]);
    setResult(null);
    setShowConfetti(false);
  };

  const handleLoadBasicWheel = () => {
    setAllThemes(BASIC_THEMES);
    setHistory([]);
    setResult(null);
    setShowConfetti(false);
  };

  useEffect(() => {
    return () => {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
    };
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col relative overflow-x-hidden">
      <Confetti active={showConfetti} />

      {/* Header */}
      <header className="w-full p-4 md:p-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 text-primary font-black text-xl tracking-tight">
          <Mic2 className="w-6 h-6" />
          <span>MIC DROP WHEEL</span>
        </div>
        <SoundToggle isMuted={isMuted} onToggle={setIsMuted} />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pb-12 w-full max-w-4xl mx-auto z-10 pt-2">
        {/* Add theme input */}
        <div className="w-full max-w-sm mb-6 flex gap-2">
          <Input
            value={newTheme}
            onChange={(e) => setNewTheme(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTheme();
            }}
            placeholder="Add your own theme..."
            maxLength={MAX_THEME_LENGTH}
            className="bg-secondary/30 border-secondary/60 placeholder:text-muted-foreground/70 h-11 rounded-full px-4"
          />
          <Button
            onClick={handleAddTheme}
            disabled={!newTheme.trim()}
            className="h-11 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
            aria-label="Add theme"
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>

        {items.length >= 1 ? (
          <SpinWheel
            items={items}
            usedItems={usedSet}
            spinning={spinning}
            rotation={rotation}
            onSpin={handleSpin}
          />
        ) : (
          <div className="w-[320px] h-[320px] md:w-[500px] md:h-[500px] rounded-full border-4 border-dashed border-secondary/60 flex flex-col items-center justify-center text-center px-8">
            <p className="text-lg font-bold text-foreground mb-2">No themes yet!</p>
            <p className="text-sm text-muted-foreground">
              Add a theme above or restore the defaults.
            </p>
          </div>
        )}

        <div
          className="mt-6 mb-1 text-xs font-bold uppercase tracking-widest text-muted-foreground"
          aria-live="polite"
        >
          {items.length === 0
            ? "Add a theme to get started"
            : allUsed
            ? "All themes used — reset to play again"
            : `${remainingCount} of ${items.length} themes left`}
        </div>

        <div className="mt-3 mb-2 flex flex-col items-center gap-3">
          {allUsed ? (
            <Button
              size="lg"
              onClick={handleResetWheel}
              className="h-16 px-12 text-2xl font-black rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.5)] hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-105 transition-all duration-300 border-none"
            >
              <RotateCcw className="w-6 h-6 mr-2" /> RESET
            </Button>
          ) : (
            <Button
              size="lg"
              disabled={!canSpin}
              onClick={handleSpin}
              className="h-16 px-12 text-2xl font-black rounded-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-[0_0_20px_rgba(var(--primary),0.5)] hover:shadow-[0_0_30px_rgba(var(--primary),0.8)] hover:scale-105 transition-all duration-300 border-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {spinning ? "SPINNING..." : "SPIN IT!"}
            </Button>
          )}

          {history.length > 0 && !allUsed && (
            <button
              type="button"
              onClick={handleResetWheel}
              disabled={spinning}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 disabled:opacity-50"
              aria-label="Reset used themes"
            >
              <RotateCcw className="w-3 h-3" /> Reset wheel
            </button>
          )}
        </div>

        <ResultBanner result={result} />

        <HistoryStrip history={history} onRemove={handleRemoveFromSelected} />

        {/* Manage themes */}
        <div className="w-full max-w-md mt-12 border-t border-secondary/40 pt-6">
          <button
            type="button"
            onClick={() => setShowManage((s) => !s)}
            className="w-full text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors text-center"
          >
            {showManage ? "Hide" : "Show"} your themes ({allThemes.length}) — tap × to remove
          </button>

          {showManage && (
            <div className="mt-4 flex flex-col items-center gap-3">
              <div className="flex flex-wrap justify-center gap-2">
                {allThemes.map((theme) => (
                  <span
                    key={theme}
                    className="inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-secondary/40 border border-secondary/60 text-secondary-foreground text-sm font-medium"
                  >
                    <span>{theme}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTheme(theme)}
                      aria-label={`Delete theme ${theme}`}
                      className="ml-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-background/40 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-2">
                <button
                  type="button"
                  onClick={handleResetThemes}
                  className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restore default themes
                </button>
                <button
                  type="button"
                  onClick={handleLoadBasicWheel}
                  className="text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Load basic wheel
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Ambient background decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent blur-[120px]" />
      </div>
    </div>
  );
}
