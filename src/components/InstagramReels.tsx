import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, ExternalLink } from 'lucide-react';
import { subscribeSiteConfig, type SiteConfig } from '../lib/firebase';

function getVideoEmbed(url: string): { type: 'youtube' | 'link'; embedUrl: string } {
  // YouTube Shorts: youtube.com/shorts/ID or youtu.be/ID
  const ytShort = url.match(/youtube\.com\/shorts\/([^/?&]+)/) || url.match(/youtu\.be\/([^/?&]+)/);
  if (ytShort) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytShort[1]}?autoplay=1&loop=1&mute=1&playsinline=1` };
  // Regular YouTube
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/)([^/?&]+)/);
  if (yt) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&loop=1&mute=1&playsinline=1` };
  // Anything else — open as link
  return { type: 'link', embedUrl: url };
}

export default function InstagramReels() {
  const [cfg, setCfg] = useState<SiteConfig>({});
  useEffect(() => subscribeSiteConfig(setCfg), []);

  const reels = (cfg.instagramReels?.filter(Boolean) || []).slice(0, 4);
  const [playing, setPlaying] = useState<number | null>(null);
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
          const video = getVideoEmbed(url);
          return (
            <div key={i} className="flex-shrink-0 w-[220px] sm:w-[240px] snap-start">
              <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-ink-900/5 border border-sand-200">
                {playing === i && video.type === 'youtube' ? (
                  <iframe
                    src={video.embedUrl}
                    className="absolute inset-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media; picture-in-picture"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-md mb-3">
                      <Play className="h-6 w-6 text-ink-700 ml-0.5" />
                    </div>
                    <p className="text-[10px] text-ink-400 font-mono">Video {i + 1}</p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (video.type === 'link') { window.open(url, '_blank'); return; }
                    setPlaying(playing === i ? null : i);
                  }}
                  className="absolute inset-0 z-10"
                />
                {playing === i && (
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="absolute top-3 right-3 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm z-20 active:scale-90">
                    <ExternalLink className="h-3.5 w-3.5 text-ink-600" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
