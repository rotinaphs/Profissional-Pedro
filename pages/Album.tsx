
import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { useData, processImage } from '../context/DataContext';
import Lightbox from '../components/Lightbox';
import FadeIn from '../components/FadeIn';

const Album: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { albums } = useData();
  const album = albums.find((a) => a.id === id);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!album) {
    return <Navigate to="/portfolio" replace />;
  }

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);
  
  const nextPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex < album.photos.length - 1) {
      setLightboxIndex(lightboxIndex + 1);
    } else {
      setLightboxIndex(0); // Loop
    }
  };

  const prevPhoto = () => {
    if (lightboxIndex !== null && lightboxIndex > 0) {
      setLightboxIndex(lightboxIndex - 1);
    } else {
      setLightboxIndex(album.photos.length - 1); // Loop
    }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div 
        className="border-b border-stone-100 py-16 md:py-24 px-4"
        style={{ backgroundColor: 'var(--color-surface)' }}
      >
        <div className="max-w-6xl mx-auto text-center">
          <FadeIn>
            <Link 
              to="/portfolio" 
              className="inline-flex items-center mb-8 transition-opacity hover:opacity-70 uppercase text-[10px] font-bold tracking-[0.2em]"
              style={{ 
                color: 'var(--elem-subtitle-color)',
                fontFamily: 'var(--elem-subtitle-font)'
              }}
            >
              <ArrowLeft size={14} className="mr-2" /> Portfólio
            </Link>
          </FadeIn>
          <FadeIn delay={100}>
            <h1 
              className="mb-8 tracking-tight"
              style={{ 
                fontSize: 'var(--font-size-title)',
                fontFamily: 'var(--elem-title-font)',
                color: 'var(--elem-title-color)'
              }}
            >
              {album.title}
            </h1>
          </FadeIn>
          <FadeIn delay={200}>
            <p 
              className="max-w-3xl mx-auto leading-relaxed"
              style={{ 
                fontSize: 'var(--font-size-base)',
                fontFamily: 'var(--elem-subtitle-font)',
                color: 'var(--elem-subtitle-color)'
              }}
            >
              {album.description}
            </p>
          </FadeIn>
          {album.videoUrl && (
            <FadeIn delay={300}>
              <div className="mt-12 max-w-4xl mx-auto rounded-xl overflow-hidden shadow-lg bg-black">
                {album.videoUrl.includes('youtube.com') || album.videoUrl.includes('youtu.be') ? (
                  <iframe 
                    className="w-full aspect-video" 
                    src={`https://www.youtube.com/embed/${
                      album.videoUrl.includes('youtu.be') 
                        ? album.videoUrl.split('youtu.be/')[1]?.split('?')[0] 
                        : album.videoUrl.includes('youtube.com/watch') 
                          ? new URLSearchParams(album.videoUrl.split('?')[1]).get('v') 
                          : album.videoUrl.split('embed/')[1]?.split('?')[0]
                    }`} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : album.videoUrl.includes('vimeo.com') ? (
                  <iframe 
                    className="w-full aspect-video" 
                    src={`https://player.vimeo.com/video/${album.videoUrl.split('vimeo.com/')[1]?.split('?')[0]}`} 
                    frameBorder="0" 
                    allow="autoplay; fullscreen; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <video 
                    src={album.videoUrl} 
                    controls 
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-auto max-h-[70vh] object-contain"
                  />
                )}
                <div className="bg-stone-900/50 backdrop-blur-sm p-3 flex justify-end">
                  <a 
                    href={`#/viewer?url=${encodeURIComponent(album.videoUrl)}&type=video`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[10px] font-bold text-stone-300 hover:text-white flex items-center gap-2 uppercase tracking-widest transition-colors"
                  >
                    <ExternalLink size={14} /> Abrir em nova aba
                  </a>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
          {album.photos.map((photo, index) => {
            const { src, style } = processImage(photo.src);
            return (
                <FadeIn key={photo.id} delay={index * 50} className="break-inside-avoid">
                <div 
                    className="cursor-zoom-in group relative mb-8"
                    onClick={() => openLightbox(index)}
                >
                    <img 
                    src={src} 
                    alt={photo.alt} 
                    className="w-full h-auto shadow-sm hover:shadow-md transition-shadow duration-300"
                    loading="lazy"
                    style={style}
                    />
                    {photo.videoUrl && (
                      <div className="absolute top-4 right-4 bg-stone-100 p-2 border border-stone-900 text-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition-transform hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(28,25,23,1)]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 3L19 12L5 21V3Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="miter" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                    <span 
                        className="uppercase tracking-[0.2em]"
                        style={{ 
                        fontSize: 'var(--font-size-subtitle)',
                        fontFamily: 'var(--elem-caption-font)',
                        color: 'var(--elem-caption-color)'
                        }}
                    >
                        {photo.caption}
                    </span>
                    </div>
                </div>
                </FadeIn>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox 
          photo={{ ...album.photos[lightboxIndex], src: processImage(album.photos[lightboxIndex].src).src }}
          onClose={closeLightbox}
          onNext={nextPhoto}
          onPrev={prevPhoto}
          hasNext={album.photos.length > 1}
          hasPrev={album.photos.length > 1}
        />
      )}
    </div>
  );
};

export default Album;
