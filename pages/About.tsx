import React from 'react';
import { useData, processImage } from '../context/DataContext';
import { Mail, Instagram, Linkedin } from 'lucide-react';
import FadeIn from '../components/FadeIn';

const About: React.FC = () => {
  const { profile, testimonials } = useData();
  const { src, style } = processImage(profile.profileImage);

  return (
    <div className="min-h-screen bg-stone-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-start">
        
        {/* Profile Image */}
        <div className="w-full md:w-5/12 sticky top-24">
          <FadeIn delay={200}>
            <div className="aspect-[4/5] bg-stone-200 overflow-hidden shadow-lg">
              <img 
                src={src} 
                alt={profile.name} 
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                style={style}
              />
            </div>
          </FadeIn>
        </div>

        {/* Bio Content */}
        <div className="w-full md:w-7/12">
            <FadeIn>
              <h1 className="font-serif text-5xl text-stone-900 mb-2">{profile.name}</h1>
              <p className="text-stone-500 uppercase tracking-widest text-sm mb-10">{profile.role}</p>
            </FadeIn>

            <div className="space-y-6 font-serif text-lg md:text-xl text-stone-700 leading-relaxed mb-12">
              {profile.bio.map((paragraph, idx) => (
                <FadeIn key={idx} delay={200 + (idx * 100)}>
                  <p>{paragraph}</p>
                </FadeIn>
              ))}
            </div>

            <FadeIn delay={500}>
              <div className="border-t border-stone-200 pt-10">
                <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-stone-900 mb-6">Contato</h3>
                <div className="flex flex-col gap-4 font-sans text-stone-600">
                  <a href={`mailto:${profile.contact.email}`} className="flex items-center gap-3 hover:text-stone-900 transition-colors">
                      <Mail size={20} /> {profile.contact.email}
                  </a>
                  <a href="#" className="flex items-center gap-3 hover:text-stone-900 transition-colors">
                      <Instagram size={20} /> {profile.contact.instagram}
                  </a>
                  {profile.contact.linkedin && (
                    <a href="#" className="flex items-center gap-3 hover:text-stone-900 transition-colors">
                        <Linkedin size={20} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </FadeIn>

            {testimonials.length > 0 && (
              <FadeIn delay={700}>
                <div className="border-t border-stone-200 pt-12 mt-12">
                  <h3 className="font-sans text-sm font-bold uppercase tracking-widest text-stone-900 mb-8">Depoimentos</h3>
                  <div className="grid gap-8">
                    {testimonials.map((t) => (
                      <div key={t.id} className="bg-white p-6 rounded-lg shadow-sm border border-stone-100">
                         <p className="font-serif text-lg italic text-stone-600 mb-6 leading-relaxed">"{t.text}"</p>
                         <div className="flex items-center gap-4">
                            <img src={processImage(t.avatar).src} style={processImage(t.avatar).style} alt={t.name} className="w-10 h-10 rounded-full object-cover bg-stone-200" />
                            <div>
                               <p className="font-sans text-xs font-bold text-stone-900 uppercase tracking-wide">{t.name}</p>
                               {t.role && <p className="font-sans text-[10px] text-stone-400 uppercase tracking-widest">{t.role}</p>}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            )}
        </div>

      </div>
    </div>
  );
};

export default About;