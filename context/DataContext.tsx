
import React, { createContext, useContext, useState, useEffect } from 'react';
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
  
  // Detecta padrão ?pos=x,y ou &pos=x,y
  const match = rawUrl.match(/([?&])pos=([\d\.]+),([\d\.]+)/);
  let src = rawUrl;
  let style: React.CSSProperties = {};
  
  if (match) {
      // Remove o parâmetro da URL base para o src limpo
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

// Função ROBUSTA para garantir que o site nunca quebre, mesmo se faltarem dados no JSON
const mergeWithInitial = (incoming: any): AppData => {
  if (!incoming || typeof incoming !== 'object') return initialData;

  // Proteção para o Perfil
  const safeProfile: Profile = {
    ...initialData.profile,
    ...(incoming.profile || {}),
    // Garante que bio seja sempre um array, mesmo se vier como string ou null
    bio: Array.isArray(incoming.profile?.bio) 
         ? incoming.profile.bio 
         : (typeof incoming.profile?.bio === 'string' ? [incoming.profile.bio] : initialData.profile.bio),
    contact: {
      ...initialData.profile.contact,
      ...(incoming.profile?.contact || {})
    }
  };

  // Proteção para o Tema
  const safeTheme: ThemeConfig = {
    ...initialData.theme,
    ...(incoming.theme || {}),
    colors: { ...initialData.theme.colors, ...(incoming.theme?.colors || {}) },
    fonts: { ...initialData.theme.fonts, ...(incoming.theme?.fonts || {}) },
    fontSizes: { ...initialData.theme.fontSizes, ...(incoming.theme?.fontSizes || {}) },
    elementStyles: { ...initialData.theme.elementStyles, ...(incoming.theme?.elementStyles || {}) }
  };

  // Proteção para a Home
  const safeHome: HomeContent = {
     ...initialData.home, 
     ...(incoming.home || {})
  };

  const safePortfolioPage: PageContent = {
    ...initialData.portfolioPage,
    ...(incoming.portfolioPage || {})
  };

  const safeWritingsPage: PageContent = {
    ...initialData.writingsPage,
    ...(incoming.writingsPage || {})
  };

  return {
    ...initialData,
    ...incoming,
    // Sobrescreve campos críticos com versões seguras
    profile: safeProfile,
    // Garante que listas sejam arrays vazios se vierem null
    albums: Array.isArray(incoming.albums) ? incoming.albums : initialData.albums,
    writings: Array.isArray(incoming.writings) ? incoming.writings : initialData.writings,
    testimonials: Array.isArray(incoming.testimonials) ? incoming.testimonials : initialData.testimonials,
    theme: safeTheme,
    home: safeHome,
    portfolioPage: safePortfolioPage,
    writingsPage: safeWritingsPage
  };
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Carregar do Supabase ao montar
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: remoteData, error } = await supabase
          .from('portfolio_config')
          .select('content')
          .eq('id', 'main')
          .maybeSingle(); // maybeSingle evita erro se não encontrar linhas (retorna null)

        if (error) {
          // Erro de tabela não existente (PGRST205) ou permissão negada (42501)
          if (error.code === 'PGRST205' || error.code === '42P01') {
            console.warn("Tabela 'portfolio_config' não encontrada. Usando dados locais.");
          } else {
            console.error("Erro ao conectar com Supabase:", error.message);
          }
          loadFromLocal();
        } else if (remoteData?.content) {
          // Sucesso: Mesclamos com segurança
          setData(mergeWithInitial(remoteData.content));
        } else {
          // Tabela existe mas está vazia (sem linha 'main') -> Inicializar
          console.log("Nenhum dado encontrado. Tentando inicializar...");
          try {
             // Tenta criar o registro inicial
             const { error: insertError } = await supabase
                .from('portfolio_config')
                .insert({ id: 'main', content: initialData });
             
             if (insertError) throw insertError;
             setData(initialData);
          } catch (insertErr: any) {
             console.warn("Não foi possível salvar dados iniciais (provavelmente sem permissão/RLS). Usando dados padrão.");
             // Se falhar o insert (ex: usuário não logado não pode criar), usamos local
             loadFromLocal();
          }
        }
      } catch (e) {
        console.error("Erro crítico no carregamento de dados:", e);
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
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        setData(mergeWithInitial(parsed));
      }
    } catch (e) {
      console.error("Erro ao ler localStorage", e);
      // Se o local storage estiver corrompido, mantemos o initialData padrão
    }
  };

  // Sincronizar com LocalStorage (backup) e aplicar tema
  useEffect(() => {
    if (isLoaded) {
      // Prioridade 1: Aplicar Tema (UI)
      // Executa fora do try/catch do localStorage para garantir que o site fique bonito mesmo se o disco estiver cheio
      applyTheme(data.theme);

      // Prioridade 2: Backup Local
      try {
        localStorage.setItem('portfolio_data', JSON.stringify(data));
      } catch (e: any) {
        // Ignora erro de QuotaExceededError silenciosamente ou com aviso leve
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.warn("Backup local ignorado: Limite de armazenamento do navegador atingido. Os dados continuam seguros no Supabase.");
        } else {
            console.error("Erro ao salvar cache local:", e);
        }
      }
    }
  }, [data, isLoaded]);

  const applyTheme = (theme: ThemeConfig) => {
    if (!theme) return;
    const root = document.documentElement;
    
    const setProp = (name: string, val: string) => {
        if(val) root.style.setProperty(name, val);
    };

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
      setProp('--elem-title-font', theme.elementStyles.title.font);
      setProp('--elem-title-color', theme.elementStyles.title.color);
      
      setProp('--elem-subtitle-font', theme.elementStyles.subtitle.font);
      setProp('--elem-subtitle-color', theme.elementStyles.subtitle.color);
      
      setProp('--elem-text-font', theme.elementStyles.text.font);
      setProp('--elem-text-color', theme.elementStyles.text.color);
      
      setProp('--elem-caption-font', theme.elementStyles.caption.font);
      setProp('--elem-caption-color', theme.elementStyles.caption.color);
    }
  };

  const syncToSupabase = async (newData: AppData) => {
    // Atualização Otimista: Atualiza a UI imediatamente
    setData(newData);

    try {
      const { error } = await supabase
        .from('portfolio_config')
        .upsert({ id: 'main', content: newData });

      if (error) {
        console.error("Erro Supabase ao salvar:", error);
        
        if (error.code === '42501') { // Permissão negada (RLS)
            alert("Sessão expirada ou sem permissão para salvar. Por favor, faça login novamente na página Admin.");
        } else if (error.code === '42P01') { // Tabela faltando
            alert("Erro: A tabela 'portfolio_config' não existe no banco de dados.");
        }
      }
    } catch (e) {
      console.error("Erro de conexão ao salvar:", e);
    }
  };

  const updateProfile = async (profile: Profile) => {
    await syncToSupabase({ ...data, profile });
  };

  const updateAlbums = async (albums: Album[]) => {
    await syncToSupabase({ ...data, albums });
  };

  const updateWritings = async (writings: TextWork[]) => {
    await syncToSupabase({ ...data, writings });
  };

  const updateTestimonials = async (testimonials: Testimonial[]) => {
    await syncToSupabase({ ...data, testimonials });
  };

  const updateTheme = async (theme: ThemeConfig) => {
    await syncToSupabase({ ...data, theme });
  };

  const updateHome = async (home: HomeContent) => {
    await syncToSupabase({ ...data, home });
  };

  const updatePortfolioPage = async (portfolioPage: PageContent) => {
    await syncToSupabase({ ...data, portfolioPage });
  };

  const updateWritingsPage = async (writingsPage: PageContent) => {
    await syncToSupabase({ ...data, writingsPage });
  };
  
  const resetData = async () => {
    if(window.confirm("Tem certeza? Todas as alterações serão perdidas e os dados do banco serão resetados.")) {
      await syncToSupabase(initialData);
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-stone-50 z-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-stone-900 mb-4"></div>
        <p className="font-serif text-xl text-stone-600 tracking-widest uppercase">Carregando...</p>
      </div>
    );
  }

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
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
