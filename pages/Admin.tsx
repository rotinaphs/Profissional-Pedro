
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useData, processImage } from '../context/DataContext';
import { initialData } from '../data';
import { Plus, Trash2, Save, LogOut, ChevronDown, ChevronRight, Settings, Image as ImageIcon, BookOpen, User, ArrowLeft, MessageSquareQuote, Upload, X, Check, Loader2, Layout, Lock, AlertTriangle, HardDrive, RefreshCw, Menu, RotateCcw, Target, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

// --- Utility: Upload Logic (Pure Function) ---
const uploadToStorage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) throw new Error('Apenas arquivos de imagem são permitidos.');

  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

  const { error } = await supabase.storage.from('portfolio-images').upload(fileName, file, { cacheControl: '3600', upsert: false });

  if (error) {
    console.error("Erro Supabase Storage:", error);
    if (error.message.includes('Bucket not found') || error.message.includes('row not found')) throw new Error('BUCKET_MISSING');
    throw error;
  }

  const { data } = supabase.storage.from('portfolio-images').getPublicUrl(fileName);
  return data.publicUrl;
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
       const msg = err.message === 'BUCKET_MISSING' 
         ? 'ERRO: Bucket não encontrado. Verifique o Supabase.' 
         : (err.message || 'Falha ao enviar imagem.');
       setError(msg);
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { isUploading, error, handleUpload, setError };
};

// --- Main Admin Component ---
const Admin: React.FC = () => {
  const { profile, albums, writings, testimonials, theme, home, updateProfile, updateAlbums, updateWritings, updateTestimonials, updateTheme, updateHome, resetData } = useData();
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
    const { error } = await supabase.auth.signInWithPassword(credentials);
    if (error) setLoginError(error.message === 'Invalid login credentials' ? 'Credenciais inválidas.' : 'Erro ao conectar.');
    setIsLoggingIn(false);
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsSidebarOpen(false); // Close sidebar on mobile when item clicked
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
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans text-stone-900 overflow-hidden">
      
      {/* Mobile Header */}
      <div className="md:hidden bg-[#1c1917] text-stone-100 p-4 flex items-center justify-between shadow-md z-30 sticky top-0">
         <span className="font-serif font-bold text-lg tracking-wide">Admin Painel</span>
         <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-stone-300 hover:text-white">
            <Menu size={24} />
         </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-[#1c1917] text-stone-400 p-8 flex flex-col h-full shadow-2xl transition-transform duration-300 ease-in-out
          md:relative md:translate-x-0 md:shadow-none
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="mb-12 flex justify-between items-start">
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
      <main className="flex-1 bg-white md:bg-stone-50 h-[calc(100vh-60px)] md:h-screen w-full overflow-hidden flex flex-col relative">
         <div className="flex-1 overflow-y-auto p-4 md:p-12 w-full max-w-[1600px] mx-auto">
            {activeTab === 'home' && <HomeEditor home={home} updateHome={updateHome} />}
            {activeTab === 'profile' && <ProfileEditor profile={profile} updateProfile={updateProfile} />}
            {activeTab === 'portfolio' && <PortfolioEditor albums={albums} updateAlbums={updateAlbums} />}
            {activeTab === 'writings' && <WritingsEditor writings={writings} updateWritings={updateWritings} />}
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
    <button onClick={onClick} disabled={isSaving} className={`relative flex items-center justify-center gap-2 px-8 py-3 rounded-lg transition-all duration-300 font-medium tracking-wide shadow-lg min-w-[180px] ${isSuccess ? 'bg-green-600 text-white' : 'bg-[#1c1917] text-white hover:bg-black'} ${className} ${isSaving ? 'opacity-80 cursor-not-allowed' : ''}`}>
      {isSaving ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : isSuccess ? <><Check size={18} /> Salvo!</> : <><Save size={18} className="hidden sm:inline" /> {label}</>}
    </button>
  );
};

