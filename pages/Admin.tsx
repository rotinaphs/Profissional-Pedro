import React, { useState, useRef, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Trash2, Save, LogOut, ChevronDown, ChevronRight, Settings, Image as ImageIcon, BookOpen, User, ArrowLeft, ArrowRight, MessageSquareQuote, Upload, X, Check, Loader2, Layout, Lock, Database, AlertTriangle, Terminal, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabase';

// --- Helper Function: Upload to Supabase ---
const uploadToStorage = async (file: File): Promise<string> => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Apenas arquivos de imagem são permitidos.');
  }

  // Sanitizar nome do arquivo
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = fileName;

  const { error } = await supabase.storage
    .from('portfolio-images')
    .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
    });

  if (error) {
    console.error("Erro Supabase Storage:", error);
    if (error.message.includes('Bucket not found') || error.message.includes('row not found')) {
        throw new Error('BUCKET_MISSING');
    }
    throw error;
  }

  const { data } = supabase.storage
    .from('portfolio-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

const Admin: React.FC = () => {
  const { profile, albums, writings, testimonials, theme, home, updateProfile, updateAlbums, updateWritings, updateTestimonials, updateTheme, updateHome, resetData } = useData();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'home' | 'profile' | 'portfolio' | 'writings' | 'testimonials' | 'theme' | 'setup'>('home');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setLoginError(error.message === 'Invalid login credentials' ? 'Email ou senha incorretos.' : 'Erro ao conectar.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
     return <div className="min-h-screen bg-stone-50 flex items-center justify-center"><Loader2 className="animate-spin text-stone-900" size={32} /></div>;
  }

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
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" required />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Senha</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-3 border border-stone-300 rounded-lg" required />
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
    <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans text-stone-900">
      <aside className="w-full md:w-72 bg-[#1c1917] text-stone-400 p-8 flex-shrink-0 flex flex-col min-h-screen fixed md:relative z-10">
        <div className="mb-12">
          <h2 className="text-2xl font-serif font-bold text-stone-100 mb-2">Admin Painel</h2>
          <p className="text-[10px] uppercase tracking-[0.2em] text-stone-500">{session.user.email}</p>
        </div>
        <nav className="space-y-4 flex-1 overflow-y-auto pr-2">
           <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Layout size={20} />} label="Página Inicial" />
           <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={<User size={20} />} label="Perfil & Bio" />
           <NavButton active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} icon={<ImageIcon size={20} />} label="Portfólio" />
           <NavButton active={activeTab === 'writings'} onClick={() => setActiveTab('writings')} icon={<BookOpen size={20} />} label="Escritos" />
           <NavButton active={activeTab === 'testimonials'} onClick={() => setActiveTab('testimonials')} icon={<MessageSquareQuote size={20} />} label="Depoimentos" />
           <NavButton active={activeTab === 'theme'} onClick={() => setActiveTab('theme')} icon={<Settings size={20} />} label="Aparência" />
           <div className="border-t border-stone-800 my-4 pt-4">
             <NavButton active={activeTab === 'setup'} onClick={() => setActiveTab('setup')} icon={<Database size={20} />} label="Sistema" />
           </div>
        </nav>
        <div className="mt-auto pt-8 border-t border-stone-800/50 space-y-6">
          <Link to="/" className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors text-sm group"><ArrowLeft size={18} /> Ver Site</Link>
          <button onClick={handleLogout} className="flex items-center gap-3 text-red-400 hover:text-red-300 transition-colors text-sm w-full text-left"><LogOut size={18} /> Sair</button>
          <button onClick={resetData} className="text-xs text-stone-600 hover:text-stone-400 underline w-full text-left">Resetar tudo</button>
        </div>
      </aside>
      <main className="flex-1 bg-white md:bg-stone-50 overflow-y-auto h-screen w-full">
         <div className="p-6 md:p-12 h-full max-w-[1600px] mx-auto">
            {activeTab === 'home' && <HomeEditor home={home} updateHome={updateHome} />}
            {activeTab === 'profile' && <ProfileEditor profile={profile} updateProfile={updateProfile} />}
            {activeTab === 'portfolio' && <PortfolioEditor albums={albums} updateAlbums={updateAlbums} />}
            {activeTab === 'writings' && <WritingsEditor writings={writings} updateWritings={updateWritings} />}
            {activeTab === 'testimonials' && <TestimonialsEditor testimonials={testimonials} updateTestimonials={updateTestimonials} />}
            {activeTab === 'theme' && <ThemeEditor theme={theme} updateTheme={updateTheme} />}
            {activeTab === 'setup' && <SetupPanel />}
         </div>
      </main>
    </div>
  );
};

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

