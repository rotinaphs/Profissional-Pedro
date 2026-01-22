export interface Photo {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface Album {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  date: string;
  photos: Photo[];
}

export interface TextWork {
  id: string;
  title: string;
  category: 'Crônica' | 'Poesia' | 'Artigo' | 'Ensaio' | string;
  excerpt: string;
  content: string;
  date: string;
  coverImage?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  text: string;
  avatar: string;
}

export interface Profile {
  name: string;
  role: string;
  bio: string[];
  contact: {
    email: string;
    instagram: string;
    linkedin?: string;
  };
  profileImage: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  welcomeLabel: string;
  introTitle: string;
  introDescription: string;
}

export interface ThemeConfig {
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
  };
  fonts: {
    serif: string;
    sans: string;
  };
  fontSizes: {
    base: string;     // for writing body text
    title: string;    // for main titles
    subtitle: string; // for categories/dates
    caption: string;  // for photo captions
  };
  heroImage?: string;
}

export interface AppData {
  profile: Profile;
  albums: Album[];
  writings: TextWork[];
  testimonials: Testimonial[];
  theme: ThemeConfig;
  home: HomeContent;
}