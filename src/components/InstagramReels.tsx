import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

export default function InstagramReels() {
  const [cfg, setCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setCfg), []);

  const reels = cfg.instagramReels?.filter(Boolean) || [];
  const [playing, setPlaying] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  if (reels.length === 0) return null;

  const scroll = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 260, behavior: 'smooth' });
  };

  // Extract embed ID from Instagram URL
  const getEmbedUrl = (url: string) => {
    const match = url.match(/instagram\.com\/reel\/([^/?]+)/);
    return match ? `https://www.instagram.com/reel/${match[1]}/embed` : url;
  };

  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
      <div className="h-px bg-gradient-to-r from-transparent via-sand-300 to-transparent mb-10" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[.2em] text-ink-400 mb-1">Follow Us</p>
          <h2 className="font-serif text-xl text-ink-900">Reels</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => scroll(-1)} className="h-8 w-8 rounded-full border border-sand-200 bg-white flex items-center justify-center text-ink-500 hover:text-ink-800 active:scale-90">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => scroll(1)} className="h-8 w-8 rounded-full border border-sand-200 bg-white flex items-center justify-center text-ink-500 hover:text-ink-800 active:scale-90">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-2 px-2 snap-x snap-mandatory">
        {reels.map((url, i) => (
          <div key={i} className="flex-shrink-0 w-[240px] snap-start">
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-sand-200 border border-sand-200">
              {playing === i ? (
                <iframe
                  src={getEmbedUrl(url)}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-ink-900/10">
                  <div className="text-center">
                    <div className="text-[10px] text-ink-500 font-mono mb-2">Reel {i + 1}</div>
                  </div>
                </div>
              )}
              <button
                onClick={() => setPlaying(playing === i ? null : i)}
                className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm active:scale-90 z-10"
              >
                {playing === i ? <Pause className="h-4 w-4 text-ink-700" /> : <Play className="h-4 w-4 text-ink-700 ml-0.5" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
