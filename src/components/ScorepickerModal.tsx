'use client';

import { useEffect, useRef, useState } from 'react';
import { Star, X } from 'lucide-react';

interface ScorePickerModalProps {
  open: boolean;
  currentScore: number | null;
  animeTitle?: string;
  onClose: () => void;
  onSave: (score: number | null) => void;
}

const SCORE_META: Record<number, { label: string; color: string; bg: string; border: string }> = {
  10: { label: 'Masterpiece', color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.4)' },
  9: { label: 'Great', color: '#6ee7b7', bg: 'rgba(110,231,183,0.1)', border: 'rgba(110,231,183,0.35)' },
  8: { label: 'Very Good', color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.35)' },
  7: { label: 'Good', color: '#93c5fd', bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.3)' },
  6: { label: 'Fine', color: '#a5b4fc', bg: 'rgba(165,180,252,0.1)', border: 'rgba(165,180,252,0.3)' },
  5: { label: 'Average', color: '#fcd34d', bg: 'rgba(252,211,77,0.1)', border: 'rgba(252,211,77,0.3)' },
  4: { label: 'Bad', color: '#fbbf24', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)' },
  3: { label: 'Very Bad', color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.3)' },
  2: { label: 'Horrible', color: '#f87171', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.3)' },
  1: { label: 'Appalling', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.4)' },
};

function StarRow({ filled, color }: { filled: number; color: string }) {
  return (
    <div className="flex gap-1 justify-center">
      {Array.from({ length: 10 }).map((_, i) => (
        <Star
          key={i}
          className="w-3.5 h-3.5 transition-all duration-200"
          style={{
            fill: i < filled ? color : 'transparent',
            color: i < filled ? color : 'rgba(99,102,241,0.2)',
            filter: i < filled ? `drop-shadow(0 0 3px ${color}80)` : 'none',
          }}
        />
      ))}
    </div>
  );
}

export function ScorePickerModal({
  open,
  currentScore,
  animeTitle,
  onClose,
  onSave,
}: ScorePickerModalProps) {
  const [selected, setSelected] = useState<number | null>(currentScore);
  const [hovered, setHovered] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setSelected(currentScore);
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    } else {
      setMounted(false);
    }
  }, [open, currentScore]);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const display = hovered ?? selected;
  const cfg = display ? SCORE_META[display] : null;

  const handleSave = () => {
    onSave(selected);
    onClose();
  };

  const handleClear = () => {
    onSave(null);
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{
        backgroundColor: `rgba(0,0,0,${mounted ? '0.7' : '0'})`,
        backdropFilter: 'blur(6px)',
        transition: 'background-color 0.2s ease',
      }}
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(160deg,#0d1526 0%,#080e1a 100%)',
          border: `1px solid ${cfg ? cfg.border : 'rgba(99,102,241,0.2)'}`,
          boxShadow: cfg
            ? `0 24px 60px rgba(0,0,0,0.65), 0 0 40px ${cfg.color}18`
            : '0 24px 60px rgba(0,0,0,0.65)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
          opacity: mounted ? 1 : 0,
          transition:
            'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease, border-color 0.3s ease, box-shadow 0.3s ease',
        }}
      >
        {/* Ambient radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: cfg
              ? `radial-gradient(ellipse at 50% 0%, ${cfg.color}18 0%, transparent 65%)`
              : 'radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.1) 0%, transparent 60%)',
            transition: 'background 0.3s ease',
          }}
        />

        {/* ── Header ── */}
        <div
          className="relative px-5 pt-5 pb-4"
          style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}
        >
          <div className="flex items-center gap-1.5 mb-0.5">
            <Star
              className="w-3.5 h-3.5"
              style={{ color: cfg?.color ?? '#6366f1', fill: cfg?.color ?? '#6366f1' }}
            />
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: cfg?.color ?? '#6366f1', transition: 'color 0.3s' }}
            >
              Rate this anime
            </span>
          </div>
          {animeTitle && (
            <p className="text-white font-semibold text-sm leading-snug line-clamp-1">
              {animeTitle}
            </p>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-white transition-colors"
            style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ── Score display ── */}
        <div className="px-5 pt-5 pb-3 text-center">
          {/* Big number */}
          <div
            className="font-black leading-none mb-1.5 transition-all duration-200"
            style={{
              fontSize: '72px',
              color: cfg?.color ?? 'rgba(99,102,241,0.15)',
              textShadow: cfg ? `0 0 50px ${cfg.color}50` : 'none',
              fontVariantNumeric: 'tabular-nums',
              transition: 'color 0.25s ease, text-shadow 0.25s ease',
            }}
          >
            {display ?? '—'}
          </div>

          {/* Label */}
          <div
            className="text-sm font-semibold h-5 mb-3 transition-all duration-200"
            style={{ color: cfg?.color ?? '#1e293b', transition: 'color 0.25s ease' }}
          >
            {cfg?.label ?? 'Select a score'}
          </div>

          {/* Stars */}
          <StarRow filled={display ?? 0} color={cfg?.color ?? '#6366f1'} />
        </div>

        {/* ── Grid ── */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-5 gap-1.5">
            {([10, 9, 8, 7, 6, 5, 4, 3, 2, 1] as const).map((v) => {
              const c = SCORE_META[v];
              const isSelected = selected === v;
              const isHov = hovered === v;
              const active = isSelected || isHov;
              return (
                <button
                  key={v}
                  type="button"
                  onMouseEnter={() => setHovered(v)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={() => setSelected(isSelected ? null : v)}
                  className="relative flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-150"
                  style={{
                    background: isSelected ? c.bg : isHov ? c.bg.replace(/[\d.]+\)$/, '0.06)') : 'rgba(15,23,42,0.6)',
                    border: `1px solid ${active ? c.border : 'rgba(99,102,241,0.1)'}`,
                    transform: isSelected ? 'scale(1.08)' : isHov ? 'scale(1.04)' : 'scale(1)',
                    boxShadow: isSelected ? `0 4px 18px ${c.color}30` : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    className="text-base font-bold leading-none"
                    style={{ color: active ? c.color : '#475569' }}
                  >
                    {v}
                  </span>
                  <span
                    className="leading-tight text-center mt-0.5"
                    style={{ fontSize: '9px', fontWeight: 500, color: active ? c.color : '#334155' }}
                  >
                    {c.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div
          className="px-4 pb-4 pt-3 flex gap-2"
          style={{ borderTop: '1px solid rgba(99,102,241,0.08)' }}
        >
          {currentScore !== null && (
            <button
              onClick={handleClear}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#f87171',
              }}
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-colors"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={selected === currentScore}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: selected
                ? `linear-gradient(135deg, ${SCORE_META[selected].color}cc, ${SCORE_META[selected].color}88)`
                : 'rgba(99,102,241,0.25)',
              border: `1px solid ${selected ? SCORE_META[selected].border : 'rgba(99,102,241,0.2)'}`,
              boxShadow: selected ? `0 4px 16px ${SCORE_META[selected].color}35` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            Save Score
          </button>
        </div>
      </div>
    </div>
  );
}