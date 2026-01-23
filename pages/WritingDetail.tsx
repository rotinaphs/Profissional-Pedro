import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useData, processImage } from '../context/DataContext';

const WritingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { writings } = useData();
  const work = writings.find((w) => w.id === id);

  if (!work) {
    return <Navigate to="/writings" replace />;
  }

  const { src, style } = processImage(work.coverImage);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <div className="relative w-full h-[60vh] bg-stone-900 flex flex-col items-center justify-center text-center px-4">
        {work.coverImage && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-no-repeat opacity-50"
              style={{ 
                  backgroundImage: `url(${src})`,
                  backgroundPosition: style.backgroundPosition || 'center'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent" />
          </>
        )}
        
        <div className="relative z-10 max-w-4xl">
           <Link to="/writings" className="inline-flex items-center text-stone-300 hover:text-white mb-12 transition-colors uppercase text-[10px] font-bold tracking-[0.2em]">
            <ArrowLeft size={14} className="mr-2" /> Voltar para Escritos
          </Link>
          <div 
            className="text-stone-300 uppercase tracking-[0.3em] mb-4 font-sans font-bold"
            style={{ fontSize: 'var(--font-size-subtitle)' }}
          >
            {work.category}
          </div>
          <h1 
            className="font-serif text-white mb-8 leading-tight tracking-tight px-4"
            style={{ fontSize: 'var(--font-size-title)' }}
          >
            {work.title}
          </h1>
          <time 
            className="text-stone-400 font-sans tracking-widest font-medium"
            style={{ fontSize: 'var(--font-size-subtitle)' }}
          >
            {work.date}
          </time>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-24">
        <div 
          className="prose prose-stone font-serif leading-relaxed text-stone-800"
          style={{ fontSize: 'var(--font-size-base)' }}
        >
          {/* Dangerously setting HTML since the source is trusted (local file) */}
          <div dangerouslySetInnerHTML={{ __html: work.content }} />
        </div>

        <div className="mt-24 pt-12 border-t border-stone-100 text-center">
            <p className="font-sans text-stone-400 text-xs font-bold uppercase tracking-widest opacity-40">Fim da leitura</p>
        </div>
      </article>
    </div>
  );
};

export default WritingDetail;