// --- Reusable Image Upload Component ---
const ImageInput: React.FC<{ label: string; value: string; onChange: (val: string) => void; className?: string; }> = ({ label, value, onChange, className }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg('');
    try {
      const url = await uploadToStorage(file);
      onChange(url);
    } catch (error: any) {
      if (error.message === 'BUCKET_MISSING') {
         setErrorMsg('ERRO: Bucket não encontrado. Vá para a aba "Sistema" para corrigir.');
      } else {
         setErrorMsg(error.message || 'Falha ao enviar imagem.');
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">{label}</label>
      <div className="flex gap-4 items-start">
        <div className="relative group w-24 h-24 flex-shrink-0 bg-stone-100 rounded-lg border border-stone-200 overflow-hidden flex items-center justify-center">
          {uploading ? <Loader2 className="animate-spin text-stone-400" size={24}/> : value ? <><img src={value} alt="Preview" className="w-full h-full object-cover" /><button onClick={() => onChange('')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button></> : <ImageIcon className="text-stone-300" size={32} />}
        </div>
        <div className="flex-1 space-y-3">
           <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="bg-stone-200 text-stone-700 px-4 py-2 rounded text-xs font-bold uppercase tracking-wide hover:bg-stone-300 transition-colors flex items-center gap-2 disabled:opacity-50">
                    <Upload size={14} /> {uploading ? 'Enviando...' : 'Upload Alta Resolução'}
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>
              {errorMsg && (
                  <div className="flex items-center gap-2 text-xs text-red-500 font-bold bg-red-50 p-2 rounded">
                      <AlertTriangle size={14} /> {errorMsg}
                  </div>
              )}
           </div>
           <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg text-xs outline-none" placeholder="Ou cole URL..." />
        </div>
      </div>
    </div>
  );
};

// --- Component to handle individual Photo Uploads in Gallery ---
const PhotoItemEditor: React.FC<{ photo: any, albumId: string, updatePhoto: any, removePhoto: any }> = ({ photo, albumId, updatePhoto, removePhoto }) => {
    const [uploading, setUploading] = useState(false);
  
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadToStorage(file);
        updatePhoto(albumId, photo.id, 'src', url);
      } catch (error: any) {
        if (error.message === 'BUCKET_MISSING') {
            alert('ERRO: Bucket de imagens não existe. Vá para a aba "Sistema" no menu lateral para corrigir isso automaticamente.');
        } else {
            alert(error.message || 'Erro ao enviar imagem.');
        }
      } finally {
        setUploading(false);
      }
    };
  
    return (
      <div className="flex gap-4 items-start bg-stone-50 p-3 rounded-lg border border-stone-100">
         <div className="relative group w-20 h-20 flex-shrink-0 bg-stone-200 rounded overflow-hidden flex items-center justify-center">
             {uploading ? (
                 <Loader2 className="animate-spin text-stone-400" />
             ) : (
                 <>
                    <img src={photo.src} className="w-full h-full object-cover" alt="thumb" />
                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                       <Upload className="text-white" size={16} />
                       <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
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
};

// --- Setup Panel for Infrastructure Fixes ---
const SetupPanel: React.FC = () => {
    const [status, setStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');
    const [errorDetails, setErrorDetails] = useState('');

    const checkAndFixBucket = async () => {
        setStatus('checking');
        try {
            // Tenta criar o bucket
            const { data, error } = await supabase.storage.createBucket('portfolio-images', {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/*']
            });

            if (error) {
                // Se o erro for "Duplicate", significa que já existe, mas talvez falte policy
                if (error.message.includes('already exists')) {
                    setStatus('success');
                } else {
                    throw error;
                }
            } else {
                setStatus('success');
            }
        } catch (e: any) {
            console.error(e);
            setStatus('error');
            setErrorDetails(e.message || 'Erro desconhecido');
        }
    };

    const sqlScript = `
-- 1. Cria o bucket público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Permite acesso público para visualizar imagens
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING ( bucket_id = 'portfolio-images' );

-- 3. Permite upload apenas para usuários logados
CREATE POLICY "Auth Upload" ON storage.objects FOR INSERT 
TO authenticated WITH CHECK ( bucket_id = 'portfolio-images' );

-- 4. Permite editar/deletar apenas para usuários logados
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE 
TO authenticated USING ( bucket_id = 'portfolio-images' );

CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE 
TO authenticated USING ( bucket_id = 'portfolio-images' );
    `.trim();

    return (
        <div className="max-w-4xl h-full flex flex-col">
            <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Diagnóstico de Sistema</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex-1 overflow-y-auto">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" />
                        <div>
                            <h3 className="text-lg font-bold text-amber-800 mb-2">Configuração de Armazenamento</h3>
                            <p className="text-amber-700 text-sm mb-4 leading-relaxed">
                                Se você está vendo erros como "Bucket not found" ao tentar fazer upload de imagens, 
                                é porque o espaço de armazenamento na nuvem (Supabase Storage) ainda não foi criado.
                            </p>
                            
                            {status === 'idle' && (
                                <button 
                                    onClick={checkAndFixBucket}
                                    className="bg-amber-600 text-white px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-amber-700 transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <Database size={16} /> Tentar Corrigir Automaticamente
                                </button>
                            )}

                            {status === 'checking' && <p className="text-stone-500 font-bold flex items-center gap-2"><Loader2 className="animate-spin"/> Verificando...</p>}
                            
                            {status === 'success' && (
                                <div className="bg-green-100 text-green-800 p-4 rounded font-bold flex items-center gap-2">
                                    <Check /> Sucesso! O bucket "portfolio-images" deve estar ativo. Tente fazer upload novamente.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SQL Fallback */}
                {(status === 'error' || status === 'idle') && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-stone-800 flex items-center gap-2">
                            <Terminal size={20} /> Correção Manual (Garantida)
                        </h3>
                        <p className="text-sm text-stone-500">
                            Se a correção automática falhou (provavelmente por falta de permissão de administrador na API), 
                            copie o código abaixo e execute no <strong>SQL Editor</strong> do seu painel Supabase.
                        </p>
                        
                        <div className="relative bg-stone-900 rounded-lg p-6 overflow-x-auto group">
                            <pre className="text-stone-300 font-mono text-xs leading-relaxed whitespace-pre">
                                {sqlScript}
                            </pre>
                            <button 
                                onClick={() => navigator.clipboard.writeText(sqlScript)}
                                className="absolute top-4 right-4 bg-stone-700 text-white p-2 rounded hover:bg-stone-600 transition-colors"
                                title="Copiar SQL"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        
                        {status === 'error' && (
                             <p className="text-xs text-red-500 font-mono mt-2">Erro técnico: {errorDetails}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

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
  const addAlbum = () => { const newAlbum = { id: `new-album-${Date.now()}`, title: "Novo Álbum", description: "Descrição...", date: new Date().getFullYear().toString(), coverImage: "https://picsum.photos/800/600", photos: [] }; setLocalAlbums([newAlbum, ...localAlbums]); setExpandedAlbum(newAlbum.id); };
  const removeAlbum = (id: string) => { if(window.confirm("Deletar álbum?")) setLocalAlbums(localAlbums.filter(a => a.id !== id)); };
  const updateAlbumField = (id: string, field: string, value: string) => { setLocalAlbums(localAlbums.map(a => a.id === id ? { ...a, [field]: value } : a)); };
  const addPhoto = (albumId: string) => { setLocalAlbums(localAlbums.map(a => { if (a.id === albumId) { return { ...a, photos: [...a.photos, { id: `p-${Date.now()}`, src: "https://picsum.photos/1200/800", alt: "Nova foto", caption: "" }] }; } return a; })); };
  const removePhoto = (albumId: string, photoId: string) => { setLocalAlbums(localAlbums.map(a => { if (a.id === albumId) { return { ...a, photos: a.photos.filter((p: any) => p.id !== photoId) }; } return a; })); };
  const updatePhoto = (albumId: string, photoId: string, field: string, value: string) => { setLocalAlbums(localAlbums.map(a => { if (a.id === albumId) { return { ...a, photos: a.photos.map((p: any) => p.id === photoId ? { ...p, [field]: value } : p) }; } return a; })); };

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
                  <div className="w-16 h-12 rounded bg-stone-300 overflow-hidden"><img src={album.coverImage} className="w-full h-full object-cover" alt="cover" /></div>
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
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-6rem)]">
       <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="flex justify-between items-center px-1"><h2 className="text-2xl font-serif font-bold text-stone-900">Escritos</h2><button onClick={addWriting} className="w-10 h-10 flex items-center justify-center bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors text-stone-700"><Plus size={20}/></button></div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">{localWritings.map(w => (<div key={w.id} onClick={() => setEditingId(w.id)} className={`p-6 rounded-xl cursor-pointer border transition-all duration-300 ${editingId === w.id ? 'bg-[#1c1917] text-white border-transparent shadow-xl scale-[1.02]' : 'bg-white border-stone-100 hover:border-stone-300'}`}><h3 className="font-serif text-lg font-bold mb-2 line-clamp-1">{w.title}</h3><p className={`text-[10px] uppercase tracking-widest font-medium ${editingId === w.id ? 'text-stone-400' : 'text-stone-500'}`}>{w.category} • {w.date}</p></div>))}</div>
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
             <div className="p-6 bg-stone-50 border-t border-stone-100"><FeedbackSaveButton status={saveStatus} onClick={save} className="w-full" /></div>
           </div>
         ) : <div className="flex flex-col items-center justify-center h-full text-stone-400"><BookOpen size={64} strokeWidth={0.5} className="mb-6 opacity-20 text-stone-900"/><p className="text-xl font-serif text-stone-400">Selecione um texto</p></div>}
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
    <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-6rem)]">
       <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="flex justify-between items-center px-1"><h2 className="text-2xl font-serif font-bold text-stone-900">Depoimentos</h2><button onClick={addTestimonial} className="w-10 h-10 flex items-center justify-center bg-stone-200 rounded-lg hover:bg-stone-300 transition-colors text-stone-700"><Plus size={20}/></button></div>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">{localTestimonials.map(t => (<div key={t.id} onClick={() => setEditingId(t.id)} className={`p-4 rounded-xl cursor-pointer border flex items-center gap-4 ${editingId === t.id ? 'bg-[#1c1917] text-white' : 'bg-white border-stone-100 hover:border-stone-300'}`}><img src={t.avatar || 'https://via.placeholder.com/50'} className="w-10 h-10 rounded-full" /><div><h3 className="font-bold text-sm">{t.name}</h3></div></div>))}</div>
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
             <div className="p-6 bg-stone-50 border-t border-stone-100"><FeedbackSaveButton status={saveStatus} onClick={save} className="w-full" /></div>
           </div>
         ) : <div className="flex flex-col items-center justify-center h-full text-stone-400"><MessageSquareQuote size={64} className="mb-6 opacity-20"/><p>Selecione um depoimento</p></div>}
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
  const updateFontSize = (key: string, value: string) => setLocalTheme({ ...localTheme, fontSizes: { ...localTheme.fontSizes, [key]: value }});

  return (
    <div className="max-w-2xl h-full flex flex-col">
      <h2 className="text-3xl font-serif font-bold text-stone-900 mb-8">Aparência do Site</h2>
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 space-y-8 flex-1 overflow-y-auto pb-20">
        <div>
          <h3 className="font-bold text-stone-800 mb-6 text-lg">Cores Globais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.entries(localTheme.colors).map(([key, val]: any) => (
                <div key={key} className="space-y-2">
                    <label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">{key}</label>
                    <div className="flex gap-4 items-center"><input type="color" value={val} onChange={e => updateColor(key, e.target.value)} className="h-12 w-12 cursor-pointer border-2 border-stone-100 rounded-lg p-1" /><input type="text" value={val} onChange={e => updateColor(key, e.target.value)} className="flex-1 p-3 border border-stone-200 rounded-lg uppercase font-mono text-sm" /></div>
                </div>
            ))}
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100">
          <h3 className="font-bold text-stone-800 mb-6 text-lg">Tipografia</h3>
          <div className="space-y-6">
             <div className="space-y-2"><label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Serif</label><input type="text" value={localTheme.fonts.serif} onChange={e => updateFont('serif', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg font-mono text-sm" /></div>
             <div className="space-y-2"><label className="block text-xs uppercase tracking-wider text-stone-400 mb-1">Sans</label><input type="text" value={localTheme.fonts.sans} onChange={e => updateFont('sans', e.target.value)} className="w-full p-3 border border-stone-200 rounded-lg font-mono text-sm" /></div>
          </div>
        </div>
        <div className="pt-8 border-t border-stone-100">
           <h3 className="font-bold text-stone-800 mb-6 text-lg">Imagem de Capa (Home)</h3>
           <ImageInput label="Hero Image" value={localTheme.heroImage || ''} onChange={(val) => setLocalTheme({...localTheme, heroImage: val})} />
        </div>
        <div className="pt-8"><FeedbackSaveButton status={saveStatus} onClick={save} label="Salvar & Aplicar" className="w-full h-14" /></div>
      </div>
    </div>
  );
};

const XIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

export default Admin;