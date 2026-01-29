import React, { useState } from 'react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import BannerSlider from './components/BannerSlider';
import { INITIAL_ARTICLES, INITIAL_CATEGORIES, INITIAL_BANNERS } from './constants';
import { Article, ViewState, Category, Banner } from './types';

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Navigation Logic with Auth Check
  const handleNavigate = (targetView: ViewState) => {
    if (targetView === 'ADMIN' && !isAuthenticated) {
      setView('LOGIN');
    } else {
      setView(targetView);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
    setView('ADMIN');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setView('SEARCH_RESULTS');
  };

  const handlePublish = (article: Article) => {
    setArticles([article, ...articles]);
    setView('HOME');
  };

  const handleAddCategory = (name: string) => {
    const newCategory: Category = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        icon: 'fa-tag', // Default icon for new categories
        description: 'Nova categoria'
    };
    setCategories([...categories, newCategory]);
  };

  const handleDeleteCategory = (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
        setCategories(categories.filter(c => c.id !== id));
      }
  };

  const handleArticleClick = (article: Article) => {
    setSelectedArticle(article);
    setView('ARTICLE_DETAIL');
  };

  const renderHome = () => {
    const featured = articles[0];
    const sideArticles = articles.slice(1, 4);
    const recentArticles = articles.slice(1);

    return (
      <main>
        {/* Banner Slideshow Section */}
        <section className="pt-8 pb-4 bg-gray-50">
           <div className="container mx-auto px-4">
              <BannerSlider banners={banners} />
           </div>
        </section>

        {/* Hero Section */}
        <section className="bg-white pb-8 border-b pt-4">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Featured Main */}
              <div 
                className="lg:col-span-2 relative h-[500px] rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
                onClick={() => handleArticleClick(featured)}
              >
                <img 
                    src={featured.imageUrl} 
                    alt={featured.title} 
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full max-w-3xl">
                  <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider text-white uppercase bg-azul-500 rounded">
                    {featured.category}
                  </span>
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {featured.title}
                  </h1>
                  <p className="text-gray-200 mb-6 line-clamp-2 text-lg hidden md:block">{featured.excerpt}</p>
                  <button className="bg-azul-700 hover:bg-azul-600 text-white font-bold py-2 px-6 rounded transition">
                    Leia mais
                  </button>
                </div>
              </div>

              {/* Side List */}
              <div className="flex flex-col gap-6">
                 <div className="border-b pb-2 mb-2">
                    <h3 className="font-bold text-azul-900 uppercase text-sm tracking-wider">Destaques</h3>
                 </div>
                 {sideArticles.map(article => (
                    <ArticleCard 
                        key={article.id} 
                        article={article} 
                        layout="horizontal" 
                        onClick={handleArticleClick} 
                    />
                 ))}
                 
                 {/* App Banner Mock */}
                 <div className="mt-auto bg-azul-900 rounded-xl p-6 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h4 className="font-bold text-xl mb-2">Baixe o App Azul 360</h4>
                        <p className="text-sm opacity-80 mb-4">Gestão na palma da sua mão.</p>
                        <button className="text-xs bg-white text-azul-900 font-bold px-4 py-2 rounded-full">Download Now</button>
                    </div>
                    <i className="fas fa-mobile-alt absolute -bottom-4 -right-4 text-9xl text-white opacity-10 rotate-12"></i>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
             <div className="text-center mb-12">
                 <h2 className="text-2xl font-bold text-gray-800">Escolha sua próxima leitura <span className="text-azul-500">por assunto</span></h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.map(cat => (
                    <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group border border-transparent hover:border-azul-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-azul-500 group-hover:text-white transition-colors">
                            <i className={`fas ${cat.icon} text-xl text-gray-600 group-hover:text-white`}></i>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">{cat.name}</h3>
                        <p className="text-xs text-gray-500">{cat.description}</p>
                    </div>
                ))}
             </div>
          </div>
        </section>

        {/* Recent Articles */}
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-10 border-b pb-4">
                    <h2 className="text-3xl font-bold text-azul-900">Artigos Recentes</h2>
                    <a href="#" className="text-sm font-semibold text-gray-500 hover:text-azul-500">Ver todos</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recentArticles.map(article => (
                        <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                    ))}
                </div>
            </div>
        </section>

        {/* Columnists Section Mock */}
        <section className="py-16 bg-azul-50">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                     <h2 className="text-2xl font-bold text-azul-900">Colunistas Parceiros</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-azul-800 rounded-2xl p-8 flex items-center gap-6 text-white overflow-hidden relative shadow-lg">
                        <img src="https://picsum.photos/150/150?random=10" alt="Colunista" className="w-24 h-24 rounded-full border-4 border-azul-500 object-cover z-10" />
                        <div className="z-10">
                            <span className="bg-azul-500 text-xs px-2 py-1 rounded mb-2 inline-block">Especialista em Vendas</span>
                            <h3 className="text-xl font-bold mb-2">Fernanda Torres</h3>
                            <p className="text-sm text-blue-100 mb-4">Insights semanais sobre conversão e atendimento.</p>
                            <button className="text-sm font-bold hover:underline">Ler coluna</button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <i className="fas fa-quote-right text-9xl"></i>
                        </div>
                    </div>
                    <div className="bg-azul-700 rounded-2xl p-8 flex items-center gap-6 text-white overflow-hidden relative shadow-lg">
                        <img src="https://picsum.photos/150/150?random=11" alt="Colunista" className="w-24 h-24 rounded-full border-4 border-azul-400 object-cover z-10" />
                        <div className="z-10">
                            <span className="bg-azul-400 text-xs px-2 py-1 rounded mb-2 inline-block">Economia</span>
                            <h3 className="text-xl font-bold mb-2">Ricardo Mello</h3>
                            <p className="text-sm text-blue-100 mb-4">Análise de mercado e tendências para o turismo.</p>
                            <button className="text-sm font-bold hover:underline">Ler coluna</button>
                        </div>
                        <div className="absolute right-0 bottom-0 opacity-10">
                            <i className="fas fa-chart-pie text-9xl"></i>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>
    );
  };

  const renderSearchResults = () => {
    const filtered = articles.filter(a => 
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <section className="py-16 min-h-[60vh]">
            <div className="container mx-auto px-4">
                <div className="mb-8 border-b pb-4">
                    <h2 className="text-3xl font-bold text-gray-800">Resultados da Busca</h2>
                    <p className="text-gray-500 mt-2">
                        Exibindo resultados para: <span className="text-azul-700 font-bold">"{searchQuery}"</span>
                    </p>
                </div>
                
                {filtered.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {filtered.map(article => (
                            <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-xl">
                        <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
                        <h3 className="text-xl font-semibold text-gray-600">Nenhum artigo encontrado</h3>
                        <p className="text-gray-500 mt-2">Tente buscar por outros termos ou categorias.</p>
                        <button 
                            onClick={() => setView('HOME')}
                            className="mt-6 px-6 py-2 bg-azul-500 text-white rounded-lg hover:bg-azul-600 transition"
                        >
                            Voltar para Início
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
  };

  const renderArticleDetail = () => {
    if (!selectedArticle) return null;
    return (
        <article className="bg-white min-h-screen pb-20">
            <div className="h-[400px] w-full relative">
                <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute bottom-0 w-full p-8 md:p-16">
                    <div className="container mx-auto">
                        <span className="bg-azul-500 text-white px-4 py-1 rounded text-sm font-bold uppercase mb-4 inline-block">{selectedArticle.category}</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">{selectedArticle.title}</h1>
                        <div className="flex items-center text-white/80 gap-4">
                            <span><i className="fas fa-user mr-2"></i>{selectedArticle.author}</span>
                            <span><i className="far fa-calendar mr-2"></i>{selectedArticle.date}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container mx-auto px-4 -mt-10 relative z-10">
                <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
                    <p className="text-xl text-gray-600 font-serif leading-relaxed mb-8 border-l-4 border-azul-500 pl-4 italic">
                        {selectedArticle.excerpt}
                    </p>
                    <div className="prose prose-lg prose-blue max-w-none text-gray-700 whitespace-pre-wrap">
                        {selectedArticle.content}
                    </div>
                    
                    <div className="mt-12 pt-8 border-t flex justify-between items-center">
                        <button onClick={() => setView('HOME')} className="text-azul-900 font-bold hover:underline">
                            <i className="fas fa-arrow-left mr-2"></i> Voltar para Home
                        </button>
                        <div className="flex gap-4">
                            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-azul-100 text-azul-900 flex items-center justify-center transition"><i className="fab fa-facebook-f"></i></button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-azul-100 text-azul-900 flex items-center justify-center transition"><i className="fab fa-twitter"></i></button>
                            <button className="w-10 h-10 rounded-full bg-gray-100 hover:bg-azul-100 text-azul-900 flex items-center justify-center transition"><i className="fab fa-whatsapp"></i></button>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header currentView={view} onNavigate={handleNavigate} onSearch={handleSearch} />
      
      <div className="flex-grow">
        {view === 'HOME' && renderHome()}
        {view === 'LOGIN' && <Login onLogin={handleLogin} onCancel={() => setView('HOME')} />}
        {view === 'ADMIN' && (
            <AdminPanel 
                onPublish={handlePublish} 
                categories={categories} 
                onAddCategory={handleAddCategory} 
                onDeleteCategory={handleDeleteCategory}
                banners={banners}
                onUpdateBanners={setBanners}
            />
        )}
        {view === 'SEARCH_RESULTS' && renderSearchResults()}
        {view === 'ARTICLE_DETAIL' && renderArticleDetail()}
      </div>

      <footer className="bg-azul-900 text-white py-12 border-t-4 border-azul-500">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
                <img 
                    src="http://azul360parceiros.com.br/wp-content/uploads/2026/01/parceiros-scaled.png" 
                    alt="Azul 360 Parceiros" 
                    className="h-12 w-auto mb-4 object-contain brightness-0 invert"
                />
                <p className="text-gray-400 text-sm leading-relaxed">
                    O Portal Azul 360 Parceiros é mantido pela Azul Viagens. Conteúdo exclusivo para o crescimento do seu negócio.
                </p>
            </div>
            
            {/* Dynamic Categories Column */}
            <div className="col-span-1">
                <h4 className="font-bold mb-4 uppercase text-sm tracking-wider text-azul-500">Categorias</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <a href="#" onClick={() => { setSearchQuery(cat.name); setView('SEARCH_RESULTS'); }} className="hover:text-white transition flex items-center gap-2">
                                <i className={`fas ${cat.icon} text-xs opacity-70`}></i>
                                {cat.name}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="col-span-1">
                <h4 className="font-bold mb-4 uppercase text-sm tracking-wider text-azul-500">Mapa do Site</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li><a href="#" onClick={() => setView('HOME')} className="hover:text-white transition cursor-pointer">Início</a></li>
                    <li><a href="#" className="hover:text-white transition">Sobre</a></li>
                    <li><a href="#" className="hover:text-white transition">Blog</a></li>
                </ul>
            </div>
            
            <div className="col-span-1">
                <h4 className="font-bold mb-4 uppercase text-sm tracking-wider text-azul-500">Siga-nos</h4>
                <div className="flex flex-col gap-3">
                    <a href="https://instagram.com/azul360.parceiros" target="_blank" className="flex items-center gap-2 text-gray-300 hover:text-white transition group">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-azul-500 transition-colors">
                            <i className="fab fa-instagram"></i>
                        </div>
                    </a>
                    <div className="flex gap-3 mt-1">
                         <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-azul-500 transition-colors"><i className="fab fa-facebook-f"></i></a>
                         <a href="#" className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-azul-500 transition-colors"><i className="fab fa-youtube"></i></a>
                    </div>
                </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Azul 360 Parceiros. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;