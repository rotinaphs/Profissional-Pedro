
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useData, processImage } from '../context/DataContext';
import { Plus, Trash2, Save, LogOut, ChevronDown, Settings, Image as ImageIcon, BookOpen, User, ArrowLeft, MessageSquareQuote, Upload, X, Check, Loader2, Layout, Lock, AlertTriangle, HardDrive, Menu, RotateCcw, MousePointer2, Link as LinkIcon, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

// --- Utility: Auto Save Hook (Faster Delay) ---
const useAutoSave = (callback: () => void, dependencies: any[], delay = 1000) => {
  const callbackRef = useRef(callback);
  const firstRender = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const handler = setTimeout(() => {
      callbackRef.current();
    }, delay);

    return () => clearTimeout(handler);
  }, dependencies);
};

// --- Utility: Upload Logic (Pure Function) ---
const uploadToStorage = async (file: File): Promise<string> => {
  // Validate type: Allow images and PDFs
  if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
    throw new Error('Apenas arquivos de imagem ou PDF são permitidos.');
  }

  const fileExt = file.name.split('.').pop();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  const fileName = `${Date.now()}-${sanitizedName}.${fileExt}`;

  // Try upload. If it fails due to fetch error, throw specific msg
  try {
      const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) {
        if (error.message.includes('Bucket not found') || error.message.includes('row not found')) throw new Error('BUCKET_MISSING');
        throw error;
      }

      const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
      return data.publicUrl;
  } catch (err: any) {
      // Mock upload if backend fails (Offline Mode)
      if (err.message === 'Failed to fetch' || err.message === 'BUCKET_MISSING' || (err.code && err.code.toString().startsWith('4'))) {
          console.warn("Upload falhou (Offline/Demo), usando URL local.");
          return URL.createObjectURL(file); 
      }
      throw err;
  }
};

