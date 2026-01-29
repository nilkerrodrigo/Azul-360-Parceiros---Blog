import { Article, Category, Banner } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'marketing', name: 'Marketing', icon: 'fa-bullhorn', description: 'Estratégias para vender mais' },
  { id: 'tecnologia', name: 'Tecnologia', icon: 'fa-laptop-code', description: 'Inovação no turismo' },
  { id: 'gestao', name: 'Gestão', icon: 'fa-chart-line', description: 'Eficiência operacional' },
  { id: 'destinos', name: 'Destinos', icon: 'fa-map-marked-alt', description: 'Novos lugares para explorar' },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 1,
    image: 'https://picsum.photos/1200/400?random=101',
    title: 'Campanha de Verão 2025',
    subtitle: 'Aumente suas vendas com pacotes exclusivos para o Nordeste.',
    cta: 'Ver Condições'
  },
  {
    id: 2,
    image: 'https://picsum.photos/1200/400?random=102',
    title: 'Novo Portal de Emissões',
    subtitle: 'Mais agilidade e autonomia para sua agência.',
    cta: 'Acessar Agora'
  },
  {
    id: 3,
    image: 'https://picsum.photos/1200/400?random=103',
    title: 'Treinamento Disney 2024',
    subtitle: 'Torne-se um especialista e encante seus clientes.',
    cta: 'Inscreva-se'
  }
];

export const INITIAL_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Inteligência Artificial revoluciona o atendimento no turismo',
    excerpt: 'Descubra como a IA está transformando a experiência do cliente e otimizando processos nas agências de viagens.',
    content: 'A Inteligência Artificial (IA) deixou de ser uma promessa futurista...',
    category: 'Tecnologia',
    imageUrl: 'https://picsum.photos/800/600?random=1',
    author: 'Ana Silva',
    date: '24 Out, 2023',
    featured: true
  },
  {
    id: '2',
    title: 'O poder da personalização nas vendas de pacotes',
    excerpt: 'Entenda por que oferecer experiências únicas é a chave para fidelizar clientes no cenário atual.',
    content: 'Em um mundo cada vez mais conectado, o consumidor busca mais do que...',
    category: 'Marketing',
    imageUrl: 'https://picsum.photos/800/600?random=2',
    author: 'Carlos Souza',
    date: '22 Out, 2023'
  },
  {
    id: '3',
    title: 'Sustentabilidade: O novo diferencial competitivo',
    excerpt: 'Como práticas sustentáveis podem atrair um novo perfil de viajante consciente.',
    content: 'O turismo sustentável não é apenas uma tendência, é uma necessidade...',
    category: 'Gestão',
    imageUrl: 'https://picsum.photos/800/600?random=3',
    author: 'Mariana Lima',
    date: '20 Out, 2023'
  },
  {
    id: '4',
    title: 'Destinos em alta para o verão 2025',
    excerpt: 'Prepare sua agência para a alta temporada com estas dicas de destinos imperdíveis.',
    content: 'O verão de 2025 promete ser um dos mais movimentados da década...',
    category: 'Destinos',
    imageUrl: 'https://picsum.photos/800/600?random=4',
    author: 'Roberto Dias',
    date: '18 Out, 2023'
  },
];