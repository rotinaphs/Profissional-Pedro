import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, ZoomIn, ZoomOut } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Viewer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get('url');
  const type = searchParams.get('type');
  
  const [numPages, setNumPages] = useState<number | null>(null);
  const [scale, setScale] = useState(1.0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Prevent right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

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
        
        {type === 'pdf' && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-stone-800 rounded-lg p-1">
              <button 
                onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                className="p-1 hover:bg-stone-700 rounded text-stone-400 hover:text-white transition-colors"
                title="Diminuir Zoom"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-xs text-stone-400 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button 
                onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
                className="p-1 hover:bg-stone-700 rounded text-stone-400 hover:text-white transition-colors"
                title="Aumentar Zoom"
              >
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-0 md:p-8 w-full overflow-hidden bg-stone-900/50">
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
          <div className="w-full h-full flex flex-col items-center overflow-auto custom-scrollbar pt-4 md:pt-0">
            <Document
              file={url}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center text-white h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mr-2"></div>
                  Carregando PDF...
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center text-red-400 p-4 text-center h-full">
                  <AlertTriangle size={32} className="mb-2" />
                  <p>Erro ao carregar o documento.</p>
                </div>
              }
              className="flex flex-col items-center gap-8 py-8"
            >
              {numPages && Array.from(new Array(numPages), (_, index) => (
                <Page 
                  key={`page_${index + 1}`}
                  pageNumber={index + 1} 
                  scale={scale} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  className="shadow-2xl bg-white"
                  width={windowWidth > 768 ? undefined : windowWidth}
                />
              ))}
            </Document>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 text-center bg-stone-900/80 backdrop-blur-md border-t border-white/5">
        <p className="text-[10px] text-stone-500 uppercase tracking-widest font-medium">
          Este conteúdo está protegido. O download foi desabilitado por solicitação do autor.
        </p>
      </div>
    </div>
  );
};

export default Viewer;
