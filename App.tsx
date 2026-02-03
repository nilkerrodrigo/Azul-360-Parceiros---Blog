import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ArticleCard from './components/ArticleCard';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import BannerSlider from './components/BannerSlider';
import About from './components/About';
import { Article, ViewState, Category, Banner, Comment } from './types';
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
    deleteArticle,
    getComments,
    addComment,
    incrementArticleLike
} from './services/apiService';
import { supabase } from './supabaseClient';

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  
  // State driven by API
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Initial Data Fetch
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        setIsAuthenticated(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAuthenticated(!!session);
    });

    loadData();

    return () => subscription.unsubscribe();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
        const [fetchedArticles, fetchedCategories, fetchedBanners] = await Promise.all([
            getArticles(),
            getCategories(),
            getBanners()
        ]);
        
        setArticles(fetchedArticles);
        setCategories(fetchedCategories);
        setBanners(fetchedBanners);
    } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(`Falha ao carregar dados: ${error.message || 'Erro desconhecido'}`);
    } finally {
        setLoading(false);
    }
  };

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

  const handleArticleClick = async (article: Article) => {
    setSelectedArticle({ ...article, views: (article.views || 0) + 1 });
    setView('ARTICLE_DETAIL');
    incrementArticleView(article.id);
    
    // Carrega comentários
    const fetchedComments = await getComments(article.id);
    setComments(fetchedComments);
  };

  const handleBannerClick = (id: string) => {
    incrementBannerClick(id);
  };

  // --- Render Functions ---

  const renderHome = () => {
    // articles array is already sorted by latest (publish_date DESC)
    const featured = articles[0]; // Main featured article
    const sideArticles = articles.slice(1, 4); // 3 articles for the side list
    const recentArticles = articles.slice(0, 6); // Top 6 most recent articles for the main recent articles grid

    // Condição para exibir o excerpt na Hero Section
    const shouldShowHeroExcerpt = featured?.excerpt && featured.excerpt !== "Resumo automático indisponível." && featured.excerpt.trim() !== "";

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
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {featured.title}
                  </h1>
                  {shouldShowHeroExcerpt && (
                      <p className="text-gray-200 mb-6 line-clamp-2 text-lg hidden md:block">{featured.excerpt}</p>
                  )}
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
                 {sideArticles.length > 0 ? sideArticles.map(article => (
                    <ArticleCard 
                        key={article.id} 
                        article={article} 
                        layout="horizontal" 
                        onClick={handleArticleClick} 
                    />
                 )) : (
                    <div className="text-center text-gray-400 py-5">
                       Nenhum destaque adicional no momento.
                    </div>
                 )}
                 
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
             <div className="text-center mb-12 px-4">
                 <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">Escolha sua próxima leitura <span className="text-azul-500 block md:inline">por assunto</span></h2>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {categories.length > 0 ? categories.map(cat => (
                    <div key={cat.id} onClick={() => handleSearch(cat.name)} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer flex flex-col items-center text-center group border border-transparent hover:border-azul-200 h-full">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-azul-500 group-hover:text-white transition-colors flex-shrink-0">
                            <i className={`fas ${cat.icon || 'fa-tag'} text-xl text-gray-600 group-hover:text-white`}></i>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">{cat.name}</h3>
                        <p className="text-xs text-gray-500 line-clamp-3">{cat.description}</p>
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
    const categoryMatch = categories.find(c => c.name.toLowerCase() === searchQuery.toLowerCase());
    const filtered = articles.filter(a => {
        if (categoryMatch) {
            return a.category.toLowerCase() === categoryMatch.name.toLowerCase();
        }
        return a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
               a.category.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <section className="py-16 min-h-[60vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

  const ArticleDetailView = ({ article, onBack, comments, onAddComment, onLike }) => {
     const [liked, setLiked] = useState(false);
     const [commentName, setCommentName] = useState('');
     const [commentText, setCommentText] = useState('');
     const [isSubmittingComment, setIsSubmittingComment] = useState(false);
     const [likeCount, setLikeCount] = useState(article.likes || 0);

     // Check if user already liked this session
     useEffect(() => {
         const hasLiked = localStorage.getItem(`liked_${article.id}`);
         if (hasLiked) setLiked(true);
     }, [article.id]);

     const handleLike = () => {
         if (liked) return;
         setLiked(true);
         setLikeCount(prev => prev + 1);
         localStorage.setItem(`liked_${article.id}`, 'true');
         onLike(article.id);
     };

     const handleSubmitComment = async (e) => {
         e.preventDefault();
         if (!commentName.trim() || !commentText.trim()) return;
         setIsSubmittingComment(true);
         await onAddComment(article.id, commentName, commentText);
         setCommentName('');
         setCommentText('');
         setIsSubmittingComment(false);
     };

     // Condição para exibir o excerpt
     const shouldShowExcerpt = article.excerpt && article.excerpt !== "Resumo automático indisponível." && article.excerpt.trim() !== "";

     // URLs de compartilhamento
     // Usa window.location.origin para garantir que a URL base seja correta
     const articleShareUrl = `${window.location.origin}/?view=ARTICLE_DETAIL&articleId=${article.id}`;
     const encodedTitle = encodeURIComponent(article.title);
     const encodedExcerpt = encodeURIComponent(article.excerpt || article.title);

     const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${articleShareUrl}`;
     const twitterShareUrl = `https://twitter.com/intent/tweet?url=${articleShareUrl}&text=${encodedTitle}`;
     const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodedTitle}%20-%20${articleShareUrl}`;

     return (
        <article className="bg-white min-h-screen pb-20">
            <div className="h-[400px] w-full relative">
                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" onError={(e) => {e.currentTarget.src = 'https://picsum.photos/800/600?error'}} />
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="absolute bottom-0 w-full p-8 md:p-16">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <span className="bg-azul-500 text-white px-4 py-1 rounded text-sm font-bold uppercase mb-4 inline-block">{article.category}</span>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 max-w-4xl">{article.title}</h1>
                        <div className="flex items-center text-white/80 gap-4">
                            <span><i className="fas fa-user mr-2"></i>{article.author}</span>
                            <span><i className="far fa-calendar mr-2"></i>{article.date}</span>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs"><i className="fas fa-eye mr-1"></i> {article.views} views</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10">
                <div className="bg-white rounded-xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
                    {/* Content */}
                    {shouldShowExcerpt && (
                        <p className="text-xl text-gray-600 font-serif leading-relaxed mb-8 border-l-4 border-azul-500 pl-4 italic">
                            {article.excerpt}
                        </p>
                    )}
                    {/* Renderiza o conteúdo HTML diretamente */}
                    <div 
                        className="prose prose-lg prose-blue max-w-none text-gray-700" 
                        dangerouslySetInnerHTML={{ __html: article.content }} 
                    />
                    
                    {/* Like & Share Section */}
                    <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={handleLike}
                                disabled={liked}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition transform active:scale-95 ${liked ? 'bg-red-50 text-red-500 cursor-default' : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-500'}`}
                            >
                                <i className={`fas fa-heart ${liked ? '' : 'animate-pulse'}`}></i>
                                {liked ? 'Você curtiu' : 'Curtir'}
                                <span className="ml-1 bg-white px-2 py-0.5 rounded-full text-xs shadow-sm border">{likeCount}</span>
                            </button>
                        </div>
                        
                        <div className="flex gap-4">
                            <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-azul-100 text-azul-900 flex items-center justify-center transition" title="Compartilhar no Facebook"><i className="fab fa-facebook-f"></i></a>
                            <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-azul-100 text-azul-900 flex items-center justify-center transition" title="Compartilhar no X (Twitter)"><i className="fab fa-twitter"></i></a>
                            <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-azul-100 text-azul-900 flex items-center justify-center transition" title="Compartilhar no WhatsApp"><i className="fab fa-whatsapp"></i></a>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="mt-16 bg-gray-50 p-8 rounded-xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6"><i className="far fa-comments mr-2"></i> Comentários ({comments.length})</h3>
                        
                        {/* Comments List */}
                        <div className="space-y-6 mb-10 max-h-[500px] overflow-y-auto pr-2">
                            {comments.length > 0 ? comments.map(comment => (
                                <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <h5 className="font-bold text-azul-900">{comment.authorName}</h5>
                                        <span className="text-xs text-gray-400">{comment.createdAt}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{comment.content}</p>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-sm italic">Seja o primeiro a comentar!</p>
                            )}
                        </div>

                        {/* Add Comment Form */}
                        <form onSubmit={handleSubmitComment} className="border-t pt-6">
                            <h4 className="font-bold text-gray-700 mb-4">Deixe seu comentário</h4>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    placeholder="Seu Nome"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 outline-none"
                                    value={commentName}
                                    onChange={(e) => setCommentName(e.target.value)}
                                    required
                                />
                                <textarea 
                                    placeholder="Escreva sua mensagem..."
                                    rows={3}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 outline-none resize-none"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    required
                                />
                                <button 
                                    type="submit" 
                                    disabled={isSubmittingComment}
                                    className="bg-azul-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-azul-600 transition disabled:opacity-50"
                                >
                                    {isSubmittingComment ? 'Enviando...' : 'Enviar Comentário'}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="mt-8 text-center">
                        <button onClick={onBack} className="text-azul-900 font-bold hover:underline">
                            <i className="fas fa-arrow-left mr-2"></i> Voltar para Home
                        </button>
                    </div>
                </div>
            </div>
        </article>
     );
  };

  const handleAddComment = async (articleId: string, name: string, text: string) => {
     await addComment(articleId, name, text);
     // Refresh comments
     const refreshedComments = await getComments(articleId);
     setComments(refreshedComments);
  };

  if (loading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <i className="fas fa-circle-notch fa-spin text-4xl text-azul-500 mb-4"></i>
                  <p className="text-gray-600">Carregando conteúdo do Supabase...</p>
              </div>
          </div>
      );
  }

  if (error) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
              <div className="text-center max-w-lg bg-white p-8 rounded-xl shadow-lg border border-red-100">
                  <i className="fas fa-wifi text-4xl text-red-400 mb-4"></i>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Erro de Conexão</h2>
                  <div className="bg-gray-100 p-3 rounded text-left text-xs text-gray-600 font-mono mb-6 overflow-x-auto">
                      {error}
                  </div>
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
                onExit={() => setView('HOME')} 
                onDeleteArticle={handleDeleteArticle} 
            />
        )}
        {view === 'SEARCH_RESULTS' && renderSearchResults()}
        {view === 'ARTICLE_DETAIL' && selectedArticle && (
            <ArticleDetailView 
                article={selectedArticle} 
                onBack={() => setView('HOME')}
                comments={comments}
                onAddComment={handleAddComment}
                onLike={incrementArticleLike}
            />
        )}
      </div>

      <footer className="bg-azul-900 text-white py-12 border-t-4 border-azul-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-center md:text-left">
            <div className="col-span-1 md:col-span-1">
                <img 
                    src="https://azul360parceiros.com.br/wp-content/uploads/2026/01/parceiros-scaled.png" 
                    alt="Azul 360 Parceiros" 
                    className="h-12 w-auto mb-4 object-contain brightness-0 invert mx-auto md:mx-0"
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
                            <a href="#" onClick={() => { setSearchQuery(cat.name); setView('SEARCH_RESULTS'); }} className="hover:text-white transition flex items-center justify-center md:justify-start gap-2">
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
                <div className="flex flex-col gap-3 items-center md:items-start">
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