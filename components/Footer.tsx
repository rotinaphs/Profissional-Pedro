
import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Linkedin, Phone } from 'lucide-react';
import { useData } from '../context/DataContext';

const Footer: React.FC = () => {
  const { profile } = useData();

  const getInstagramUrl = (handle: string) => {
    if (!handle) return '#';
    // Remove @ se estiver no início
    const username = handle.replace(/^@/, '');
    if (username.startsWith('http')) return username;
    return `https://www.instagram.com/${username}`;
  };

  const getLinkedinUrl = (handle: string) => {
    if (!handle) return '#';
    if (handle.startsWith('http')) return handle;
    return `https://${handle}`;
  };
  
  // Classe para garantir que os ícones tenham o mesmo tamanho de toque e alinhamento
  const iconLinkClass = "w-12 h-12 flex items-center justify-center hover:text-white transition-colors text-stone-400";

  return (
    <footer className="bg-stone-900 text-stone-400 py-16 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-10">
        
        {/* Ícones Sociais */}
        <div className="flex items-center justify-center gap-4">
          <a 
            href={`mailto:${profile.contact.email}`} 
            className={iconLinkClass}
            aria-label="Email"
          >
            <Mail size={24} strokeWidth={1.5} />
          </a>

          {profile.contact.phone && (
            <a 
              href={`tel:${profile.contact.phone.replace(/[^\d+]/g, '')}`} 
              className={iconLinkClass}
              aria-label="Phone"
            >
              <Phone size={24} strokeWidth={1.5} />
            </a>
          )}
          
          <a 
            href={getInstagramUrl(profile.contact.instagram)}
            target="_blank"
            rel="noopener noreferrer" 
            className={iconLinkClass}
            aria-label="Instagram"
          >
            <Instagram size={24} strokeWidth={1.5} />
          </a>

          {profile.contact.linkedin && (
            <a 
              href={getLinkedinUrl(profile.contact.linkedin)}
              target="_blank"
              rel="noopener noreferrer" 
              className={iconLinkClass}
              aria-label="LinkedIn"
            >
              <Linkedin size={24} strokeWidth={1.5} />
            </a>
          )}
        </div>

        {/* Informações e Copyright */}
        <div className="text-center font-serif flex flex-col items-center gap-2">
          <p className="text-xl text-stone-200 tracking-wide">{profile.name}</p>
          <p className="text-[10px] tracking-[0.2em] uppercase opacity-50 font-sans text-stone-500">
            &copy; {new Date().getFullYear()} Todos os direitos reservados.
          </p>
          <Link to="/admin" className="text-[9px] uppercase tracking-[0.2em] opacity-20 hover:opacity-100 transition-opacity mt-6 text-stone-500 hover:text-stone-300 font-sans">
            Área Administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
