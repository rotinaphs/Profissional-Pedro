import React, { useEffect, useCallback, useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { Photo } from '../types';

interface LightboxProps {
  photo: Photo;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose, onNext, onPrev, hasNext, hasPrev }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // Refs for gesture calculations
  const dragStart = useRef({ x: 0, y: 0 });
  const startPosition = useRef({ x: 0, y: 0 });
  const initialDistance = useRef<number | null>(null);
  const initialScale = useRef<number>(1);
  const lastTapTime = useRef<number>(0);

  // Reset state when photo changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsDragging(false);
  }, [photo.id]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Only navigate with keys if not zoomed in
    if (scale === 1) {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    } else {
      if (e.key === 'Escape') {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      }
    }
  }, [onClose, onNext, onPrev, hasNext, hasPrev, scale]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; 
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  // --- Zoom Helpers ---
  const handleZoomIn = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setScale(prev => {
      const newScale = Math.max(prev - 0.5, 1);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
      return newScale;
    });
  };

  // --- Mouse / Pointer Handlers ---

  const onWheel = (e: React.WheelEvent) => {
    // Prevent default to stop page scrolling if any
    // e.stopPropagation();
    const delta = -e.deltaY * 0.002;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  const onPointerDown = (e: React.PointerEvent) => {
    // Handle double tap/click
    const now = Date.now();
    if (now - lastTapTime.current < 300) {
      if (scale > 1) {
        setScale(1);
        setPosition({ x: 0, y: 0 });
      } else {
        setScale(2.5);
      }
    }
    lastTapTime.current = now;

    if (scale > 1) {
      e.preventDefault();
      setIsDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      startPosition.current = { ...position };
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (isDragging && scale > 1) {
      e.preventDefault();
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setPosition({
        x: startPosition.current.x + dx,
        y: startPosition.current.y + dy,
      });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
        (e.target as Element).releasePointerCapture(e.pointerId);
    } catch(e) {
        // Ignore errors if pointer capture was lost
    }
  };

  // --- Touch Handlers (for Pinch) ---
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      initialDistance.current = dist;
      initialScale.current = scale;
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && initialDistance.current) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const ratio = dist / initialDistance.current;
      const newScale = Math.min(Math.max(1, initialScale.current * ratio), 4);
      setScale(newScale);
      if (newScale === 1) setPosition({ x: 0, y: 0 });
    }
  };

  const cursorStyle = scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-default';

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in backdrop-blur-sm touch-none"
      onClick={onClose}
      onWheel={onWheel}
    >
      {/* Controls */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <button 
           onClick={(e) => { e.stopPropagation(); handleZoomOut(e); }}
           className="text-white/70 hover:text-white transition-colors p-2 disabled:opacity-30"
           disabled={scale <= 1}
           aria-label="Zoom Out"
        >
          <ZoomOut size={24} />
        </button>
        <button 
           onClick={(e) => { e.stopPropagation(); handleZoomIn(e); }}
           className="text-white/70 hover:text-white transition-colors p-2 disabled:opacity-30"
           disabled={scale >= 4}
           aria-label="Zoom In"
        >
          <ZoomIn size={24} />
        </button>
        <button 
          onClick={onClose} 
          className="text-white/70 hover:text-white transition-colors p-2"
          aria-label="Close"
        >
          <X size={32} />
        </button>
      </div>

      {/* Navigation Buttons */}
      {hasPrev && scale === 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-50 hidden md:block"
        >
          <ChevronLeft size={48} />
        </button>
      )}

      {hasNext && scale === 1 && (
        <button 
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-4 transition-colors z-50 hidden md:block"
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Image Container */}
      <div 
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
      >
        <img 
          src={photo.src} 
          alt={photo.alt} 
          draggable={false}
          className={`max-h-[85vh] max-w-full object-contain shadow-2xl ${cursorStyle}`}
          style={{ 
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.1s ease-out'
          }}
          onClick={(e) => e.stopPropagation()} 
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
        />
      </div>

      {/* Caption */}
      {photo.caption && scale === 1 && (
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none px-6">
          <p 
            className="text-stone-300 font-serif italic tracking-wide inline-block bg-black/50 px-6 py-3 rounded-full"
            style={{ fontSize: 'var(--font-size-caption)' }}
          >
            {photo.caption}
          </p>
        </div>
      )}
    </div>
  );
};

export default Lightbox;