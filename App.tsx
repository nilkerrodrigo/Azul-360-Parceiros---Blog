import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import BannerSlider from './components/BannerSlider';
import About from './components/About';
import { Article, ViewState, Category, Banner } from './types';
import { 
    getArticles, 
    getCategories, 
    getBanners, 
    incrementArticleView, 
    incrementBannerClick,
    addCategory,
    deleteCategory,
    addArticle,
    addBanner,
    deleteBanner,
    deleteArticle
} from './services/apiService';

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  
  // State driven by API
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
        // O serviço de API agora lida com erros e retorna dados mockados se necessário
        const [fetchedArticles, fetchedCategories, fetchedBanners] = await Promise.all([
            getArticles(),
            getCategories(),
            getBanners()
        ]);
        
        setArticles(fetchedArticles);
        setCategories(fetchedCategories);
        setBanners(fetchedBanners);
    } catch (error: any) {
        console.error("Critical error fetching data:", error);
        // Só mostramos erro se realmente não houver dados nenhum (nem mock)
        setError("Não foi possível carregar a aplicação. Tente recarregar a página.");
    } finally {
        setLoading(false);
    }
  };

  // Navigation Logic
  const handleNavigate = (targetView: ViewState) => {
    if (targetView === 'ADMIN' && !isAuthenticated) {
      setView('LOGIN');
    } else {
      setView(targetView);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setView('ADMIN');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setView('SEARCH_RESULTS');
  };

  // --- Actions ---

  const handlePublish = async (article: Article) => {
    const { id, ...data } = article;
    await addArticle(data);
    await loadData();
    setView('HOME');
  };

  const handleDeleteArticle = async (id: string) => {
    await deleteArticle(id);
    await loadData();
  };

  const handleAddCategory = async (name: string) => {
    const newCategory = {
        name: name,
        icon: 'fa-tag', 
        description: 'Nova categoria'
    };
    await addCategory(newCategory);
    await loadData();
  };

  const handleDeleteCategory = async (id: string) => {
      if (window.confirm('Tem certeza que deseja excluir esta categoria?')) {
        await deleteCategory(id);
        await loadData();
      }
  };

  const handleAddBanner = async (banner: Banner) => {
      const { id, ...data } = banner;
      await addBanner(data);
      await loadData();
  };

  const handleDeleteBanner = async (id: string) => {
      await deleteBanner(id);
      await loadData();
  };

  // Track Article Views
  const handleArticleClick = (article: Article) => {
    // Optimistic update locally
    setSelectedArticle({ ...article, views: (article.views || 0) + 1 });
    incrementArticleView(article.id);
    setView('ARTICLE_DETAIL');
  };

  // Track Banner Clicks
  const handleBannerClick = (id: string) => {
    incrementBannerClick(id);
    console.log(`Banner ${id} clicked.`);
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <i className="fas fa-circle-notch fa-spin text-4xl text-azul-500 mb-4"></i>
                  <p className="text-gray-600">Carregando conteúdo...</p>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-lg border border-red-100">
                  <i className="fas fa-wifi text-4xl text-red-400 mb-4"></i>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Erro de Conexão</h2>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <button 
                    onClick={loadData}
                    className="bg-azul-900 text-white font-bold py-3 px-8 rounded-lg hover:bg-azul-700 transition w-full"
                  >
                    Tentar Novamente
                  </button>
              </div>
          </div>
      );
  }

  const renderHome = () => {
    const featured = articles[0];
    const sideArticles = articles.slice(1, 4);
    const recentArticles = articles.slice(1);

    return (
      <main>
        {/* Banner Slideshow Section */}
        <section className="pt-8 pb-4 bg-gray-50">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <BannerSlider banners={banners} onBannerClick={handleBannerClick} />
           </div>
        </section>

        {/* Hero Section */}
        {featured ? (
        <section className="bg-white pb-8 border-b pt-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    onError={(e) => { e.currentTarget.src = 'https://picsum.photos/800/600?error'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-8 w-full max-w-3xl">
                  {/* Category badge removed as requested */}
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
                 
                 {/* App Banner Updated */}
                 <a 
                    href="https://negocios.azulse.com.br/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block mt-auto group"
                 >
                    <div className="bg-azul-900 rounded-xl p-6 text-white relative overflow-hidden transition transform group-hover:scale-[1.02] shadow-lg">
                        <div className="relative z-10">
                            <h4 className="font-bold text-xl mb-2">Plataforma Azul 360</h4>
                            <p className="text-sm opacity-80 mb-4">Acesse agora a plataforma.</p>
                            <span className="text-xs bg-white text-azul-900 font-bold px-4 py-2 rounded-full inline-block">Acessar Agora</span>
                        </div>
                        <i className="fas fa-desktop absolute -bottom-4 -right-4 text-9xl text-white opacity-10 rotate-12 group-hover:rotate-6 transition-transform"></i>
                    </div>
                 </a>
              </div>
            </div>
          </div>
        </section>
        ) : (
            <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 max-w-2xl mx-auto">
                    <i className="fas fa-newspaper text-4xl text-gray-300 mb-4"></i>
                    <p className="font-bold text-gray-700">Nenhum artigo encontrado</p>
                    <p className="text-sm mt-2 text-gray-500">
                        Se você acabou de instalar o sistema, acesse o 
                        <button onClick={() => setView('LOGIN')} className="text-azul-500 font-bold hover:underline mx-1">Painel Admin</button> 
                        para criar seu primeiro post.
                    </p>
                </div>
            </div>
        )}

        {/* Categories Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="text-center mb-12">
                 <h2 className="text-2xl font-bold text-gray-800">Escolha sua próxima leitura <span className="text-azul-500">por assunto</span></h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.length > 0 ? categories.map(cat => (
                    <div key={cat.id} onClick={() => handleSearch(cat.name)} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group border border-transparent hover:border-azul-200">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-azul-500 group-hover:text-white transition-colors">
                            <i className={`fas ${cat.icon || 'fa-tag'} text-xl text-gray-600 group-hover:text-white`}></i>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">{cat.name}</h3>
                        <p className="text-xs text-gray-500">{cat.description}</p>
                    </div>
                )) : (
                    <div className="col-span-4 text-center text-gray-400 text-sm">Nenhuma categoria cadastrada.</div>
                )}
             </div>
          </div>
        </section>

        {/* Recent Articles */}
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-10 border-b pb-4">
                    <h2 className="text-3xl font-bold text-azul-900">Artigos Recentes</h2>
                    <a href="#" className="text-sm font-semibold text-gray-500 hover:text-azul-500">Ver todos</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {recentArticles.length > 0 ? recentArticles.map(article => (
                        <ArticleCard key={article.id} article={article} onClick={handleArticleClick} />
                    )) : (
                         <div className="col-span-3 text-center text-gray-400 py-10">
                            Ainda não há artigos recentes para exibir.
                         </div>
                    )}
                </div>
            </div>
        </section>
      </main>
    );
  };

  const renderSearchResults = () => {
    // Verifica se a busca corresponde exatamente ao nome de uma categoria
    const categoryMatch = categories.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());
    
    const filtered = articles.filter(a => {
        if (categoryMatch) {
            // Se for uma página de categoria, filtra ESTRITAMENTE pela categoria
            return a.category.toLowerCase() === categoryMatch.name.toLowerCase();
        }
        // Caso contrário, mantêm a busca textual padrão
        return a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
               a.category.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <section className="py-16 min-h-[60vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Botão de Voltar ao Site */}
                <button 
                    onClick={() => setView('HOME')}
                    className="mb-6 flex items-center text-azul-600 hover:text-azul-800 transition font-semibold group"
                >
                    <i className="fas fa-arrow-left mr-2 group-hover:-translate-x-1 transition-transform"></i> Voltar ao Site
                </button>

                <div className="mb-8 border-b pb-4">
                    {categoryMatch ? (
                         <>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-azul-100 rounded-lg text-azul-600">
                                    <i className={`fas ${categoryMatch.icon} text-xl`}></i>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800">{categoryMatch.name}</h2>
                            </div>
                            <p className="text-gray-500">{categoryMatch.description}</p>
                         </>
                    ) : (
                        <>
                            <h2 className="text-3xl font-bold text-gray-800">Resultados da Busca</h2>
                            <p className="text-gray-500 mt-2">
                                Exibindo resultados para: <span className="text-azul-700 font-bold">"{searchQuery}"</span>
                            </p>
                        </>
                    )}
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
                        <p className="text-gray-500 mt-2">
                            {categoryMatch 
                                ? "Ainda não há artigos publicados nesta categoria." 
                                : "Tente buscar por outros termos ou categorias."}
                        </p>
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
                <img src={selectedArticle.imageUrl} alt={selectedArticle.title} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = 'https://picsum.photos/800/600?error'}} />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute bottom-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <span className="bg-azul-500 text-white px-4 py-1 rounded text-sm font-bold uppercase mb-4 inline-block">{selectedArticle.category}</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">{selectedArticle.title}</h1>
                        <div className="flex items-center text-white/80 gap-4">
                            <span><i className="fas fa-user mr-2"></i>{selectedArticle.author}</span>
                            <span><i className="far fa-calendar mr-2"></i>{selectedArticle.date}</span>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs"><i className="fas fa-eye mr-1"></i> {selectedArticle.views} views</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
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
        {view === 'LOGIN' && <Login onLogin={handleLoginSuccess} onCancel={() => setView('HOME')} />}
        {view === 'ABOUT' && <About onNavigate={handleNavigate} />}
        {view === 'ADMIN' && (
            <AdminPanel 
                onPublish={handlePublish} 
                categories={categories} 
                onAddCategory={handleAddCategory} 
                onDeleteCategory={handleDeleteCategory}
                banners={banners}
                onUpdateBanners={() => {}} 
                onAddBanner={handleAddBanner}
                onDeleteBanner={handleDeleteBanner}
                articles={articles}
                onExit={() => setView('HOME')} // Passando a função de saída
                onDeleteArticle={handleDeleteArticle} // Nova prop
            />
        )}
        {view === 'SEARCH_RESULTS' && renderSearchResults()}
        {view === 'ARTICLE_DETAIL' && renderArticleDetail()}
      </div>

      <footer className="bg-azul-900 text-white py-12 border-t-4 border-azul-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
                <img 
                    src="https://azul360parceiros.com.br/wp-content/uploads/2026/01/parceiros-scaled.png" 
                    alt="Azul 360 Parceiros" 
                    className="h-12 w-auto mb-4 object-contain brightness-0 invert"
                />
                <p className="text-gray-400 text-sm leading-relaxed">
                    O Portal Azul 360º Parceiros é mantido pela Azul 360º e reúne conteúdo exclusivo para acelerar o crescimento do seu negócio.
                </p>
            </div>
            
            <div className="col-span-1">
                <h4 className="font-bold mb-4 uppercase text-sm tracking-wider text-azul-500">Categorias</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <a href="#" onClick={() => { setSearchQuery(cat.name); setView('SEARCH_RESULTS'); }} className="hover:text-white transition flex items-center gap-2">
                                <i className={`fas ${cat.icon || 'fa-tag'} text-xs opacity-70`}></i>
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
                    <li><a href="#" onClick={() => setView('ABOUT')} className="hover:text-white transition cursor-pointer">Sobre</a></li>
                    <li><a href="#" onClick={() => setView('HOME')} className="hover:text-white transition cursor-pointer">Blog</a></li>
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