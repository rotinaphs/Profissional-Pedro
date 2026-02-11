
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppData, Profile, Album, TextWork, Testimonial, ThemeConfig, HomeContent, PageContent } from '../types';
import { initialData } from '../data';
import { supabase } from '../supabase';

interface DataContextType extends AppData {
  updateProfile: (profile: Profile) => Promise<void>;
  updateAlbums: (albums: Album[]) => Promise<void>;
  updateWritings: (writings: TextWork[]) => Promise<void>;
  updateTestimonials: (testimonials: Testimonial[]) => Promise<void>;
  updateTheme: (theme: ThemeConfig) => Promise<void>;
  updateHome: (home: HomeContent) => Promise<void>;
  updatePortfolioPage: (content: PageContent) => Promise<void>;
  updateWritingsPage: (content: PageContent) => Promise<void>;
  resetData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// --- Image Utility ---
export const processImage = (rawUrl: string | undefined) => {
  if (!rawUrl) return { src: '', style: {} };
  
  const match = rawUrl.match(/([?&])pos=([\d\.]+),([\d\.]+)/);
  let src = rawUrl;
  let style: React.CSSProperties = {};
  
  if (match) {
      src = rawUrl.replace(match[0], '');
      const x = match[2];
      const y = match[3];
      const pos = `${x}% ${y}%`;
      style = { 
          objectPosition: pos,
          backgroundPosition: pos
      };
  }
  return { src, style };
};

const mergeWithInitial = (incoming: any): AppData => {
  if (!incoming || typeof incoming !== 'object') return initialData;

  const safeProfile: Profile = {
    ...initialData.profile,
    ...(incoming.profile || {}),
    bio: Array.isArray(incoming.profile?.bio) 
         ? incoming.profile.bio 
         : (typeof incoming.profile?.bio === 'string' ? [incoming.profile.bio] : initialData.profile.bio),
    contact: {
      ...initialData.profile.contact,
      ...(incoming.profile?.contact || {})
    }
  };

  const safeTheme: ThemeConfig = {
    ...initialData.theme,
    ...(incoming.theme || {}),
    colors: { ...initialData.theme.colors, ...(incoming.theme?.colors || {}) },
    fonts: { ...initialData.theme.fonts, ...(incoming.theme?.fonts || {}) },
    fontSizes: { ...initialData.theme.fontSizes, ...(incoming.theme?.fontSizes || {}) },
    elementStyles: { ...initialData.theme.elementStyles, ...(incoming.theme?.elementStyles || {}) }
  };

  return {
    ...initialData,
    ...incoming,
    profile: safeProfile,
    albums: Array.isArray(incoming.albums) ? incoming.albums : initialData.albums,
    writings: Array.isArray(incoming.writings) ? incoming.writings : initialData.writings,
    testimonials: Array.isArray(incoming.testimonials) ? incoming.testimonials : initialData.testimonials,
    theme: safeTheme,
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: remoteData, error } = await supabase
          .from('portfolio_config')
          .select('content')
          .eq('id', 'main')
          .maybeSingle(); 

        if (error) {
          console.warn("Supabase load error, using local/default.");
          loadFromLocal();
        } else if (remoteData?.content) {
          setData(mergeWithInitial(remoteData.content));
        } else {
           // Create if not exists
           await supabase.from('portfolio_config').insert({ id: 'main', content: initialData });
           setData(initialData);
        }
      } catch (e) {
        loadFromLocal();
      } finally {
        setIsLoaded(true);
      }
    };
    fetchData();
  }, []);

  const loadFromLocal = () => {
    try {
      const localSaved = localStorage.getItem('portfolio_data');
      if (localSaved) setData(mergeWithInitial(JSON.parse(localSaved)));
    } catch (e) { console.error(e); }
  };

  // Aplica tema e backup local sempre que data mudar
  useEffect(() => {
    if (isLoaded) {
      applyTheme(data.theme);
      localStorage.setItem('portfolio_data', JSON.stringify(data));
    }
  }, [data, isLoaded]);

  const applyTheme = (theme: ThemeConfig) => {
    if (!theme) return;
    const root = document.documentElement;
    const setProp = (name: string, val: string) => { if(val) root.style.setProperty(name, val); };
    
    setProp('--color-bg', theme.colors?.background);
    setProp('--color-text', theme.colors?.text);
    setProp('--color-accent', theme.colors?.accent);
    setProp('--color-secondary', theme.colors?.secondary);
    setProp('--color-surface', theme.colors?.surface || '#ffffff');
    setProp('--color-testimonial-bg', theme.colors?.testimonialBackground || '#ffffff');
    setProp('--color-testimonial-role', theme.colors?.testimonialRole || '#a8a29e');
    setProp('--font-serif', theme.fonts?.serif);
    setProp('--font-sans', theme.fonts?.sans);
    
    if (theme.fontSizes) {
      setProp('--font-size-base', theme.fontSizes.base);
      setProp('--font-size-title', theme.fontSizes.title);
      setProp('--font-size-subtitle', theme.fontSizes.subtitle);
      setProp('--font-size-caption', theme.fontSizes.caption);
    }

    if (theme.elementStyles) {
      if (theme.elementStyles.title) {
        setProp('--elem-title-font', theme.elementStyles.title.font);
        setProp('--elem-title-color', theme.elementStyles.title.color);
      }
      if (theme.elementStyles.subtitle) {
        setProp('--elem-subtitle-font', theme.elementStyles.subtitle.font);
        setProp('--elem-subtitle-color', theme.elementStyles.subtitle.color);
      }
      if (theme.elementStyles.text) {
        setProp('--elem-text-font', theme.elementStyles.text.font);
        setProp('--elem-text-color', theme.elementStyles.text.color);
      }
      if (theme.elementStyles.caption) {
        setProp('--elem-caption-font', theme.elementStyles.caption.font);
        setProp('--elem-caption-color', theme.elementStyles.caption.color);
      }
    }
  };

  // --- SAFE UPDATE PATTERN ---
  // Atualiza o estado usando a versão mais recente (prev) e dispara o salvamento
  // Isso evita que atualizações rápidas sobrescrevam umas às outras.
  const updateData = (updater: (prev: AppData) => Partial<AppData>) => {
    return new Promise<void>((resolve) => {
      setData((prev) => {
        const changes = updater(prev);
        const newState = { ...prev, ...changes };
        
        // Dispara salvamento 'fire-and-forget' com debounce opcional ou direto
        // Aqui fazemos direto para garantir persistência, o Supabase lida bem com concorrência básica
        supabase.from('portfolio_config')
          .upsert({ id: 'main', content: newState })
          .then(({ error }) => {
             if(error) console.error("Save error:", error);
             resolve();
          });

        return newState;
      });
    });
  };

  const updateProfile = async (profile: Profile) => updateData(() => ({ profile }));
  const updateAlbums = async (albums: Album[]) => updateData(() => ({ albums }));
  const updateWritings = async (writings: TextWork[]) => updateData(() => ({ writings }));
  const updateTestimonials = async (testimonials: Testimonial[]) => updateData(() => ({ testimonials }));
  const updateTheme = async (theme: ThemeConfig) => updateData(() => ({ theme }));
  const updateHome = async (home: HomeContent) => updateData(() => ({ home }));
  const updatePortfolioPage = async (portfolioPage: PageContent) => updateData(() => ({ portfolioPage }));
  const updateWritingsPage = async (writingsPage: PageContent) => updateData(() => ({ writingsPage }));
  
  const resetData = async () => {
    if(window.confirm("Isso apagará todos os dados e restaurará o padrão. Continuar?")) {
      await updateData(() => initialData);
    }
  };

  if (!isLoaded) return <div className="fixed inset-0 bg-stone-50 flex items-center justify-center font-serif text-stone-600">Carregando portfólio...</div>;

  return (
    <DataContext.Provider value={{
      ...data,
      updateProfile,
      updateAlbums,
      updateWritings,
      updateTestimonials,
      updateTheme,
      updateHome,
      updatePortfolioPage,
      updateWritingsPage,
      resetData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) throw new Error('useData must be used within a DataProvider');
  return context;
};