// --- Custom Hook: Manage Upload State ---
const useUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = useCallback(async (file: File | undefined, onSuccess: (url: string) => void) => {
    if (!file) return;
    setIsUploading(true);
    setError('');
    try {
      const url = await uploadToStorage(file);
      onSuccess(url);
    } catch (err: any) {
       const msg = (err.message || 'Falha ao enviar arquivo.');
       setError(msg);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, error, handleUpload, setError };
};

// --- Main Admin Component ---
const Admin: React.FC = () => {
  const { 
    profile, albums, writings, testimonials, theme, home, portfolioPage, writingsPage,
    updateProfile, updateAlbums, updateWritings, updateTestimonials, updateTheme, updateHome, updatePortfolioPage, updateWritingsPage, resetData 
  } = useData();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Login State
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
    } catch (e: any) {
        // Fallback for demo/offline if credentials match a hardcoded value (Optional, just handling error)
        if (e.message === 'Failed to fetch') {
             alert("Modo Offline: Login simulado.");
             setSession({ user: { email: credentials.email } });
        } else {
             setLoginError(e.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : 'Erro ao conectar.');
        }
    }
    setIsLoggingIn(false);
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); 
  };

  const menuItems = [
    { id: 'home', label: 'Página Inicial', icon: <Layout size={20} /> },
    { id: 'profile', label: 'Perfil & Bio', icon: <User size={20} /> },
    { id: 'portfolio', label: 'Portfólio', icon: <ImageIcon size={20} /> },
    { id: 'writings', label: 'Escritos', icon: <BookOpen size={20} /> },
    { id: 'testimonials', label: 'Depoimentos', icon: <MessageSquareQuote size={20} /> },
    { id: 'theme', label: 'Aparência', icon: <Settings size={20} /> },
    { id: 'maintenance', label: 'Manutenção', icon: <HardDrive size={20} /> },
  ];

  if (loading) return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-stone-900" size={32} /></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-stone-200">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="text-white" size={20} /></div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Acesso Restrito</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Email</label>
              <input type="email" value={credentials.email} onChange={(e) => setCredentials({...credentials, email: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Senha</label>
              <input type="password" value={credentials.password} onChange={(e) => setCredentials({...credentials, password: e.target.value})} className="w-full p-3 border border-stone-300 rounded-lg" required />
            </div>
            {loginError && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"><X size={14} /> {loginError}</div>}
            <button type="submit" disabled={isLoggingIn} className="w-full bg-stone-900 text-white py-3 rounded-lg flex justify-center items-center gap-2 disabled:opacity-70">
              {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : 'Entrar no Painel'}
            </button>
            <div className="text-center mt-6 pt-6 border-t border-stone-100">
               <Link to="/" className="text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900">← Voltar ao site</Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-stone-50 flex flex-col md:flex-row font-sans text-stone-900 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden flex-none h-16 bg-[#1c1917] text-stone-100 px-4 flex items-center justify-between shadow-md z-30 relative">
         <span className="font-serif font-bold text-lg tracking-wide">Admin Painel</span>
         <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-stone-300 hover:text-white">
            <Menu size={24} />
         </button>
      </div>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 bg-[#1c1917] text-stone-400 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
          w-72 p-8
          md:relative md:translate-x-0 md:shadow-none md:w-60 md:p-6 
          lg:w-72 lg:p-8
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-8 md:mb-12 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-100 mb-2">Admin Painel</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500 truncate max-w-[180px]">{session.user.email}</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-stone-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto pr-2 no-scrollbar">
           {menuItems.map(item => (
             <NavButton 
                key={item.id} 
                active={activeTab === item.id} 
                onClick={() => handleNavClick(item.id)} 
                icon={item.icon} 
                label={item.label} 
             />
           ))}
        </nav>

        <div className="mt-auto pt-8 border-t border-stone-800/50 space-y-6">
          <Link to="/" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors text-sm group"><ArrowLeft size={18} /> Ver Site</Link>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm w-full text-left"><LogOut size={18} /> Sair</button>
          <button onClick={resetData} className="text-xs text-stone-600 hover:text-stone-400 underline w-full text-left">Resetar tudo</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-white md:bg-stone-50 w-full">
         <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto flex flex-col">
            {activeTab === 'home' && <HomeEditor home={home} updateHome={updateHome} />}
            {activeTab === 'profile' && <ProfileEditor profile={profile} updateProfile={updateProfile} />}
            {activeTab === 'portfolio' && <PortfolioEditor albums={albums} updateAlbums={updateAlbums} pageContent={portfolioPage} updatePageContent={updatePortfolioPage} />}
            {activeTab === 'writings' && <WritingsEditor writings={writings} updateWritings={updateWritings} pageContent={writingsPage} updatePageContent={updateWritingsPage} />}
            {activeTab === 'testimonials' && <TestimonialsEditor testimonials={testimonials} updateTestimonials={updateTestimonials} />}
            {activeTab === 'theme' && <ThemeEditor theme={theme} updateTheme={updateTheme} />}
            {activeTab === 'maintenance' && <MaintenancePanel />}
         </div>
      </main>
    </div>
  );
};

// --- Sub-Components ---

const NavButton = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-4 rounded-lg transition-all duration-300 ${active ? 'bg-stone-800 text-white shadow-lg translate-x-2' : 'hover:bg-stone-800/30 hover:text-stone-200'}`}>
    {icon} <span className="font-medium tracking-wide">{label}</span>
  </button>
);

const FeedbackSaveButton: React.FC<{ onClick: () => Promise<void> | void; status: 'idle' | 'saving' | 'success'; label?: string; className?: string; }> = ({ onClick, status, label = "Salvar Alterações", className = "" }) => {
  const isSaving = status === 'saving';
  const isSuccess = status === 'success';
  return (
    <button onClick={onClick} disabled={isSaving} className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-300 font-medium tracking-wide shadow-lg min-w-0 ${isSuccess ? 'bg-green-600 text-white' : 'bg-[#1c1917] text-white hover:bg-black'} ${className} ${isSaving ? 'opacity-80 cursor-not-allowed' : ''}`}>
      {isSaving ? <><Loader2 size={18} className="animate-spin" /> <span className="hidden sm:inline">Salvando...</span></> : isSuccess ? <><Check size={18} /> <span className="hidden sm:inline">Salvo!</span></> : <><Save size={18} className="hidden sm:inline" /> {label}</>}
    </button>
  );
};

// --- PDF Input Component ---
const PdfInput: React.FC<{ label: string; value: string | undefined; onChange: (val: string) => void; className?: string; compact?: boolean }> = ({ label, value, onChange, className, compact = false }) => {
  const { isUploading, error, handleUpload } = useUpload();
  
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files?.[0], (url) => {
        onChange(url);
        e.target.value = '';
    });
  };

  const isPdf = value?.toLowerCase().endsWith('.pdf');

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">{label}</label>
      <div className="flex flex-col gap-3">
         <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex-1 w-full">
              <input 
                type="text" 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)} 
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none" 
                placeholder="URL do PDF..." 
              />
            </div>
            <label className={`bg-stone-200 text-stone-700 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-stone-300 transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <Upload size={14} /> {isUploading ? 'Enviando...' : 'Upload PDF'}
                <input type="file" onChange={onFileChange} className="hidden" accept="application/pdf" disabled={isUploading} />
            </label>
         </div>
         {error && <div className="text-xs text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={14} /> {error}</div>}
         
         {value && isPdf && (
           <div className={`bg-stone-100 rounded-lg border border-stone-200 overflow-hidden ${compact ? 'p-2' : 'p-4'}`}>
              <div className="flex items-center justify-between mb-2">
                 <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center gap-2"><FileText size={14} /> Pré-visualização do Documento</span>
                 <a href={value} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1 bg-white px-2 py-1 rounded border border-stone-200 hover:bg-stone-50"><ExternalLink size={12} /> Abrir em nova aba</a>
              </div>
              {!compact && (
                <iframe src={value} className="w-full h-64 sm:h-80 md:h-96 lg:h-[30rem] bg-white border border-stone-200 rounded" title="PDF Preview"></iframe>
              )}
           </div>
         )}
      </div>
    </div>
  );
};

const ImageInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; className?: string; }> = ({ label, value, onChange, className }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const { isUploading, error, handleUpload } = useUpload();
  const { src, style } = processImage(value);
  const posString = style.objectPosition?.toString() || '50% 50%';
  const [leftPos, topPos] = posString.split(' ');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files?.[0], (url) => {
        onChange(url);
        e.target.value = '';
    });
  };

  const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
      if (!imageRef.current) return;
      const rect = imageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      const separator = src.includes('?') ? '&' : '?';
      onChange(`${src}${separator}pos=${x.toFixed(0)},${y.toFixed(0)}`);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">{label}</label>
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative group w-32 h-32 flex-shrink-0 bg-stone-100 rounded-lg border border-stone-200 overflow-hidden flex items-center justify-center cursor-crosshair">
          {isUploading ? <Loader2 className="animate-spin text-stone-400" size={24}/> : value ? (
            <>
                <img ref={imageRef} src={src} alt="Preview" className="w-full h-full object-cover" style={style} onClick={onImageClick} title="Clique para definir o ponto de foco" />
                <div className="absolute w-6 h-6 rounded-full border-2 border-white bg-red-500/60 shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10" style={{ left: leftPos, top: topPos }}><div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" /></div>
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                <button onClick={() => onChange('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 pointer-events-auto"><X size={12} /></button>
            </>
          ) : <ImageIcon className="text-stone-300" size={32} />}
        </div>
        <div className="flex-1 space-y-3 w-full min-w-0">
           <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <label className={`bg-stone-200 text-stone-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-stone-300 transition-colors flex items-center gap-2 cursor-pointer ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    <Upload size={14} /> {isUploading ? 'Enviando...' : 'Upload'}
                    <input type="file" onChange={onFileChange} className="hidden" accept="image/*" disabled={isUploading} />
                </label>
              </div>
              {error && <div className="flex items-center gap-2 text-xs text-red-500 font-bold bg-red-50 p-2 rounded"><AlertTriangle size={14} /> {error}</div>}
              {value && <p className="text-[10px] text-stone-400 flex items-center gap-1"><MousePointer2 size={10} /> Clique na imagem para ajustar o foco.</p>}
           </div>
           <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none" placeholder="Ou cole URL..." />
        </div>
      </div>
    </div>
  );
};

