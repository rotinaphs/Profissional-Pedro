
import React from 'react';
import { Link } from 'react-router-dom';
import { useData, processImage } from '../context/DataContext';
import FadeIn from '../components/FadeIn';

const Portfolio: React.FC = () => {
  const { albums, portfolioPage } = useData();

  return (
    <div className="min-h-screen bg-stone-50 py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-16 text-center">
          <FadeIn>
            <h1 
              className="text-5xl md:text-6xl mb-4"
              style={{
                color: 'var(--elem-title-color)',
                fontFamily: 'var(--elem-title-font)'
              }}
            >{portfolioPage.title}</h1>
            <div className="h-1 w-20 mx-auto mb-6" style={{ backgroundColor: 'var(--elem-title-color)' }}></div>
          </FadeIn>
          <FadeIn delay={200}>
            <p 
              className="max-w-2xl mx-auto font-light"
              style={{
                color: 'var(--elem-text-color)',
                fontFamily: 'var(--elem-text-font)',
                fontSize: 'var(--font-size-base)'
              }}
            >
              {portfolioPage.description}
            </p>
          </FadeIn>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {albums.map((album, index) => {
            const { src, style } = processImage(album.coverImage);
            return (
                <FadeIn key={album.id} delay={index * 100}>
                <Link to={`/portfolio/${album.id}`} className="group block cursor-pointer">
                    <div className="relative aspect-[4/3] overflow-hidden bg-stone-200 mb-6 shadow-sm">
                    <img 
                        src={src} 
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={style}
                    />
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                    </div>
                    <div className="text-center">
                    <h2 
                      className="text-3xl mb-2 transition-opacity group-hover:opacity-70"
                      style={{
                        color: 'var(--elem-title-color)',
                        fontFamily: 'var(--elem-title-font)'
                      }}
                    >
                        {album.title}
                    </h2>
                    <p 
                      className="text-sm uppercase tracking-widest mb-2"
                      style={{
                        color: 'var(--elem-subtitle-color)',
                        fontFamily: 'var(--elem-subtitle-font)'
                      }}
                    >
                        {album.date} • {album.photos.length} Fotos
                    </p>
                    <p 
                      className="italic font-light line-clamp-2 px-8"
                      style={{
                        color: 'var(--elem-text-color)',
                        fontFamily: 'var(--elem-text-font)',
                        fontSize: 'var(--font-size-base)'
                      }}
                    >
                        {album.description}
                    </p>
                    </div>
                </Link>
                </FadeIn>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
