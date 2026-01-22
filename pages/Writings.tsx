import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';

const Writings: React.FC = () => {
  const { writings } = useData();

  return (
    <div className="min-h-screen bg-stone-50 py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-20 text-center">
          <h1 className="font-serif text-5xl md:text-6xl text-stone-900 mb-6">Escritos</h1>
          <p className="text-stone-500 font-serif italic text-lg">
            Ensaios, crônicas e devaneios poéticos.
          </p>
        </header>

        <div className="space-y-16">
          {writings.map((work) => (
            <article key={work.id} className="flex flex-col md:flex-row gap-8 items-start group">
              {/* Optional Cover for Text */}
              {work.coverImage && (
                <div className="w-full md:w-1/3 aspect-[3/2] overflow-hidden bg-stone-200 shadow-sm flex-shrink-0">
                  <Link to={`/writings/${work.id}`}>
                    <img 
                      src={work.coverImage} 
                      alt={work.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </Link>
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3 text-xs font-bold tracking-widest uppercase text-stone-400">
                  <span className="text-stone-900">{work.category}</span>
                  <span>•</span>
                  <span>{work.date}</span>
                </div>
                
                <Link to={`/writings/${work.id}`} className="block">
                  <h2 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4 group-hover:text-stone-600 transition-colors leading-tight">
                    {work.title}
                  </h2>
                </Link>
                
                <p className="font-sans text-stone-600 leading-relaxed mb-6 font-light">
                  {work.excerpt}
                </p>

                <Link 
                  to={`/writings/${work.id}`} 
                  className="inline-block text-sm font-medium uppercase tracking-widest text-stone-900 border-b border-stone-300 pb-1 hover:border-stone-900 transition-colors"
                >
                  Ler completo
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Writings;