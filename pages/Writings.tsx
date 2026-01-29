
import React from 'react';
import { Link } from 'react-router-dom';
import { useData, processImage } from '../context/DataContext';

const Writings: React.FC = () => {
  const { writings, writingsPage } = useData();

  return (
    <div className="min-h-screen bg-stone-50 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
          <h1 
            className="text-5xl md:text-6xl mb-6"
            style={{
               color: 'var(--elem-title-color)',
               fontFamily: 'var(--elem-title-font)'
            }}
          >{writingsPage.title}</h1>
          <p 
            className="italic text-lg"
            style={{
               color: 'var(--elem-subtitle-color)',
               fontFamily: 'var(--elem-subtitle-font)'
            }}
          >
            {writingsPage.description}
          </p>
        </header>

        <div className="space-y-16">
          {writings.map((work) => {
            const { src, style } = processImage(work.coverImage);
            return (
                <article key={work.id} className="flex flex-col md:flex-row gap-8 items-start group">
                {/* Optional Cover for Text */}
                {work.coverImage && (
                    <div className="w-full md:w-1/3 aspect-[3/2] overflow-hidden bg-stone-200 shadow-sm flex-shrink-0">
                    <Link to={`/writings/${work.id}`}>
                        <img 
                        src={src} 
                        alt={work.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        style={style}
                        />
                    </Link>
                    </div>
                )}

                <div className="flex-1">
                    <div 
                      className="flex items-center gap-3 mb-3 text-xs font-bold tracking-widest uppercase"
                      style={{
                        color: 'var(--elem-subtitle-color)',
                        fontFamily: 'var(--elem-subtitle-font)'
                      }}
                    >
                      <span style={{ color: 'var(--elem-title-color)' }}>{work.category}</span>
                      <span>•</span>
                      <span>{work.date}</span>
                    </div>
                    
                    <Link to={`/writings/${work.id}`} className="block">
                    <h2 
                      className="text-3xl md:text-4xl mb-4 transition-opacity group-hover:opacity-70 leading-tight"
                      style={{
                        color: 'var(--elem-title-color)',
                        fontFamily: 'var(--elem-title-font)'
                      }}
                    >
                        {work.title}
                    </h2>
                    </Link>
                    
                    <p 
                      className="leading-relaxed mb-6 font-light"
                      style={{
                        color: 'var(--elem-text-color)',
                        fontFamily: 'var(--elem-text-font)',
                        fontSize: 'var(--font-size-base)'
                      }}
                    >
                    {work.excerpt}
                    </p>

                    <Link 
                    to={`/writings/${work.id}`} 
                    className="inline-block text-sm font-medium uppercase tracking-widest border-b pb-1 hover:opacity-70 transition-opacity"
                    style={{
                       color: 'var(--elem-title-color)',
                       borderColor: 'var(--elem-subtitle-color)'
                    }}
                    >
                    Ler completo
                    </Link>
                </div>
                </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Writings;