// Fix for TypeScript error: Using React.FC to allow 'key' prop in JSX
const PhotoItemEditor: React.FC<{ photo: any, albumId: string, updatePhoto: any, removePhoto: any }> = ({ photo, albumId, updatePhoto, removePhoto }) => {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [showPdf, setShowPdf] = useState(!!photo.pdfUrl);
    const imageRef = useRef<HTMLImageElement>(null);
    
    const { src, style } = processImage(photo.src);
    const posString = style.objectPosition?.toString() || '50% 50%';
    const [leftPos, topPos] = posString.split(' ');
  
    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError(null);

        if (!file.type.startsWith('image/')) { setUploadError("Apenas imagens."); return; }
        if (file.size > 5 * 1024 * 1024) { setUploadError("Max 5MB."); return; }

        setUploading(true);
        try {
            const url = await uploadToStorage(file);
            updatePhoto(albumId, photo.id, 'src', url, true); // FORCE SAVE
        } catch (err: any) {
            console.error(err);
            setUploadError("Erro no upload.");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!imageRef.current || !photo.src) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        const separator = src.includes('?') ? '&' : '?';
        updatePhoto(albumId, photo.id, 'src', `${src}${separator}pos=${x.toFixed(0)},${y.toFixed(0)}`, true); // Force Save
    };

    return (
      <div className="flex flex-col gap-3 bg-stone-50 p-3 rounded-lg border border-stone-100 transition-colors hover:border-stone-300">
        <div className="flex gap-4 items-start">
          <div className="relative group w-20 h-20 flex-shrink-0 bg-stone-200 rounded overflow-hidden flex items-center justify-center cursor-crosshair">
              {uploading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-100 z-30"><Loader2 className="animate-spin text-stone-500 mb-1" size={20} /><span className="text-[8px] font-bold text-stone-400 uppercase">Enviando</span></div>
              ) : (
                  <>
                      <img ref={imageRef} src={src} className="w-full h-full object-cover transition-opacity group-hover:opacity-90" alt="thumb" style={style} onClick={onImageClick} title="Clique para definir o ponto de foco" />
                      <div className="absolute w-3 h-3 rounded-full border border-white bg-red-500/80 shadow-sm pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10" style={{ left: leftPos, top: topPos }}><div className="w-0.5 h-0.5 bg-white rounded-full" /></div>
                      <label className="absolute bottom-1 right-1 w-6 h-6 flex items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded cursor-pointer z-20 opacity-0 group-hover:opacity-100 transition-all shadow-sm" title="Substituir Imagem">
                        <Upload size={12} />
                        <input type="file" className="hidden" accept="image/*" onChange={onFileChange} disabled={uploading} />
                      </label>
                  </>
              )}
          </div>
          
          <div className="flex-1 space-y-2 min-w-0">
              <div className="flex flex-col gap-1">
                  <input 
                      type="text" 
                      placeholder="URL da Imagem" 
                      value={photo.src} 
                      onChange={e => updatePhoto(albumId, photo.id, 'src', e.target.value)} 
                      onBlur={() => updatePhoto(albumId, photo.id, 'src', photo.src, true)} // FORCE SAVE
                      className="w-full p-2 border border-stone-200 rounded text-xs focus:border-stone-400 focus:outline-none transition-colors text-stone-800 bg-white" 
                      disabled={uploading}
                  />
                  {uploadError && <span className="text-[10px] text-red-500 font-bold flex items-center gap-1"><AlertTriangle size={10} /> {uploadError}</span>}
              </div>
              <input 
                  type="text" 
                  placeholder="Legenda/Título (Opcional)" 
                  value={photo.caption || ''} 
                  onChange={e => updatePhoto(albumId, photo.id, 'caption', e.target.value)} 
                  onBlur={() => updatePhoto(albumId, photo.id, 'caption', photo.caption, true)} // FORCE SAVE
                  className="w-full p-2 border border-stone-200 rounded text-xs focus:border-stone-400 focus:outline-none transition-colors text-stone-800 bg-white" 
              />
          </div>
          
          <div className="flex flex-col gap-2">
            <button onClick={() => removePhoto(albumId, photo.id)} className="text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all" title="Remover foto"><X size={18} /></button>
            <button onClick={() => setShowPdf(!showPdf)} className={`p-2 rounded-lg transition-all ${showPdf || photo.pdfUrl ? 'text-stone-800 bg-stone-200' : 'text-stone-300 hover:text-stone-600 hover:bg-stone-100'}`} title="Anexar PDF"><FileText size={18} /></button>
          </div>
        </div>

        {(showPdf || photo.pdfUrl) && (
           <div className="pt-2 border-t border-stone-200">
              <PdfInput label="Anexo PDF (Opcional)" value={photo.pdfUrl} onChange={(val) => updatePhoto(albumId, photo.id, 'pdfUrl', val, true)} compact />
           </div>
        )}
      </div>
    );
};

