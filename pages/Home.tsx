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
            <div className="flex gap-6 justify-center">
              <Link 
                to="/portfolio" 
                className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 uppercase tracking-widest text-sm font-medium"
              >
                Ver Fotografias
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Intro Text Section */}
      <div className="bg-stone-50 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <FadeIn>
            <span className="text-stone-500 uppercase tracking-[0.2em] text-sm mb-4 block">
              {home.welcomeLabel}
            </span>
          </FadeIn>
          <FadeIn delay={200}>
            <h2 className="font-serif text-4xl text-stone-900 mb-8 leading-tight">
              {home.introTitle}
            </h2>
          </FadeIn>
          <FadeIn delay={400}>
            <p className="font-sans text-stone-600 leading-relaxed mb-10">
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
        {albums.slice(0, 3).map((album, index) => {
          const { src, style } = processImage(album.coverImage);
          return (
            <FadeIn key={album.id} delay={index * 200} className="h-full">
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