import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-4xl',
};

export default function Modal({ open, onClose, title, size = 'md', children }: Props) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => {
        if (contentRef.current) contentRef.current.scrollTop = 0;
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const isFull = size === 'full';
  const isWide = size === 'xl';

  const modalNode = (
    <div className={`fixed inset-0 z-[100] flex ${isFull ? 'items-stretch justify-stretch' : 'items-end sm:items-center justify-center'}`} onClick={!isFull ? onClose : undefined}>
      <div className={`fixed inset-0 ${isFull ? 'bg-slate-50' : 'bg-black/40 a-fade'}`} />
      <div
        className={`relative bg-white w-full ${widths[size]} ${isFull ? 'h-dvh rounded-none' : isWide ? 'sm:rounded-2xl rounded-t-2xl h-[95dvh] sm:h-auto sm:max-h-[90dvh]' : 'sm:rounded-2xl rounded-t-2xl max-h-[90dvh]'} flex flex-col a-fade-up z-10`}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div className={`sticky top-0 bg-white ${!isFull ? 'sm:rounded-t-2xl rounded-t-2xl' : ''} border-b border-slate-100 px-4 py-3.5 flex items-center justify-between z-10 shrink-0`}>
            {isFull ? (
              <>
                <button onClick={onClose} className="p-1.5 -ml-1 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0 flex items-center gap-1">
                  <ChevronLeft className="w-5 h-5" />
                  <span className="text-sm font-medium hidden sm:inline">Back</span>
                </button>
                <h3 className="text-base font-semibold text-slate-800 truncate px-3 flex-1 text-center">{title}</h3>
                <div className="w-9 shrink-0" />
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-slate-800 truncate pr-4">{title}</h3>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        )}
        <div ref={contentRef} className={`overflow-y-auto overscroll-contain ${isFull ? 'p-4 sm:p-5 flex-1' : 'p-5 flex-1'}`}>
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalNode, document.body);
}
