import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, Linkedin } from 'lucide-react';
import { useData } from '../context/DataContext';

const Footer: React.FC = () => {
  const { profile } = useData();
  
  return (
    <footer className="bg-stone-900 text-stone-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center gap-6">
        <div className="flex space-x-6">
          <a href={`mailto:${profile.contact.email}`} className="hover:text-white transition-colors">
            <Mail size={24} />
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <Instagram size={24} />
          </a>
          {profile.contact.linkedin && (
            <a href="#" className="hover:text-white transition-colors">
              <Linkedin size={24} />
            </a>
          )}
        </div>
        <div className="text-center font-serif flex flex-col items-center">
          <p className="text-lg text-stone-200 mb-2">{profile.name}</p>
          <p className="text-sm tracking-widest uppercase opacity-70">
            &copy; {new Date().getFullYear()} Todos os direitos reservados.
          </p>
          <Link to="/admin" className="text-[10px] uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity mt-6 text-stone-500 hover:text-stone-300">
            Área Administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;