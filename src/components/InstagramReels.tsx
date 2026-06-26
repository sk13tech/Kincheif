import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

function parseVideo(url: string): { type: 'youtube' | 'instagram' | 'other'; id: string } {
  // YouTube Shorts: youtube.com/shorts/ID?si=...
  const yts = url.match(/youtube\.com\/shorts\/([^/?&\s]+)/);
  if (yts) return { type: 'youtube', id: yts[1] };
  // youtu.be/ID
  const ytb = url.match(/youtu\.be\/([^/?&\s]+)/);
  if (ytb) return { type: 'youtube', id: ytb[1] };
  // youtube.com/watch?v=ID
  const ytw = url.match(/youtube\.com\/watch\?v=([^/?&\s]+)/);
  if (ytw) return { type: 'youtube', id: ytw[1] };
  // youtube.com/embed/ID
  const yte = url.match(/youtube\.com\/embed\/([^/?&\s]+)/);
  if (yte) return { type: 'youtube', id: yte[1] };
  // Instagram
  if (url.includes('instagram.com')) return { type: 'instagram', id: url };
  return { type: 'other', id: url };
}

export default function InstagramReels() {
  const [cfg, setCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setCfg), []);

  const reels = (cfg.instagramReels?.filter(Boolean) || []).slice(0, 4);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (reels.length === 0) return null;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="h-px bg-gradient-to-r from-transparent via-sand-300 to-transparent mb-10" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[.2em] text-ink-400 mb-1">Watch</p>
          <h2 className="font-serif text-xl text-ink-900">Reels</h2>
        </div>
        {reels.length > 2 && (
          <div className="flex gap-2">
            <button onClick={() => scroll(-1)} className="h-8 w-8 rounded-full border border-sand-200 bg-white flex items-center justify-center text-ink-500 hover:text-ink-800 active:scale-90"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => scroll(1)} className="h-8 w-8 rounded-full border border-sand-200 bg-white flex items-center justify-center text-ink-500 hover:text-ink-800 active:scale-90"><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-2 px-2 snap-x snap-mandatory">
        {reels.map((url, i) => {
          const v = parseVideo(url);

          // YouTube — embed directly, plays on site
          if (v.type === 'youtube') {
            return (
              <div key={i} className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start">
                <div className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-sand-200 bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${v.id}?playsinline=1&rel=0&modestbranding=1`}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
            );
          }

          // Instagram / Other — show card that opens in new tab
          return (
            <div key={i} className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start">
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="block relative aspect-[9/16] rounded-2xl overflow-hidden border border-sand-200 bg-gradient-to-b from-sand-100 to-sand-200 hover:shadow-md transition-shadow">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-ink-400 mb-2" />
                  <p className="text-[11px] font-semibold text-ink-600">
                    {v.type === 'instagram' ? 'View on Instagram' : 'Open Video'}
                  </p>
                  <p className="text-[9px] text-ink-400 mt-1 px-4 text-center truncate max-w-full">{url.replace(/https?:\/\//, '').slice(0, 30)}...</p>
                </div>
              </a>
            </div>
          );
        })}
      </div>
    </section>
  );
}