// --- Optimized Image Input with Prominent Focal Point Picker ---
const ImageInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; className?: string; }> = ({ label, value, onChange, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const { isUploading, error, handleUpload } = useUpload();
  const { src, style } = processImage(value);

  // Extract position safely for the marker
  const posString = style.objectPosition?.toString() || '50% 50%';
  const [leftPos, topPos] = posString.split(' ');

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleUpload(e.target.files?.[0], (url) => {
        onChange(url);
        if (fileInputRef.current) fileInputRef.current.value = '';
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
      <div className="flex gap-4 items-start">
        <div className="relative group w-32 h-32 flex-shrink-0 bg-stone-100 rounded-lg border border-stone-200 overflow-hidden flex items-center justify-center cursor-crosshair">
          {isUploading ? <Loader2 className="animate-spin text-stone-400" size={24}/> : value ? (
            <>
                <img 
                    ref={imageRef}
                    src={src} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                    style={style}
                    onClick={onImageClick}
                    title="Clique para definir o ponto de foco"
                />
                {/* Prominent Focal Point Indicator (Target Style) */}
                <div 
                    className="absolute w-6 h-6 rounded-full border-2 border-white bg-red-500/60 shadow-md pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200 z-10"
                    style={{ left: leftPos, top: topPos }}
                >
                     <div className="w-1.5 h-1.5 bg-white rounded-full shadow-sm" />
                </div>
                
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                
                <button onClick={() => onChange('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:scale-110 pointer-events-auto"><X size={12} /></button>
            </>
          ) : <ImageIcon className="text-stone-300" size={32} />}
        </div>
        <div className="flex-1 space-y-3">
           <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={isUploading} className="bg-stone-200 text-stone-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-stone-300 transition-colors flex items-center gap-2 disabled:opacity-50">
                    <Upload size={14} /> {isUploading ? 'Enviando...' : 'Upload'}
                </button>
                <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept="image/*" />
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

// --- Optimized Photo Item Card with Prominent Focus ---
const PhotoItemEditor = React.memo(({ photo, albumId, updatePhoto, removePhoto }: { photo: any, albumId: string, updatePhoto: any, removePhoto: any }) => {
    const { isUploading, error, handleUpload } = useUpload();
    const imageRef = useRef<HTMLImageElement>(null);
    const { src, style } = processImage(photo.src);

    const posString = style.objectPosition?.toString() || '50% 50%';
    const [leftPos, topPos] = posString.split(' ');
  
    const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
       handleUpload(e.target.files?.[0], (url) => updatePhoto(albumId, photo.id, 'src', url));
    };

    const onImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (!imageRef.current || !photo.src) return;
        const rect = imageRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const separator = src.includes('?') ? '&' : '?';
        updatePhoto(albumId, photo.id, 'src', `${src}${separator}pos=${x.toFixed(0)},${y.toFixed(0)}`);
    };

    useEffect(() => {
        if (error) alert(error); 
    }, [error]);
  
    return (
      <div className="flex gap-4 items-start bg-stone-50 p-3 rounded-lg border border-stone-100">
         <div className="relative group w-20 h-20 flex-shrink-0 bg-stone-200 rounded overflow-hidden flex items-center justify-center cursor-crosshair">
             {isUploading ? (
                 <Loader2 className="animate-spin text-stone-400" />
             ) : (
                 <>
                    <img 
                        ref={imageRef}
                        src={src} 
                        className="w-full h-full object-cover" 
                        alt="thumb"
                        style={style}
                        onClick={onImageClick}
                        title="Clique para definir o ponto de foco"
                    />
                     {/* Prominent Focal Point Indicator (Small) */}
                    <div 
                        className="absolute w-4 h-4 rounded-full border border-white bg-red-500/60 shadow-sm pointer-events-none transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-200 z-10"
                        style={{ left: leftPos, top: topPos }}
                    >
                        <div className="w-1 h-1 bg-white rounded-full shadow-sm" />
                    </div>

                    <label className="absolute inset-0 flex items-end justify-end p-1 opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                       <div className="bg-black/50 text-white p-1 rounded pointer-events-auto cursor-pointer hover:bg-black/70">
                           <Upload size={12} />
                           <input type="file" className="hidden" accept="image/*" onChange={onUpload} disabled={isUploading} />
                       </div>
                    </label>
                 </>
             )}
         </div>
         <div className="flex-1 space-y-2">
            <input type="text" placeholder="URL da Imagem" value={photo.src} onChange={e => updatePhoto(albumId, photo.id, 'src', e.target.value)} className="w-full p-2 border border-stone-200 rounded text-xs" />
            <input type="text" placeholder="Legenda/Título" value={photo.caption || ''} onChange={e => updatePhoto(albumId, photo.id, 'caption', e.target.value)} className="w-full p-2 border border-stone-200 rounded text-xs" />
         </div>
         <button onClick={() => removePhoto(albumId, photo.id)} className="text-stone-400 hover:text-red-500 p-1"><XIcon /></button>
      </div>
    );
}, (prev, next) => {
    return prev.photo.src === next.photo.src && 
           prev.photo.caption === next.photo.caption && 
           prev.photo.id === next.photo.id;
});

// --- Editors ---

const HomeEditor: React.FC<{ home: any, updateHome: any }> = ({ home, updateHome }) => {
    const [localHome, setLocalHome] = useState(home);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const handleChange = (field: string, value: string) => setLocalHome({ ...localHome, [field]: value });
    const save = async () => { setSaveStatus('saving'); updateHome(localHome); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-stone-100">
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</label><input type="text" value={localProfile.contact.email} onChange={e => handleChange(e, 'contact', 'email')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Instagram</label><input type="text" value={localProfile.contact.instagram} onChange={e => handleChange(e, 'contact', 'instagram')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
          <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">LinkedIn</label><input type="text" value={localProfile.contact.linkedin} onChange={e => handleChange(e, 'contact', 'linkedin')} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
        </div>
        <div className="pt-4"><FeedbackSaveButton status={saveStatus} onClick={save} /></div>
      </div>
    </div>
  );
};

const PortfolioEditor: React.FC<{ albums: any[], updateAlbums: any }> = ({ albums, updateAlbums }) => {
  const [localAlbums, setLocalAlbums] = useState([...albums]);
  const [expandedAlbum, setExpandedAlbum] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const save = async () => { setSaveStatus('saving'); updateAlbums(localAlbums); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  
  // Use functional updates to prevent stale state issues with closures (especially important for removePhoto inside memoized components)
  const addAlbum = () => { 
    const newAlbum = { id: `new-album-${Date.now()}`, title: "Novo Álbum", description: "Descrição...", date: new Date().getFullYear().toString(), coverImage: "https://picsum.photos/800/600", photos: [] }; 
    setLocalAlbums(prev => [newAlbum, ...prev]); 
    setExpandedAlbum(newAlbum.id); 
  };
  
  const removeAlbum = (id: string) => { 
    if(window.confirm("Deletar álbum?")) {
      setLocalAlbums(prev => prev.filter(a => a.id !== id)); 
    }
  };
  
  const updateAlbumField = (id: string, field: string, value: string) => { 
    setLocalAlbums(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a)); 
  };
  
  const addPhoto = (albumId: string) => { 
    setLocalAlbums(prev => prev.map(a => { 
      if (a.id === albumId) { 
        return { ...a, photos: [...a.photos, { id: `p-${Date.now()}`, src: "https://picsum.photos/1200/800", alt: "Nova foto", caption: "" }] }; 
      } 
      return a; 
    })); 
  };
  
  const removePhoto = useCallback((albumId: string, photoId: string) => { 
    setLocalAlbums(prev => prev.map(a => { 
      if (a.id === albumId) { 
        return { ...a, photos: a.photos.filter((p: any) => p.id !== photoId) }; 
      } 
      return a; 
    })); 
  }, []);
  
  const updatePhoto = useCallback((albumId: string, photoId: string, field: string, value: string) => {
     setLocalAlbums(prev => prev.map(a => {
        if (a.id !== albumId) return a;
        return { ...a, photos: a.photos.map((p: any) => p.id === photoId ? { ...p, [field]: value } : p) };
     }));
  }, []);

  return (
    <div className="max-w-5xl h-full flex flex-col">
       <div className="flex justify-between items-center mb-8">
         <h2 className="text-3xl font-serif font-bold text-stone-900">Gerenciar Portfólio</h2>
         <div className="flex gap-3">
            <button onClick={addAlbum} className="bg-stone-200 text-stone-800 px-5 py-2.5 rounded-lg hover:bg-stone-300 flex items-center justify-center gap-2 transition-colors font-medium"><Plus size={18} /> Novo Álbum</button>
            <FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar Tudo" className="px-5 py-2.5 min-w-[150px]" />
         </div>
       </div>
       <div className="flex-1 overflow-y-auto space-y-4 pb-12">
         {localAlbums.map(album => (
           <div key={album.id} className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
             <div className="bg-stone-50 p-5 flex justify-between items-center cursor-pointer hover:bg-stone-100" onClick={() => setExpandedAlbum(expandedAlbum === album.id ? null : album.id)}>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-12 rounded bg-stone-300 overflow-hidden"><img src={processImage(album.coverImage).src} className="w-full h-full object-cover" style={processImage(album.coverImage).style} alt="cover" /></div>
                  <div><h3 className="font-bold text-stone-800 text-lg">{album.title}</h3><p className="text-xs text-stone-500 font-medium uppercase tracking-wider">{album.photos.length} FOTOS • {album.date}</p></div>
                </div>
                <div className="flex items-center gap-4"><button onClick={(e) => {e.stopPropagation(); removeAlbum(album.id)}} className="p-2 text-stone-400 hover:text-red-500"><Trash2 size={18}/></button>{expandedAlbum === album.id ? <ChevronDown size={20} className="text-stone-400"/> : <ChevronRight size={20} className="text-stone-400"/>}</div>
             </div>
             {expandedAlbum === album.id && (
               <div className="p-8 border-t border-stone-100 bg-white">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Título</label><input type="text" value={album.title} onChange={e => updateAlbumField(album.id, 'title', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Data</label><input type="text" value={album.date} onChange={e => updateAlbumField(album.id, 'date', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg" /></div>
                    <div className="col-span-2 space-y-2"><ImageInput label="Capa do Álbum" value={album.coverImage} onChange={(val) => updateAlbumField(album.id, 'coverImage', val)} /></div>
                    <div className="col-span-2 space-y-2"><label className="text-xs font-bold text-stone-400 uppercase tracking-wider">Descrição</label><textarea value={album.description} onChange={e => updateAlbumField(album.id, 'description', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg h-24 resize-none" /></div>
                 </div>
                 <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-2"><h4 className="font-bold text-sm text-stone-500 uppercase tracking-widest">Galeria</h4><button onClick={() => addPhoto(album.id)} className="text-xs font-bold text-stone-900 hover:text-stone-600 uppercase tracking-wider flex items-center gap-1">+ Adicionar Foto</button></div>
                 <div className="space-y-3">
                    {album.photos.map((photo: any) => (
                        <PhotoItemEditor 
                            key={photo.id} 
                            photo={photo} 
                            albumId={album.id} 
                            updatePhoto={updatePhoto} 
                            removePhoto={removePhoto} 
                        />
                    ))}
                 </div>
               </div>
             )}
           </div>
         ))}
       </div>
    </div>
  );
};

const WritingsEditor: React.FC<{ writings: any[], updateWritings: any }> = ({ writings, updateWritings }) => {
  const [localWritings, setLocalWritings] = useState([...writings]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const save = async () => { setSaveStatus('saving'); updateWritings(localWritings); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  const addWriting = () => { const newWork = { id: `text-${Date.now()}`, title: "Novo Texto", category: "Crônica", date: new Date().toLocaleDateString('pt-BR'), excerpt: "Resumo...", content: "<p>Conteúdo...</p>", coverImage: "" }; setLocalWritings([newWork, ...localWritings]); setEditingId(newWork.id); };
  const removeWriting = (id: string) => { if(window.confirm("Apagar?")) { setLocalWritings(localWritings.filter(w => w.id !== id)); if(editingId === id) setEditingId(null); } }
  const updateWritingField = (id: string, field: string, value: string) => { setLocalWritings(localWritings.map(w => w.id === id ? { ...w, [field]: value } : w)); };
  const currentEdit = localWritings.find(w => w.id === editingId);

  return (
    <div className="flex flex-col h-full">
       <div className="flex justify-between items-center mb-8 flex-shrink-0">
         <h2 className="text-3xl font-serif font-bold text-stone-900">Escritos</h2>
         <div className="flex gap-3">
            <button onClick={addWriting} className="bg-stone-200 text-stone-800 px-5 py-2.5 rounded-lg hover:bg-stone-300 flex items-center justify-center gap-2 transition-colors font-medium"><Plus size={18} /> Novo Texto</button>
            <FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar Tudo" className="px-5 py-2.5 min-w-[150px]" />
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
           <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
              {localWritings.map(w => (<div key={w.id} onClick={() => setEditingId(w.id)} className={`p-6 rounded-xl cursor-pointer border transition-all duration-300 ${editingId === w.id ? 'bg-[#1c1917] text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white border-stone-100 hover:border-stone-300'}`}><h3 className="font-serif text-lg font-bold mb-2 line-clamp-1">{w.title}</h3><p className={`text-[10px] uppercase tracking-widest font-medium ${editingId === w.id ? 'text-stone-400' : 'text-stone-500'}`}>{w.category} • {w.date}</p></div>))}
           </div>
           <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden relative">
             {currentEdit ? (
               <div className="flex flex-col h-full">
                 <div className="p-8 border-b border-stone-100 space-y-6">
                     <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">EDITANDO</span><div className="flex items-center gap-4"><button onClick={() => removeWriting(currentEdit.id)} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-2 uppercase tracking-wider font-bold"><Trash2 size={16}/> Apagar</button></div></div>
                     <input type="text" value={currentEdit.title} onChange={e => updateWritingField(currentEdit.id, 'title', e.target.value)} className="w-full text-4xl font-serif font-bold text-stone-900 placeholder-stone-300 outline-none bg-transparent" placeholder="Título" />
                 </div>
                 <div className="flex-1 overflow-y-auto p-8 space-y-8">
                     <div className="grid grid-cols-2 gap-8">
                       <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Categoria</label><input type="text" value={currentEdit.category} onChange={e => updateWritingField(currentEdit.id, 'category', e.target.value)} className="w-full p-4 border border-stone-200 rounded-lg" /></div>
                       <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Data</label><input type="text" value={currentEdit.date} onChange={e => updateWritingField(currentEdit.id, 'date', e.target.value)} className="w-full p-4 border border-stone-200 rounded-lg" /></div>
                     </div>
                     <ImageInput label="Capa" value={currentEdit.coverImage || ''} onChange={(val) => updateWritingField(currentEdit.id, 'coverImage', val)} />
                     <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Resumo</label><textarea value={currentEdit.excerpt} onChange={e => updateWritingField(currentEdit.id, 'excerpt', e.target.value)} className="w-full p-4 border border-stone-200 rounded-lg h-32 resize-none" /></div>
                     <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Conteúdo (HTML)</label><textarea value={currentEdit.content} onChange={e => updateWritingField(currentEdit.id, 'content', e.target.value)} className="w-full p-4 border border-stone-200 rounded-lg font-mono text-sm h-80 bg-stone-50" /></div>
                 </div>
               </div>
             ) : <div className="flex flex-col items-center justify-center h-full text-stone-400"><BookOpen size={64} strokeWidth={0.5} className="mb-6 opacity-20 text-stone-900"/><p className="text-xl font-serif text-stone-400">Selecione um texto</p></div>}
           </div>
       </div>
    </div>
  );
};

const TestimonialsEditor: React.FC<{ testimonials: any[], updateTestimonials: any }> = ({ testimonials, updateTestimonials }) => {
  const [localTestimonials, setLocalTestimonials] = useState([...testimonials]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const save = async () => { setSaveStatus('saving'); updateTestimonials(localTestimonials); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  const addTestimonial = () => { const newTestimonial = { id: `t-${Date.now()}`, name: "Nome", role: "Cargo", text: "Depoimento...", avatar: "" }; setLocalTestimonials([newTestimonial, ...localTestimonials]); setEditingId(newTestimonial.id); };
  const removeTestimonial = (id: string) => { if(window.confirm("Apagar?")) { setLocalTestimonials(localTestimonials.filter(t => t.id !== id)); if(editingId === id) setEditingId(null); } }
  const updateField = (id: string, field: string, value: string) => { setLocalTestimonials(localTestimonials.map(t => t.id === id ? { ...t, [field]: value } : t)); };
  const currentEdit = localTestimonials.find(t => t.id === editingId);

  return (
    <div className="flex flex-col h-full">
       <div className="flex justify-between items-center mb-8 flex-shrink-0">
         <h2 className="text-3xl font-serif font-bold text-stone-900">Depoimentos</h2>
         <div className="flex gap-3">
            <button onClick={addTestimonial} className="bg-stone-200 text-stone-800 px-5 py-2.5 rounded-lg hover:bg-stone-300 flex items-center justify-center gap-2 transition-colors font-medium"><Plus size={18} /> Novo</button>
            <FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar Tudo" className="px-5 py-2.5 min-w-[150px]" />
         </div>
       </div>

       <div className="flex flex-col md:flex-row gap-8 flex-1 overflow-hidden">
           <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
              {localTestimonials.map(t => (<div key={t.id} onClick={() => setEditingId(t.id)} className={`p-4 rounded-xl cursor-pointer border flex items-center gap-4 ${editingId === t.id ? 'bg-[#1c1917] text-white' : 'bg-white border-stone-100 hover:border-stone-300'}`}><img src={processImage(t.avatar).src} style={processImage(t.avatar).style} className="w-10 h-10 rounded-full object-cover" /><div><h3 className="font-bold text-sm">{t.name}</h3></div></div>))}
           </div>
           <div className="w-full md:w-2/3 bg-white rounded-2xl shadow-sm border border-stone-200 flex flex-col overflow-hidden relative">
             {currentEdit ? (
               <div className="flex flex-col h-full">
                 <div className="p-8 border-b border-stone-100 space-y-6">
                     <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">EDITANDO</span><button onClick={() => removeTestimonial(currentEdit.id)} className="text-red-400"><Trash2 size={16}/> Apagar</button></div>
                     <input type="text" value={currentEdit.name} onChange={e => updateField(currentEdit.id, 'name', e.target.value)} className="w-full text-3xl font-serif font-bold" placeholder="Nome" />
                 </div>
                 <div className="flex-1 overflow-y-auto p-8 space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Cargo</label><input type="text" value={currentEdit.role || ''} onChange={e => updateField(currentEdit.id, 'role', e.target.value)} className="w-full p-4 border border-stone-200 rounded-lg" /></div>
                       <ImageInput label="Foto" value={currentEdit.avatar} onChange={(val) => updateField(currentEdit.id, 'avatar', val)} />
                     </div>
                     <div className="space-y-2"><label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Depoimento</label><textarea value={currentEdit.text} onChange={e => updateField(currentEdit.id, 'text', e.target.value)} className="w-full p-4 border border-stone-200 rounded-lg h-60" /></div>
                 </div>
               </div>
             ) : <div className="flex flex-col items-center justify-center h-full text-stone-400"><MessageSquareQuote size={64} className="mb-6 opacity-20"/><p>Selecione um depoimento</p></div>}
           </div>
       </div>
    </div>
  );
};

const ThemeEditor: React.FC<{ theme: any, updateTheme: any }> = ({ theme, updateTheme }) => {
  const [localTheme, setLocalTheme] = useState(theme);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  const save = async () => { setSaveStatus('saving'); updateTheme(localTheme); await new Promise(r => setTimeout(r, 800)); setSaveStatus('success'); setTimeout(() => setSaveStatus('idle'), 3000); };
  
  const updateColor = (key: string, value: string) => setLocalTheme({ ...localTheme, colors: { ...localTheme.colors, [key]: value }});
  const updateFont = (key: string, value: string) => setLocalTheme({ ...localTheme, fonts: { ...localTheme.fonts, [key]: value }});
  const updateElementStyle = (element: string, field: string, value: string) => {
     setLocalTheme({
        ...localTheme,
        elementStyles: {
           ...localTheme.elementStyles,
           [element]: {
              ...localTheme.elementStyles?.[element],
              [field]: value
           }
        }
     });
  };

  const resetToDefaults = () => {
    if (window.confirm("Tem certeza que deseja restaurar a aparência padrão? Isso substituirá todas as cores, fontes e estilos atuais.")) {
      setLocalTheme(initialData.theme);
    }
  };

  return (
    <div className="max-w-2xl h-full flex flex-col">
      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Aparência do Site</h2>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8 flex-1 overflow-y-auto pb-20">
        <div>
          <h3 className="font-bold text-stone-800 mb-6 text-lg">Cores Globais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(localTheme.colors).map(([key, val]: any) => (
                <div key={key} className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">
                      {key === 'testimonialBackground' ? 'Fundo Depoimentos' : 
                       key === 'testimonialRole' ? 'Cor Cargo (Depoim.)' : key}
                    </label>
                    <div className="flex gap-4 items-center"><input type="color" value={val} onChange={e => updateColor(key, e.target.value)} className="h-12 w-12 cursor-pointer border-2 border-stone-100 rounded-lg p-1" /><input type="text" value={val} onChange={e => updateColor(key, e.target.value)} className="flex-1 p-3 border border-stone-200 rounded-lg uppercase font-mono text-sm" /></div>
                </div>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100">
          <h3 className="font-bold text-stone-800 mb-6 text-lg">Tipografia Base</h3>
          <div className="space-y-6">
             <div className="space-y-2"><label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Serif</label><input type="text" value={localTheme.fonts.serif} onChange={e => updateFont('serif', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg font-mono text-sm" /></div>
             <div className="space-y-2"><label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Sans</label><input type="text" value={localTheme.fonts.sans} onChange={e => updateFont('sans', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg font-mono text-sm" /></div>
          </div>
        </div>

        {/* New Section: Element Styles */}
        <div className="pt-8 border-t border-stone-100">
          <h3 className="font-bold text-stone-800 mb-6 text-lg">Estilos de Elementos</h3>
          <div className="space-y-8">
            {['title', 'subtitle', 'text', 'caption'].map((elem) => (
                <div key={elem} className="p-4 bg-stone-50 rounded-lg border border-stone-100">
                    <h4 className="font-bold text-sm uppercase tracking-widest text-stone-600 mb-4">{elem === 'title' ? 'Títulos Principais' : elem === 'subtitle' ? 'Subtítulos / Datas' : elem === 'caption' ? 'Legendas / Overlays' : 'Textos / Corpo'}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold">Fonte</label>
                            <input 
                                type="text" 
                                value={localTheme.elementStyles?.[elem]?.font || ''} 
                                onChange={e => updateElementStyle(elem, 'font', e.target.value)} 
                                className="w-full p-2 border border-stone-200 rounded text-sm font-mono placeholder-stone-300"
                                placeholder='Ex: "Inter", sans-serif'
                            />
                        </div>
                        <div className="space-y-2">
                             <label className="block text-[10px] uppercase tracking-wider text-stone-400 font-bold">Cor</label>
                             <div className="flex gap-2 items-center">
                                <input type="color" value={localTheme.elementStyles?.[elem]?.color || '#000000'} onChange={e => updateElementStyle(elem, 'color', e.target.value)} className="h-9 w-9 p-0.5 border border-stone-200 rounded cursor-pointer" />
                                <input type="text" value={localTheme.elementStyles?.[elem]?.color || ''} onChange={e => updateElementStyle(elem, 'color', e.target.value)} className="flex-1 p-2 border border-stone-200 rounded text-sm font-mono uppercase" />
                             </div>
                        </div>
                    </div>
                </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-stone-100">
           <h3 className="font-bold text-stone-800 mb-6 text-lg">Imagem de Capa (Home)</h3>
           <ImageInput label="Hero Image" value={localTheme.heroImage || ''} onChange={(val) => setLocalTheme({...localTheme, heroImage: val})} />
        </div>
        <div className="pt-8 flex gap-4">
           <button 
              onClick={resetToDefaults}
              className="px-6 py-3 rounded-lg border border-stone-200 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-100 hover:text-stone-900 transition-colors flex items-center gap-2"
           >
              <RotateCcw size={16} /> Restaurar Padrões
           </button>
           <FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar & Aplicar" className="flex-1 h-14" />
        </div>
      </div>
    </div>
  );
};

const MaintenancePanel: React.FC = () => {
    const { profile, albums, writings, testimonials, theme } = useData();
    const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'done'>('idle');
    const [orphanedImages, setOrphanedImages] = useState<any[]>([]);
    const [selectedOrphans, setSelectedOrphans] = useState<string[]>([]);
    const [deleting, setDeleting] = useState(false);

    const scanImages = async () => {
        setScanStatus('scanning');
        setOrphanedImages([]);
        setSelectedOrphans([]);
        
        // 1. Coletar todas as URLs usadas
        const usedUrls = new Set<string>();
        
        // Perfil
        if (profile.profileImage) usedUrls.add(processImage(profile.profileImage).src);
        
        // Tema
        if (theme.heroImage) usedUrls.add(processImage(theme.heroImage).src);
        
        // Álbuns
        albums.forEach(album => {
            if (album.coverImage) usedUrls.add(processImage(album.coverImage).src);
            album.photos.forEach(photo => usedUrls.add(processImage(photo.src).src));
        });

        // Escritos
        writings.forEach(writing => {
            if (writing.coverImage) usedUrls.add(processImage(writing.coverImage).src);
            // Regex simples para extrair URLs de imagens dentro do HTML do content
            const imgRegex = /src="([^"]+)"/g;
            let match;
            while ((match = imgRegex.exec(writing.content)) !== null) {
                // Tenta extrair src puro se houver parâmetros
                usedUrls.add(processImage(match[1]).src);
            }
        });

        // Depoimentos
        testimonials.forEach(testimonial => {
            if (testimonial.avatar) usedUrls.add(processImage(testimonial.avatar).src);
        });

        // 2. Listar arquivos do Storage
        try {
            const { data: files, error } = await supabase.storage.from('portfolio-images').list('', { limit: 1000 });
            if (error) throw error;
            if (!files) {
                setScanStatus('done');
                return;
            }

            // 3. Filtrar órfãos
            const orphans = files.filter(file => {
                // Verificamos se o nome do arquivo aparece em alguma das URLs usadas
                return !Array.from(usedUrls).some(url => url.includes(file.name));
            });

            setOrphanedImages(orphans);
        } catch (e) {
            console.error("Erro ao escanear imagens:", e);
            alert("Erro ao conectar com o Storage.");
        } finally {
            setScanStatus('done');
        }
    };

    const toggleSelect = (name: string) => {
        if (selectedOrphans.includes(name)) {
            setSelectedOrphans(selectedOrphans.filter(n => n !== name));
        } else {
            setSelectedOrphans([...selectedOrphans, name]);
        }
    };

    const deleteSelected = async () => {
        if (!window.confirm(`Tem certeza que deseja apagar ${selectedOrphans.length} imagens? Esta ação não pode ser desfeita.`)) return;

        setDeleting(true);
        try {
            const { error } = await supabase.storage.from('portfolio-images').remove(selectedOrphans);
            if (error) throw error;
            
            // Atualizar lista
            setOrphanedImages(orphanedImages.filter(img => !selectedOrphans.includes(img.name)));
            setSelectedOrphans([]);
            alert("Imagens apagadas com sucesso.");
        } catch (e) {
            console.error("Erro ao apagar:", e);
            alert("Erro ao apagar imagens.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl h-full flex flex-col">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Manutenção do Sistema</h2>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex-1 overflow-y-auto">
                {/* Description and Scan button */}
                <div className="flex flex-col items-start gap-6 mb-8 border-b border-stone-100 pb-8">
                     <p className="text-stone-500 text-sm leading-relaxed max-w-2xl">
                        Identifique arquivos de imagem que estão salvos no servidor mas não estão sendo utilizados em nenhum lugar do site (álbuns, textos, perfil, etc.). Isso ajuda a economizar espaço e manter a organização.
                    </p>
                    <button 
                        onClick={scanImages} 
                        disabled={scanStatus === 'scanning'}
                        className="bg-stone-900 text-white px-6 py-4 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-stone-800 transition-colors flex items-center gap-3 disabled:opacity-50 shadow-lg"
                    >
                        {scanStatus === 'scanning' ? <Loader2 className="animate-spin" size={18}/> : <RefreshCw size={18}/>}
                        {scanStatus === 'scanning' ? 'Verificando...' : 'Escanear Imagens Órfãs'}
                    </button>
                </div>

                {/* Results Section */}
                {scanStatus === 'done' && (
                    <div className="animate-fade-in">
                        <div className="flex items-center justify-between mb-6">
                            <h4 className="font-bold text-stone-600 text-sm flex items-center gap-3 uppercase tracking-wider">
                                {orphanedImages.length === 0 ? <Check className="text-green-500" size={20}/> : <AlertTriangle className="text-amber-500" size={20}/>}
                                {orphanedImages.length} Arquivos não utilizados encontrados
                            </h4>
                            {orphanedImages.length > 0 && (
                                <button 
                                    onClick={deleteSelected}
                                    disabled={selectedOrphans.length === 0 || deleting}
                                    className="text-red-500 hover:text-red-700 font-bold text-xs uppercase tracking-wider flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                >
                                    {deleting ? <Loader2 className="animate-spin" size={16}/> : <Trash2 size={16}/>}
                                    Apagar Selecionados ({selectedOrphans.length})
                                </button>
                            )}
                        </div>

                        {orphanedImages.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {orphanedImages.map(img => (
                                    <div 
                                        key={img.name} 
                                        onClick={() => toggleSelect(img.name)}
                                        className={`relative group cursor-pointer rounded-xl overflow-hidden transition-all aspect-square border-2 ${selectedOrphans.includes(img.name) ? 'border-red-500 shadow-md' : 'border-stone-100 hover:border-stone-300'}`}
                                    >
                                        <img 
                                            src={`https://raweqyxkahiwrewxarka.supabase.co/storage/v1/object/public/portfolio-images/${img.name}`} 
                                            className={`w-full h-full object-cover transition-all duration-300 ${selectedOrphans.includes(img.name) ? 'opacity-50 grayscale' : 'group-hover:opacity-90'}`}
                                            alt="orphan"
                                            loading="lazy"
                                        />
                                        
                                        {/* Overlay Icon */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            {selectedOrphans.includes(img.name) && (
                                                <div className="bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg animate-fade-in transform scale-100">
                                                    <Trash2 size={24}/>
                                                </div>
                                            )}
                                        </div>

                                        {/* Metadata Footer */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm text-white text-[10px] py-1.5 px-2 truncate text-center font-mono tracking-wide">
                                            {(img.metadata?.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-200 text-stone-400">
                                <Check size={48} className="mx-auto mb-4 text-green-200" />
                                <p>Tudo limpo! Nenhuma imagem órfã detectada.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

export default Admin;