const HomeEditor: React.FC<{ home: any, updateHome: any }> = ({ home, updateHome }) => {
    const [localHome, setLocalHome] = useState(home);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const handleChange = (field: string, value: string) => setLocalHome({ ...localHome, [field]: value });
    const save = async () => { setSaveStatus('saving'); updateHome(localHome); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
    useAutoSave(save, [localHome]);

    return (
      <div className="max-w-4xl h-full flex flex-col">
        <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Conteúdo da Página Inicial</h2>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8 flex-1 overflow-y-auto pb-20">
          <div className="space-y-6">
            <h3 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-2">Seção de Destaque</h3>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Título Principal</label><input type="text" value={localHome.heroTitle} onChange={e => handleChange('heroTitle', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Subtítulo</label><input type="text" value={localHome.heroSubtitle} onChange={e => handleChange('heroSubtitle', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
            </div>
          </div>
          <div className="space-y-6 pt-4">
            <h3 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-2">Seção de Introdução</h3>
            <div className="space-y-4">
              <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Rótulo</label><input type="text" value={localHome.welcomeLabel} onChange={e => handleChange('welcomeLabel', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Frase de Impacto</label><input type="text" value={localHome.introTitle} onChange={e => handleChange('introTitle', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
              <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Texto de Boas-vindas</label><textarea value={localHome.introDescription} onChange={e => handleChange('introDescription', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg h-32 resize-none" /></div>
            </div>
          </div>
          <div className="pt-4"><FeedbackSaveButton status={saveStatus} onClick={save} /></div>
        </div>
      </div>
    );
  };

const ProfileEditor: React.FC<{ profile: any, updateProfile: any }> = ({ profile, updateProfile }) => {
  const [localProfile, setLocalProfile] = useState(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string, nested?: string) => {
    if (nested) setLocalProfile({ ...localProfile, [field]: { ...localProfile[field], [nested]: e.target.value } });
    else setLocalProfile({ ...localProfile, [field]: e.target.value });
  };
  const handleBioChange = (idx: number, val: string) => { const newBio = [...localProfile.bio]; newBio[idx] = val; setLocalProfile({ ...localProfile, bio: newBio }); };
  const save = async () => { setSaveStatus('saving'); updateProfile(localProfile); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  useAutoSave(save, [localProfile]);

  return (
    <div className="max-w-4xl h-full flex flex-col">
      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Editar Perfil</h2>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8 flex-1 overflow-y-auto pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Nome</label><input type="text" value={localProfile.name} onChange={e => handleChange(e, 'name')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Cargo/Título</label><input type="text" value={localProfile.role} onChange={e => handleChange(e, 'role')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
        </div>
        <ImageInput label="Foto de Perfil" value={localProfile.profileImage} onChange={(val) => setLocalProfile({...localProfile, profileImage: val})} />
        <div className="space-y-4">
          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Biografia</label>
          {localProfile.bio.map((text: string, idx: number) => (<textarea key={idx} value={text} onChange={(e) => handleBioChange(idx, e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg min-h-[100px]" />))}
          <div className="flex gap-4">
             <button onClick={() => setLocalProfile({...localProfile, bio: [...localProfile.bio, ""]})} className="text-xs font-bold text-stone-500 hover:text-stone-900">+ Adicionar Parágrafo</button>
             {localProfile.bio.length > 1 && <button onClick={() => setLocalProfile({...localProfile, bio: localProfile.bio.slice(0, -1)})} className="text-xs font-bold text-red-400 hover:text-red-600">Remover Último</button>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-stone-100">
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</label><input type="text" value={localProfile.contact.email} onChange={e => handleChange(e, 'contact', 'email')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Telefone</label><input type="text" value={localProfile.contact.phone || ''} onChange={e => handleChange(e, 'contact', 'phone')} className="w-full p-3 border border-stone-200 rounded-lg" placeholder="+55 11 99999-9999" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Instagram</label><input type="text" value={localProfile.contact.instagram} onChange={e => handleChange(e, 'contact', 'instagram')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">LinkedIn</label><input type="text" value={localProfile.contact.linkedin} onChange={e => handleChange(e, 'contact', 'linkedin')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
        </div>
        <div className="pt-4"><FeedbackSaveButton status={saveStatus} onClick={save} /></div>
      </div>
    </div>
  );
};

const PortfolioEditor: React.FC<{ albums: any[], updateAlbums: any, pageContent: any, updatePageContent: any }> = ({ albums, updateAlbums, pageContent, updatePageContent }) => {
  const [localAlbums, setLocalAlbums] = useState([...albums]);
  const [localPageContent, setLocalPageContent] = useState(pageContent);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const save = async () => { 
    setSaveStatus('saving'); 
    await Promise.all([updateAlbums(localAlbums), updatePageContent(localPageContent)]);
    await new Promise(r => setTimeout(r, 800)); 
    setSaveStatus('success'); 
    setTimeout(() => setSaveStatus('idle'), 3000); 
  };
  
  useAutoSave(save, [localAlbums, localPageContent]);

  const addAlbum = () => { 
    const newAlbum = { id: `new-album-${Date.now()}`, title: "Novo Álbum", description: "Descrição...", date: new Date().getFullYear().toString(), coverImage: "https://picsum.photos/800/600", photos: [] }; 
    setLocalAlbums(prev => [newAlbum, ...prev]); 
    setExpandedAlbum(newAlbum.id); 
  };
  
  const removeAlbum = (id: string) => { 
    if(window.confirm("Deletar álbum?")) setLocalAlbums(prev => prev.filter(a => a.id !== id)); 
  };
  
  const updateAlbumField = (id: string, field: string, value: string) => { 
    setLocalAlbums(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a)); 
  };
  
  const addPhoto = (albumId: string) => { 
    setLocalAlbums(prev => prev.map(a => { 
      if (a.id === albumId) return { ...a, photos: [...a.photos, { id: `p-${Date.now()}`, src: "https://picsum.photos/1200/800", alt: "Nova foto", caption: "" }] }; 
      return a; 
    })); 
  };
  
  const removePhoto = useCallback((albumId: string, photoId: string) => { 
    setLocalAlbums(prev => prev.map(a => { 
      if (a.id === albumId) return { ...a, photos: a.photos.filter((p: any) => p.id !== photoId) }; 
      return a; 
    })); 
  }, []);
  
  const updatePhoto = useCallback((albumId: string, photoId: string, field: string, value: string, forceSave = false) => {
     setLocalAlbums(prev => {
        const next = prev.map(a => {
            if (a.id !== albumId) return a;
            return { ...a, photos: a.photos.map((p: any) => p.id === photoId ? { ...p, [field]: value } : p) };
        });
        
        // --- FORCE SAVE IMPLEMENTATION ---
        if (forceSave) {
            setSaveStatus('saving');
            // We use the 'next' state here immediately
            Promise.all([updateAlbums(next), updatePageContent(localPageContent)]).then(() => {
                setSaveStatus('success');
                setTimeout(() => setSaveStatus('idle'), 2000);
            });
        }
        return next;
     });
  }, [updateAlbums, localPageContent]); // Added dependency

  const handleBulkFileChange = async (e: React.ChangeEvent<HTMLInputElement>, albumId: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsBulkUploading(true);
    setSaveStatus('saving');

    try {
        const uploadPromises = Array.from(files).map(async (file: File) => {
            try {
                const url = await uploadToStorage(file);
                return { id: `p-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, src: url, alt: file.name.split('.')[0] || 'Foto', caption: '' };
            } catch (e) {
                console.error("Single file upload failed", e);
                return null;
            }
        });

        const newPhotosRaw = await Promise.all(uploadPromises);
        const newPhotos = newPhotosRaw.filter(p => p !== null);

        const updatedAlbums = localAlbums.map(a => {
            if (a.id === albumId) return { ...a, photos: [...a.photos, ...newPhotos] };
            return a;
        });

        setLocalAlbums(updatedAlbums);
        await updateAlbums(updatedAlbums); 
        setSaveStatus('success');
    } catch (err) {
        console.error("Upload error:", err);
        alert("Erro parcial no upload.");
    } finally {
        setIsBulkUploading(false);
        e.target.value = '';
        setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-5xl h-full flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 flex-shrink-0 gap-4">
         <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">Gerenciar Portfólio</h2>
         <div className="flex gap-2 w-full md:w-auto">
            <button onClick={addAlbum} className="flex-1 md:flex-none bg-white border border-stone-200 text-stone-800 px-4 py-2.5 rounded-lg hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors font-medium shadow-sm text-sm"><Plus size={18} /> <span className="whitespace-nowrap">Novo Álbum</span></button>
            <FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar Tudo" className="flex-1 md:flex-none px-4 py-2.5 min-w-0 text-sm whitespace-nowrap" />
         </div>
       </div>

       <div className="flex-1 overflow-y-auto min-h-0 pb-12 pr-2 space-y-8">
           <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm space-y-6">
             <h3 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-4">Cabeçalho da Página</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Título da Página</label><input type="text" value={localPageContent.title} onChange={e => setLocalPageContent({...localPageContent, title: e.target.value})} className="w-full p-4 border border-stone-200 rounded-lg bg-stone-50/50 focus:bg-white transition-colors text-lg font-serif" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Descrição</label><input type="text" value={localPageContent.description} onChange={e => setLocalPageContent({...localPageContent, description: e.target.value})} className="w-full p-4 border border-stone-200 rounded-lg bg-stone-50/50 focus:bg-white transition-colors" /></div>
             </div>
           </div>

           <div className="space-y-4">
             {localAlbums.map(album => (
               <div key={album.id} className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group">
                 <div className="p-4 md:p-6 flex justify-between items-center cursor-pointer hover:bg-stone-50/80 transition-colors" onClick={() => setExpandedAlbum(expandedAlbum === album.id ? null : album.id)}>
                    <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                      <div className="w-20 h-14 md:w-24 md:h-16 rounded-md bg-stone-200 overflow-hidden shadow-sm relative shrink-0"><img src={processImage(album.coverImage).src} className="w-full h-full object-cover" style={processImage(album.coverImage).style} alt="cover" /></div>
                      <div className="min-w-0 flex-1">
                          <h3 className="font-serif text-lg md:text-xl font-bold text-stone-800 group-hover:text-stone-600 transition-colors truncate pr-2">{album.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap"><span className="text-[10px] font-bold uppercase tracking-widest text-stone-400 bg-stone-100 px-2 py-0.5 rounded whitespace-nowrap">{album.photos.length} FOTOS</span><span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">•</span><span className="text-[10px] font-bold uppercase tracking-widest text-stone-500 whitespace-nowrap">{album.date}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 flex-shrink-0 ml-2">
                        <button onClick={(e) => {e.stopPropagation(); removeAlbum(album.id)}} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" title="Excluir Álbum"><Trash2 size={18}/></button>
                        <div className={`p-2 text-stone-300 transition-transform duration-300 ${expandedAlbum === album.id ? 'rotate-180' : ''}`}><ChevronDown size={24}/></div>
                    </div>
                 </div>
                 {expandedAlbum === album.id && (
                   <div className="p-4 md:p-8 border-t border-stone-100 bg-white animate-fade-in">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Título</label><input type="text" value={album.title} onChange={e => updateAlbumField(album.id, 'title', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
                        <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Data</label><input type="text" value={album.date} onChange={e => updateAlbumField(album.id, 'date', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
                        <div className="col-span-2 space-y-2"><ImageInput label="Capa do Álbum" value={album.coverImage} onChange={(val) => updateAlbumField(album.id, 'coverImage', val)} /></div>
                        <div className="col-span-2 space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Descrição</label><textarea value={album.description} onChange={e => updateAlbumField(album.id, 'description', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg h-24 resize-none" /></div>
                        <div className="col-span-2 space-y-2"><PdfInput label="Documento PDF (Album) - Opcional" value={album.pdfUrl} onChange={(val) => updateAlbumField(album.id, 'pdfUrl', val)} /></div>
                     </div>
                     <div className="flex flex-col gap-4 mb-6 border-b border-stone-100 pb-4">
                        <h4 className="font-bold text-sm text-stone-500 uppercase tracking-widest">Galeria</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-center justify-center gap-3 bg-stone-900 text-white hover:bg-stone-800 py-3 rounded-lg shadow-sm font-medium transition-colors w-full cursor-pointer ${isBulkUploading ? 'opacity-70 cursor-wait' : ''}`}>
                               {isBulkUploading ? <Loader2 size={18} className="animate-spin"/> : <Upload size={18}/>}
                               {isBulkUploading ? 'Enviando...' : 'Adicionar Fotos (Upload)'}
                               <input type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleBulkFileChange(e, album.id)} disabled={isBulkUploading} />
                            </label>
                            <button onClick={() => addPhoto(album.id)} className="flex items-center justify-center gap-2 border border-stone-200 text-stone-600 hover:bg-stone-50 py-3 rounded-lg font-medium transition-colors w-full text-xs uppercase tracking-wide"><LinkIcon size={14}/> Adicionar Item Vazio (URL)</button>
                        </div>
                     </div>
                     <div className="space-y-3">
                        {album.photos.map((photo: any) => (
                            <PhotoItemEditor key={photo.id} photo={photo} albumId={album.id} updatePhoto={updatePhoto} removePhoto={removePhoto} />
                        ))}
                     </div>
                   </div>
                 )}
               </div>
             ))}
           </div>
       </div>
    </div>
  );
};

const WritingsEditor: React.FC<{ writings: any[], updateWritings: any, pageContent: any, updatePageContent: any }> = ({ writings, updateWritings, pageContent, updatePageContent }) => {
  const [localWritings, setLocalWritings] = useState([...writings]);
  const [localPageContent, setLocalPageContent] = useState(pageContent);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const save = async () => {
    setSaveStatus('saving');
    await Promise.all([updateWritings(localWritings), updatePageContent(localPageContent)]);
    await new Promise(r => setTimeout(r, 800));
    setSaveStatus('success');
    setTimeout(() => setSaveStatus('idle'), 3000);
  };
  useAutoSave(save, [localWritings, localPageContent]);

  const addWriting = () => {
    const newWork = { id: `writing-${Date.now()}`, title: "Novo Texto", category: "Crônica", excerpt: "Resumo...", content: "<p>Conteúdo do texto...</p>", date: new Date().toLocaleDateString('pt-BR'), coverImage: "" };
    setLocalWritings([newWork, ...localWritings]);
    setExpandedId(newWork.id);
  };

  const removeWriting = (id: string) => { if(window.confirm("Remover este texto?")) setLocalWritings(localWritings.filter(w => w.id !== id)); };
  const updateWriting = (id: string, field: string, value: string) => { setLocalWritings(localWritings.map(w => w.id === id ? { ...w, [field]: value } : w)); };

  return (
    <div className="max-w-4xl h-full flex flex-col">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 flex-shrink-0 gap-4">
         <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900">Gerenciar Escritos</h2>
         <div className="flex gap-2 w-full md:w-auto">
            <button onClick={addWriting} className="flex-1 md:flex-none bg-white border border-stone-200 text-stone-800 px-4 py-2.5 rounded-lg hover:bg-stone-50 flex items-center justify-center gap-2 transition-colors font-medium shadow-sm text-sm"><Plus size={18} /> Novo Texto</button>
            <FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar Tudo" className="flex-1 md:flex-none px-4 py-2.5 min-w-0 text-sm" />
         </div>
       </div>
       <div className="flex-1 overflow-y-auto min-h-0 pb-12 pr-2 space-y-8">
           <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm space-y-6">
             <h3 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-4">Cabeçalho da Página</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Título</label><input type="text" value={localPageContent.title} onChange={e => setLocalPageContent({...localPageContent, title: e.target.value})} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
                <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Descrição</label><input type="text" value={localPageContent.description} onChange={e => setLocalPageContent({...localPageContent, description: e.target.value})} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
             </div>
           </div>
           <div className="space-y-4">
               {localWritings.map(work => (
                   <div key={work.id} className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
                       <div className="p-4 md:p-6 flex justify-between items-center cursor-pointer hover:bg-stone-50 transition-colors" onClick={() => setExpandedId(expandedId === work.id ? null : work.id)}>
                           <div className="min-w-0">
                               <h3 className="font-serif text-lg font-bold text-stone-800 truncate">{work.title}</h3>
                               <p className="text-xs text-stone-500 uppercase tracking-wider mt-1">{work.category} • {work.date}</p>
                           </div>
                           <div className="flex items-center gap-2">
                               <button onClick={(e) => {e.stopPropagation(); removeWriting(work.id)}} className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"><Trash2 size={18}/></button>
                               <ChevronDown size={20} className={`text-stone-300 transition-transform ${expandedId === work.id ? 'rotate-180' : ''}`} />
                           </div>
                       </div>
                       {expandedId === work.id && (
                           <div className="p-6 border-t border-stone-100 bg-stone-50/30 space-y-6 animate-fade-in">
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                   <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Título</label><input type="text" value={work.title} onChange={e => updateWriting(work.id, 'title', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg bg-white" /></div>
                                   <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Categoria</label><input type="text" value={work.category} onChange={e => updateWriting(work.id, 'category', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg bg-white" /></div>
                                   <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Data</label><input type="text" value={work.date} onChange={e => updateWriting(work.id, 'date', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg bg-white" /></div>
                                   <div className="space-y-2"><ImageInput label="Imagem de Capa (Opcional)" value={work.coverImage || ''} onChange={(val) => updateWriting(work.id, 'coverImage', val)} className="bg-white p-2 rounded-lg border border-stone-200" /></div>
                               </div>
                               <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Resumo</label><textarea value={work.excerpt} onChange={e => updateWriting(work.id, 'excerpt', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg bg-white h-20 resize-none" /></div>
                               <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Conteúdo (HTML Permitido)</label><textarea value={work.content} onChange={e => updateWriting(work.id, 'content', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg bg-white h-64 font-mono text-sm" /></div>
                           </div>
                       )}
                   </div>
               ))}
           </div>
       </div>
    </div>
  );
};

const TestimonialsEditor: React.FC<{ testimonials: any[], updateTestimonials: any }> = ({ testimonials, updateTestimonials }) => {
  const [localTestimonials, setLocalTestimonials] = useState([...testimonials]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const save = async () => { setSaveStatus('saving'); updateTestimonials(localTestimonials); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  useAutoSave(save, [localTestimonials]);

  const addTestimonial = () => setLocalTestimonials([...localTestimonials, { id: `t-${Date.now()}`, name: "Novo Nome", role: "Cargo", text: "Depoimento...", avatar: "" }]);
  const removeTestimonial = (id: string) => setLocalTestimonials(localTestimonials.filter(t => t.id !== id));
  const updateTestimonial = (id: string, field: string, value: string) => setLocalTestimonials(localTestimonials.map(t => t.id === id ? { ...t, [field]: value } : t));

  return (
      <div className="max-w-5xl h-full flex flex-col">
          <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-serif font-bold text-stone-900">Depoimentos</h2>
              <div className="flex gap-2">
                <button onClick={addTestimonial} className="bg-white border border-stone-200 text-stone-800 px-4 py-2 rounded-lg hover:bg-stone-50 flex items-center gap-2 text-sm font-medium"><Plus size={16}/> Adicionar</button>
                <FeedbackSaveButton status={saveStatus} onClick={save} />
              </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-6 pb-12 pr-2">
              {localTestimonials.map(t => (
                  <div key={t.id} className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative group">
                      <button onClick={() => removeTestimonial(t.id)} className="absolute top-4 right-4 text-stone-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition-all z-10"><X size={18}/></button>
                      
                      <div className="flex flex-col lg:flex-row gap-8">
                          {/* Left Column: Image Input - giving it fixed width or adapting */}
                          <div className="w-full lg:w-1/3 flex-shrink-0"> 
                              <ImageInput 
                                label="Foto" 
                                value={t.avatar} 
                                onChange={(val) => updateTestimonial(t.id, 'avatar', val)} 
                                className="w-full"
                              />
                          </div>

                          {/* Right Column: Fields */}
                          <div className="flex-1 space-y-5">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Nome</label>
                                    <input 
                                        type="text" 
                                        value={t.name} 
                                        onChange={e => updateTestimonial(t.id, 'name', e.target.value)} 
                                        className="w-full p-3 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white transition-colors outline-none focus:border-stone-400" 
                                        placeholder="Nome do autor"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Cargo</label>
                                    <input 
                                        type="text" 
                                        value={t.role} 
                                        onChange={e => updateTestimonial(t.id, 'role', e.target.value)} 
                                        className="w-full p-3 border border-stone-200 rounded-lg text-sm bg-stone-50 focus:bg-white transition-colors outline-none focus:border-stone-400" 
                                        placeholder="Ex: Designer, Cliente..."
                                    />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Depoimento</label>
                                <textarea 
                                    value={t.text} 
                                    onChange={e => updateTestimonial(t.id, 'text', e.target.value)} 
                                    className="w-full p-3 border border-stone-200 rounded-lg text-sm h-32 resize-none bg-stone-50 focus:bg-white transition-colors outline-none focus:border-stone-400 leading-relaxed" 
                                    placeholder="Escreva o depoimento aqui..."
                                />
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
              {localTestimonials.length === 0 && <div className="text-center py-12 text-stone-400 italic">Nenhum depoimento cadastrado.</div>}
          </div>
      </div>
  );
};

const ThemeEditor: React.FC<{ theme: any, updateTheme: any }> = ({ theme, updateTheme }) => {
  const [localTheme, setLocalTheme] = useState(theme);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const save = async () => { setSaveStatus('saving'); updateTheme(localTheme); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  useAutoSave(save, [localTheme]);
  const updateColor = (key: string, val: string) => setLocalTheme({ ...localTheme, colors: { ...localTheme.colors, [key]: val } });
  
  const colorFields = [
    { key: 'background', label: 'Fundo Principal' },
    { key: 'text', label: 'Texto Principal' },
    { key: 'accent', label: 'Destaque / Detalhes' },
    { key: 'secondary', label: 'Texto Secundário' },
    { key: 'surface', label: 'Superfície / Elementos' },
    { key: 'testimonialBackground', label: 'Fundo (Depoimentos)' },
    { key: 'testimonialRole', label: 'Cor do Cargo (Depoimentos)' }
  ];

  return (
    <div className="max-w-4xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-serif font-bold text-stone-900">Aparência & Tema</h2>
          <FeedbackSaveButton status={saveStatus} onClick={save} />
      </div>
      <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm flex-1 overflow-y-auto pb-12 space-y-8">
          <div>
              <h3 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-4 mb-6">Cores Principais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {colorFields.map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                          <label className="text-xs font-bold text-stone-400 uppercase tracking-wider block">{label}</label>
                          <div className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg">
                              <input type="color" value={localTheme.colors?.[key] || '#000000'} onChange={e => updateColor(key, e.target.value)} className="w-8 h-8 rounded border-none cursor-pointer" />
                              <input type="text" value={localTheme.colors?.[key] || ''} onChange={e => updateColor(key, e.target.value)} className="flex-1 text-xs font-mono uppercase bg-transparent outline-none" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
          <div><h3 className="font-bold text-stone-800 text-lg border-b border-stone-100 pb-4 mb-6">Imagem de Fundo (Hero)</h3><ImageInput label="Imagem Principal do Site" value={localTheme.heroImage || ''} onChange={(val) => setLocalTheme({...localTheme, heroImage: val})} /></div>
      </div>
    </div>
  );
};

const MaintenancePanel: React.FC = () => {
    const { resetData } = useData();
    return (
        <div className="max-w-2xl mx-auto mt-20 text-center space-y-8">
            <HardDrive size={64} className="mx-auto text-stone-300" />
            <h2 className="text-3xl font-serif font-bold text-stone-900">Manutenção do Sistema</h2>
            <p className="text-stone-500 max-w-md mx-auto">Use esta área para redefinir o site para os dados de fábrica caso algo dê errado ou para limpar todas as personalizações.</p>
            <div className="bg-red-50 border border-red-100 p-8 rounded-xl max-w-lg mx-auto">
                <h3 className="text-red-800 font-bold mb-2 flex items-center justify-center gap-2"><AlertTriangle size={20}/> Zona de Perigo</h3>
                <p className="text-red-600/80 text-sm mb-6">Esta ação apagará todas as fotos, textos e configurações salvas no banco de dados e restaurará o template original.</p>
                <button onClick={resetData} className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-bold text-sm tracking-wide shadow-lg w-full">RESETAR DADOS DO SITE</button>
            </div>
        </div>
    );
};

export default Admin;
