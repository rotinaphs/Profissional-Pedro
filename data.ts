import { AppData } from './types';

export const initialData: AppData = {
  theme: {
    colors: {
      background: '#fafaf9', // stone-50
      text: '#1c1917',       // stone-900
      accent: '#292524',     // stone-800
      secondary: '#78716c',  // stone-500
    },
    fonts: {
      serif: '"Cormorant Garamond", serif',
      sans: '"Montserrat", sans-serif',
    },
    fontSizes: {
      base: '18px',
      title: '64px',
      subtitle: '14px',
      caption: '16px',
    },
    elementStyles: {
      title: { font: '"Cormorant Garamond", serif', color: '#1c1917' },
      subtitle: { font: '"Cormorant Garamond", serif', color: '#78716c' },
      text: { font: '"Cormorant Garamond", serif', color: '#1c1917' },
      caption: { font: '"Montserrat", sans-serif', color: '#ffffff' },
    },
    heroImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80"
  },
  home: {
    heroTitle: "A Arte de Observar",
    heroSubtitle: "Fotografia & Poesia",
    welcomeLabel: "Bem-vindo",
    introTitle: "\"Não fotografamos o que vemos, fotografamos o que sentimos.\"",
    introDescription: "Este espaço é dedicado aos fragmentos de tempo que coleciono. Seja através da lente da câmera ou da tinta da caneta, cada obra aqui exposta é um convite para desacelerar e enxergar a beleza nos detalhes."
  },
  profile: {
    name: "Pedro Henrique",
    role: "Fotógrafo & Escritor",
    bio: [
      "Acredito que a fotografia e a escrita são duas faces da mesma moeda: a arte de observar e eternizar o efêmero. Meu trabalho busca as narrativas silenciosas da natureza e as histórias não contadas do cotidiano urbano.",
      "Com 10 anos de experiência em fotografia documental e natureza, e diversos contos publicados em antologias nacionais, dedico minha vida a construir pontes entre o visível e o sensível.",
      "Atualmente resido em São Paulo, mas meu espírito vive na estrada."
    ],
    contact: {
      email: "contato@pedrohenrique.com",
      instagram: "@pedrohenrique.art",
      linkedin: "linkedin.com/in/pedrohenrique"
    },
    profileImage: "https://picsum.photos/id/64/800/800"
  },
  albums: [
    {
      id: "natureza-silenciosa",
      title: "Natureza Silenciosa",
      description: "Um estudo sobre a quietude das paisagens intocadas e a luz da manhã.",
      date: "2023",
      coverImage: "https://picsum.photos/id/10/800/600",
      photos: [
        { id: "n1", src: "https://picsum.photos/id/10/1200/800", alt: "Floresta ao amanhecer", caption: "O despertar da floresta" },
        { id: "n2", src: "https://picsum.photos/id/11/1200/800", alt: "Lago calmo", caption: "Espelho d'água" },
        { id: "n3", src: "https://picsum.photos/id/12/1200/800", alt: "Praia deserta", caption: "Areias do tempo" },
        { id: "n4", src: "https://picsum.photos/id/13/1200/800", alt: "Montanhas", caption: "Horizonte distante" },
        { id: "n5", src: "https://picsum.photos/id/14/1200/800", alt: "Costeira", caption: "Onde a terra toca o mar" },
        { id: "n6", src: "https://picsum.photos/id/15/1200/800", alt: "Cachoeira", caption: "Fluxo contínuo" },
      ]
    },
    {
      id: "cotidiano-urbano",
      title: "Cotidiano Urbano",
      description: "A poesia do caos nas grandes metrópoles. Preto e branco e contrastes.",
      date: "2024",
      coverImage: "https://picsum.photos/id/20/800/600",
      photos: [
        { id: "u1", src: "https://picsum.photos/id/20/1200/800", alt: "Mesa de trabalho", caption: "Ferramentas do dia" },
        { id: "u2", src: "https://picsum.photos/id/21/1200/800", alt: "Sapatos", caption: "Passos apressados" },
        { id: "u3", src: "https://picsum.photos/id/22/1200/800", alt: "Rua vazia", caption: "Solidão noturna" },
        { id: "u4", src: "https://picsum.photos/id/24/1200/800", alt: "Livros antigos", caption: "Histórias guardadas" },
      ]
    },
    {
      id: "retratos",
      title: "Alma & Face",
      description: "Retratos que buscam capturar a essência além da aparência.",
      date: "2022 - Atual",
      coverImage: "https://picsum.photos/id/64/800/600",
      photos: [
        { id: "r1", src: "https://picsum.photos/id/64/1200/800", alt: "Retrato feminino", caption: "Olhar sereno" },
        { id: "r2", src: "https://picsum.photos/id/65/1200/800", alt: "Rosto expressivo", caption: "Marcas do tempo" },
        { id: "r3", src: "https://picsum.photos/id/91/1200/800", alt: "Mãos", caption: "Trabalho manual" },
      ]
    }
  ],
  writings: [
    {
      id: "o-tempo-das-pedras",
      title: "O Tempo das Pedras",
      category: "Poesia",
      date: "12 Mar 2024",
      excerpt: "Uma reflexão poética sobre a paciência geológica e a pressa humana.",
      coverImage: "https://picsum.photos/id/16/800/400",
      content: `
        <p>As pedras não têm pressa.</p>
        <p>Elas conhecem o segredo do repouso absoluto. Enquanto corremos contra os ponteiros invisíveis de relógios que nós mesmos inventamos, elas permanecem. Testemunhas mudas da erosão, do vento e da chuva.</p>
        <br/>
        <p>Eu quisera ter a paciência do granito.<br/>
        Suportar o peso do mundo sem trincar.<br/>
        Deixar que o musgo me vista como um manto real,<br/>
        E entender que ficar parado também é uma forma de viajar.</p>
        <br/>
        <p>No fim, talvez sejamos apenas poeira ansiosa, sonhando em ser rocha.</p>
      `
    },
    {
      id: "cafe-frio",
      title: "Café Frio e Memórias Mornas",
      category: "Crônica",
      date: "05 Fev 2024",
      excerpt: "Sobre os encontros que não aconteceram e as xícaras que ficaram sobre a mesa.",
      content: `
        <p>Há uma tristeza peculiar em uma xícara de café esquecida. Ela é um monumento a uma intenção frustrada. Alguém a preparou com propósito — despertar, aquecer, confortar — mas a vida, com sua urgência distraída, a deixou para trás.</p>
        <p>Hoje de manhã, encontrei uma dessas xícaras na minha mesa. O líquido preto, agora gelado, refletia a luz da janela como um lago polido. Lembrei-me de você. De quantas conversas deixamos esfriar porque estávamos ocupados demais tentando ferver a vida em fogo alto.</p>
        <p>Bebemos a vida em goles rápidos, queimando a língua, sem sentir o sabor. Talvez devêssemos aprender a apreciar o café morno. Aquele momento em que a temperatura se iguala à do corpo, e a bebida deixa de ser um choque térmico para se tornar parte de nós.</p>
      `
    }
  ],
  testimonials: [
    {
      id: "t1",
      name: "Ana Costa",
      role: "Editora da Revista Viver",
      text: "O trabalho do Pedro captura a alma do momento. Suas fotos ilustraram nossa matéria de capa com uma sensibilidade ímpar.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    }
  ]
};