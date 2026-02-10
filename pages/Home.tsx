
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useData, processImage } from '../context/DataContext';
import FadeIn from '../components/FadeIn';

const Home: React.FC = () => {
  const { albums, theme, home } = useData();
  // Use theme hero image, fallback to first album image, fallback to default
  const heroImageRaw = theme.heroImage || albums[0]?.photos[0]?.src || "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80";
  const { src: heroSrc, style: heroStyle } = processImage(heroImageRaw);

  // Determine visibility to ensure grid is always full (no empty spaces)
  // We limit to 4 items max for the preview section
  const visibleAlbums = albums.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative h-[85vh] w-full overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat transition-transform duration-[10s] hover:scale-105 animate-fade-in"
          style={{ 
              backgroundImage: `url(${heroSrc})`,
              backgroundPosition: heroStyle.backgroundPosition || 'center'
          }}
        />
        <div className="absolute inset-0 bg-black/30" /> {/* Overlay */}
        
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <FadeIn delay={200}>
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-tight mb-6 drop-shadow-lg">
              {home.heroTitle}
            </h1>
          </FadeIn>
          <FadeIn delay={400}>
            <p className="font-sans text-lg md:text-xl font-light tracking-widest uppercase mb-10 opacity-90">
              {home.heroSubtitle}
            </p>
          </FadeIn>
          <FadeIn delay={600}>
            <div className="flex gap-6 justify-center flex-wrap">
              <Link 
                to="/portfolio" 
                className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-sm font-medium"
              >
                Ver Fotografias
              </Link>
              <Link 
                to="/writings" 
                className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-sm font-medium"
              >
                Ver Escritos
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Intro Text Section */}
      <div className="bg-stone-50 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <span 
              className="uppercase tracking-[0.2em] text-sm mb-4 block"
              style={{
                color: 'var(--elem-subtitle-color)',
                fontFamily: 'var(--elem-subtitle-font)'
              }}
            >
              {home.welcomeLabel}
            </span>
          </FadeIn>
          <FadeIn delay={200}>
            <h2 
              className="text-4xl mb-8 leading-tight"
              style={{
                color: 'var(--elem-title-color)',
                fontFamily: 'var(--elem-title-font)'
              }}
            >
              {home.introTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={400}>
            <p 
              className="leading-relaxed mb-10"
              style={{
                color: 'var(--elem-text-color)',
                fontFamily: 'var(--elem-text-font)',
                fontSize: 'var(--font-size-base)'
              }}
            >
              {home.introDescription}
            </p>
          </FadeIn>
          <FadeIn delay={600}>
            <Link to="/about" className="inline-flex items-center text-stone-900 font-medium hover:text-stone-600 transition-colors uppercase tracking-widest text-sm border-b border-stone-900 pb-1">
              Conheça o autor <ArrowRight size={16} className="ml-2" />
            </Link>
          </FadeIn>
        </div>
      </div>

      {/* Featured Albums Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {visibleAlbums.map((album, index) => {
          const { src, style } = processImage(album.coverImage);
          
          // Responsive Visibility Logic:
          // Mobile (1 col): Show all (1, 2, 3, 4)
          // Tablet (2 cols): Show multiples of 2 (2 or 4). Hide 3rd if only 3 exist.
          // Desktop (3 cols): Show multiples of 3 (3). Hide 4th if 4 exist.
          
          let visibilityClass = "block";
          
          if (index === 2) {
             // 3rd Item: If we only have 3 items, hiding this on tablet ensures we show 2 items (full row), avoiding a hole.
             if (visibleAlbums.length === 3) {
                 visibilityClass = "block md:hidden lg:block";
             }
          }
          
          if (index === 3) {
             // 4th Item: Always hide on desktop (3 cols) to prevent hanging item (showing 3 is better than 4 with 2 holes).
             // Show on tablet (2 cols) because 4 items fill the grid perfectly.
             visibilityClass = "block lg:hidden";
          }

          return (
            <FadeIn key={album.id} delay={index * 200} className={`h-full ${visibilityClass}`}>
                <Link to={`/portfolio/${album.id}`} className="group relative h-96 overflow-hidden block">
                <div 
                    className="absolute inset-0 bg-cover transition-transform duration-700 group-hover:scale-110"
                    style={{ 
                        backgroundImage: `url(${src})`,
                        backgroundPosition: style.backgroundPosition || 'center'
                    }}
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                    <span className="text-xs uppercase tracking-widest mb-2">{album.date}</span>
                    <h3 className="font-serif text-2xl italic">{album.title}</h3>
                </div>
                </Link>
            </FadeIn>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
