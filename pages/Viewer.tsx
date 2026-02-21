
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

const Viewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');
  const type = searchParams.get('type');

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  if (!url) {
    return (
      <div className="min-h-screen bg-stone-900 flex flex-col items-center justify-center text-white p-4">
        <AlertTriangle size={48} className="text-amber-500 mb-4" />
        <h1 className="text-xl font-bold">URL não encontrada</h1>
        <button onClick={() => navigate(-1)} className="mt-4 flex items-center gap-2 text-stone-400 hover:text-white transition-colors">
          <ArrowLeft size={18} /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-stone-900/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-white/5 z-10">
        <button 
          onClick={() => window.close()} 
          className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors text-sm font-medium uppercase tracking-widest"
        >
          <ArrowLeft size={16} /> Fechar Visualizador
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 md:p-8 w-full overflow-hidden">
        {type === 'video' ? (
          <video 
            src={url} 
            controls 
            controlsList="nodownload" 
            onContextMenu={(e) => e.preventDefault()}
            className="max-w-full max-h-full shadow-2xl rounded-lg bg-black"
            autoPlay
          >
            Seu navegador não suporta a exibição de vídeos.
          </video>
        ) : (
          <div className="w-full flex-1 bg-white rounded-lg shadow-2xl overflow-hidden relative flex flex-col">
            <iframe 
              src={`${url}#toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full flex-1 border-none"
              title="PDF Viewer"
              onContextMenu={(e) => e.preventDefault()}
            />
            {/* Overlay to block some interactions if possible */}
            <div className="absolute inset-0 pointer-events-none border-4 border-stone-900/10"></div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center">
        <p className="text-[10px] text-stone-600 uppercase tracking-widest font-medium">
          Este conteúdo está protegido. O download foi desabilitado por solicitação do autor.
        </p>
      </div>
    </div>
  );
};

export default Viewer;
