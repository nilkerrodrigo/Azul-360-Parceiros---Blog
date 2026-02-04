import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateExcerpt, generateBlogPost } from '../services/geminiService';
import { uploadImage, getUsers, addUser, deleteUser } from '../services/apiService';
import { Article, Category, Banner, User } from '../types';
import { marked } from 'https://esm.sh/marked@12.0.2';

interface AdminPanelProps {
  onPublish: (article: Article) => Promise<void>;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  banners: Banner[];
  onUpdateBanners: (banners: Banner[]) => void; 
  onAddBanner: (banner: Banner) => Promise<void>;
  onDeleteBanner: (id: string) => void;
  articles: Article[];
  onExit: () => void; 
  onDeleteArticle: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onPublish, 
    categories, 
    onAddCategory, 
    onDeleteCategory,
    banners,
    onAddBanner,
    onDeleteBanner,
    articles,
    onExit,
    onDeleteArticle
}) => {
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'ARTICLE' | 'BANNERS' | 'USERS'>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);
  
  // Ref para o div contentEditable do conteúdo do artigo
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });

  useEffect(() => {
      if (activeTab === 'USERS') {
          fetchUsers();
      }
  }, [activeTab]);

  const fetchUsers = async () => {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
  };

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: categories[0]?.name || '',
    content: '',
    author: 'Equipe Azul 360',
    imageUrl: '',
    imageFile: null as File | null
  });

  // Sincroniza o conteúdo HTML com o estado quando muda externamente (ex: IA gerou texto)
  useEffect(() => {
    if (contentEditableRef.current && formData.content !== contentEditableRef.current.innerHTML) {
        contentEditableRef.current.innerHTML = formData.content;
    }
  }, [formData.content]);


  const [newBanner, setNewBanner] = useState({
      title: '',
      subtitle: '',
      image: '',
      imageFile: null as File | null,
      cta: 'Saiba Mais',
      link: ''
  });

  const handleAddCategorySubmit = (e: React.MouseEvent) => {
      e.preventDefault();
      if(newCategoryName.trim()) {
          onAddCategory(newCategoryName);
          setFormData({...formData, category: newCategoryName});
          setNewCategoryName('');
          setShowCatInput(false);
      }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'ARTICLE' | 'BANNER') => {
      const file = e.target.files?.[0];
      if (file) {
          const objectUrl = URL.createObjectURL(file);
          if (type === 'ARTICLE') {
              setFormData({ ...formData, imageUrl: objectUrl, imageFile: file });
          } else {
              setNewBanner({ ...newBanner, image: objectUrl, imageFile: file });
          }
      }
  };

  const handleGenerateContent = async () => {
      if (!formData.title) {
          alert("Por favor, digite um título ou tópico primeiro para a IA saber sobre o que escrever.");
          return;
      }
      
      setIsGeneratingAI(true);
      try {
          const generatedMarkdownContent = await generateBlogPost(formData.title, formData.category);
          const generatedHtmlContent = marked.parse(generatedMarkdownContent); 
          setFormData(prev => ({ ...prev, content: generatedHtmlContent }));

          const generatedExcerpt = await generateExcerpt(generatedMarkdownContent);
          setFormData(prev => ({ ...prev, excerpt: generatedExcerpt }));

      } catch (error) {
          alert("Erro ao gerar conteúdo com IA.");
      } finally {
          setIsGeneratingAI(false);
      }
  };

  const applyFormatting = useCallback((command: string, value?: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    document.execCommand(command, false, value);
    
    // Força o foco de volta e atualiza o estado
    if (contentEditableRef.current) {
        contentEditableRef.current.focus();
        setFormData(prev => ({ ...prev, content: contentEditableRef.current!.innerHTML }));
    }
  }, []);

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (contentEditableRef.current) {
        setFormData(prev => ({ ...prev, content: contentEditableRef.current!.innerHTML }));
    }

    // Pequeno delay para garantir que o estado atualizou
    setTimeout(async () => {
        const currentContent = contentEditableRef.current ? contentEditableRef.current.innerHTML : formData.content;

        if (!formData.title || !currentContent) return;
        setIsUploading(true);

        try {
            let finalImageUrl = formData.imageUrl;
            if (formData.imageFile) {
                finalImageUrl = await uploadImage(formData.imageFile);
            } else if (!finalImageUrl) {
                finalImageUrl = `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
            }

            let finalExcerpt = formData.excerpt;
            if (!finalExcerpt || finalExcerpt === "Resumo automático indisponível.") {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = currentContent;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                finalExcerpt = textContent.substring(0, 160) + (textContent.length > 160 ? '...' : '');
            }

            const newArticle: Article = {
                id: '', 
                title: formData.title,
                content: currentContent,
                category: formData.category,
                imageUrl: finalImageUrl,
                author: formData.author,
                date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
                excerpt: finalExcerpt,
                views: 0
            };

            await onPublish(newArticle);
            alert('Artigo publicado com sucesso!');
            setFormData({
                title: '',
                excerpt: '', 
                category: categories[0]?.name || '',
                content: '',
                author: 'Equipe Azul 360',
                imageUrl: '',
                imageFile: null
            });
            if (contentEditableRef.current) contentEditableRef.current.innerHTML = '';
            setActiveTab('DASHBOARD');
        } catch (error) {
            console.error("Failed to publish", error);
            alert("Erro ao publicar artigo. Verifique a conexão.");
        } finally {
            setIsUploading(false);
        }
    }, 100);
  };

  const handleAddBannerSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBanner.title || !newBanner.image) {
          alert("Título e Imagem são obrigatórios");
          return;
      }
      setIsUploading(true);

      try {
        let finalImageUrl = newBanner.image;
        if (newBanner.imageFile) {
            finalImageUrl = await uploadImage(newBanner.imageFile);
        }

        const bannerToAdd: Banner = {
            id: '', 
            title: newBanner.title,
            subtitle: newBanner.subtitle,
            image: finalImageUrl,
            cta: newBanner.cta,
            link: newBanner.link,
            clicks: 0
        };

        await onAddBanner(bannerToAdd);
        setNewBanner({ title: '', subtitle: '', image: '', imageFile: null, cta: 'Saiba Mais', link: '' });
      } catch (error) {
        alert("Erro ao adicionar banner.");
      } finally {
          setIsUploading(false);
      }
  };

  const handleAddUser = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newUser.name || !newUser.email || !newUser.password) {
          alert("Preencha todos os campos.");
          return;
      }
      setIsUploading(true);
      try {
          await addUser(newUser.name, newUser.email, newUser.password);
          setNewUser({ name: '', email: '', password: '' });
          await fetchUsers();
          alert("Usuário adicionado com sucesso!");
      } catch (e) {
          alert("Erro ao adicionar usuário.");
      } finally {
          setIsUploading(false);
      }
  };

  const handleDeleteUser = async (id: string) => {
      if(window.confirm("Tem certeza que deseja remover este usuário?")) {
          await deleteUser(id);
          await fetchUsers();
      }
  };

  const handleDeleteArticle = (id: string) => {
      if(window.confirm("Tem certeza que deseja excluir este artigo permanentemente?")) {
          onDeleteArticle(id);
      }
  };

  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalBannerClicks = banners.reduce((acc, curr) => acc + (curr.clicks || 0), 0);
  const mostReadArticle = [...articles].sort((a, b) => (b.views || 0) - (a.views || 0))[0];

  const filteredArticles = categoryFilter === 'Todas' 
      ? articles 
      : articles.filter(article => article.category === categoryFilter);

  // Botão Toolbar Helper
  const ToolbarButton = ({ command, value, icon, label, title }: any) => (
      <button 
        type="button" 
        onClick={() => applyFormatting(command, value)} 
        className="p-2 text-gray-600 hover:text-azul-600 hover:bg-azul-50 rounded transition flex items-center justify-center min-w-[32px]"
        title={title}
      >
          {icon && <i className={`fas ${icon} ${label ? 'mr-1' : ''}`}></i>}
          {label && <span className="font-bold text-sm">{label}</span>}
      </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-7xl mx-auto my-10 border border-gray-100 relative">
      
      {/* CSS Específico para o Editor Visual estilo Word */}
      <style>{`
        .editor-content {
            min-height: 400px;
            outline: none;
            line-height: 1.6;
            color: #374151;
        }
        .editor-content:empty:before {
            content: attr(data-placeholder);
            color: #9ca3af;
            pointer-events: none;
            display: block; /* Garante que apareça */
        }
        /* Estilos para simular documento */
        .editor-content h1 { font-size: 2em; font-weight: 800; margin-top: 0.8em; margin-bottom: 0.4em; color: #111; line-height: 1.2; }
        .editor-content h2 { font-size: 1.5em; font-weight: 700; margin-top: 0.8em; margin-bottom: 0.4em; color: #333; }
        .editor-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .editor-content ol { list-style-type: decimal; padding-left: 1.5em; margin-bottom: 1em; }
        .editor-content p { margin-bottom: 1em; }
        .editor-content blockquote { border-left: 4px solid #3b82f6; padding-left: 1em; margin-left: 0; color: #4b5563; font-style: italic; }
        .editor-content b, .editor-content strong { font-weight: bold; }
        .editor-content i, .editor-content em { font-style: italic; }
        .editor-content a { color: #2563eb; text-decoration: underline; }
      `}</style>

      {(isUploading || isGeneratingAI) && (
          <div className="absolute inset-0 bg-white/90 z-50 flex items-center justify-center rounded-lg backdrop-blur-sm">
              <div className="text-center">
                  {isGeneratingAI ? (
                       <i className="fas fa-magic fa-spin text-5xl text-purple-600 mb-4"></i>
                  ) : (
                       <i className="fas fa-cloud-upload-alt fa-bounce text-5xl text-azul-500 mb-4"></i>
                  )}
                  <p className="font-bold text-xl text-gray-800">
                      {isGeneratingAI ? 'Aguarde, a IA está criando o conteúdo...' : 'Processando solicitação...'}
                  </p>
                  {isGeneratingAI && <p className="text-sm text-gray-500 mt-2">Isto pode levar alguns instantes.</p>}
              </div>
          </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b pb-4 gap-4">
        <div className="w-full md:w-auto">
            <div className="flex justify-between items-center w-full">
                <h2 className="text-3xl font-bold text-azul-900">Painel Administrativo</h2>
                
                {/* Botão Voltar ao Site (Mobile) */}
                <button 
                    onClick={onExit}
                    className="md:hidden text-sm font-bold text-gray-500 hover:text-azul-900 flex items-center gap-2 border px-3 py-1 rounded-lg"
                >
                    <i className="fas fa-sign-out-alt"></i> Sair
                </button>
            </div>
            
            <div className="flex gap-4 mt-4 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('DASHBOARD')}
                    className={`pb-2 px-1 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === 'DASHBOARD' ? 'text-azul-500 border-b-2 border-azul-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Dashboard
                </button>
                <button 
                    onClick={() => setActiveTab('ARTICLE')}
                    className={`pb-2 px-1 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === 'ARTICLE' ? 'text-azul-500 border-b-2 border-azul-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Novo Artigo
                </button>
                <button 
                    onClick={() => setActiveTab('BANNERS')}
                    className={`pb-2 px-1 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === 'BANNERS' ? 'text-azul-500 border-b-2 border-azul-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Banners
                </button>
                <button 
                    onClick={() => setActiveTab('USERS')}
                    className={`pb-2 px-1 text-sm font-bold uppercase tracking-wider transition whitespace-nowrap ${activeTab === 'USERS' ? 'text-azul-500 border-b-2 border-azul-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Usuários
                </button>
            </div>
        </div>

        {/* Botão Voltar ao Site (Desktop) */}
        <button 
            onClick={onExit}
            className="hidden md:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-azul-900 transition font-semibold text-sm"
        >
            <i className="fas fa-arrow-left"></i> Voltar ao Site
        </button>
      </div>

      {activeTab === 'DASHBOARD' && (
          <div className="animate-fade-in space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-azul-500 to-azul-700 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-blue-100 text-sm font-bold uppercase">Total de Visualizações</p>
                              <h3 className="text-3xl font-bold">{totalViews}</h3>
                          </div>
                          <div className="p-2 bg-white/20 rounded-lg">
                              <i className="fas fa-eye"></i>
                          </div>
                      </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl p-6 text-white shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                          <div>
                              <p className="text-purple-100 text-sm font-bold uppercase">Cliques em Banners</p>
                              <h3 className="text-3xl font-bold">{totalBannerClicks}</h3>
                          </div>
                          <div className="p-2 bg-white/20 rounded-lg">
                              <i className="fas fa-mouse-pointer"></i>
                          </div>
                      </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                      <p className="text-gray-500 text-xs font-bold uppercase mb-2">Artigo Mais Lido</p>
                      <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">{mostReadArticle?.title || "Nenhum dado"}</h3>
                      <div className="flex items-center text-azul-500 text-sm font-bold">
                          <i className="fas fa-chart-line mr-2"></i>
                          {mostReadArticle?.views || 0} acessos
                      </div>
                  </div>
              </div>

              {/* Table of Articles with Filter */}
              <div>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                      <h3 className="text-xl font-bold text-gray-800">Desempenho dos Artigos</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 font-semibold">Filtrar por:</span>
                        <select 
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="p-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-azul-500 outline-none text-gray-700 font-medium"
                        >
                            <option value="Todas">Todas as Categorias</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                      </div>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                  <th className="p-4 font-semibold w-5/12">Título</th>
                                  <th className="p-4 font-semibold w-2/12">Categoria</th>
                                  <th className="p-4 font-semibold w-2/12">Autor</th>
                                  <th className="p-4 font-semibold w-1/12 text-center">Views</th>
                                  <th className="p-4 font-semibold w-2/12 text-right">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {filteredArticles.length > 0 ? filteredArticles.map((article) => (
                                  <tr key={article.id} className="border-b hover:bg-gray-50 transition">
                                      <td className="p-4 font-medium text-gray-800">{article.title}</td>
                                      <td className="p-4">
                                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{article.category}</span>
                                      </td>
                                      <td className="p-4 text-gray-500">{article.author}</td>
                                      <td className="p-4 text-center font-bold text-azul-700">{article.views || 0}</td>
                                      <td className="p-4 text-right">
                                          <button 
                                            onClick={() => handleDeleteArticle(article.id)}
                                            className="text-red-500 hover:text-red-700 font-bold text-xs uppercase border border-red-200 px-3 py-1 rounded hover:bg-red-50 transition"
                                            title="Excluir Artigo"
                                          >
                                            <i className="fas fa-trash mr-1"></i> Remover
                                          </button>
                                      </td>
                                  </tr>
                              )) : (
                                  <tr>
                                      <td colSpan={5} className="p-8 text-center text-gray-400">
                                          Nenhum artigo encontrado nesta categoria.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'ARTICLE' && (
        <form onSubmit={handleArticleSubmit} className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Título / Tópico</label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-transparent transition"
                        placeholder="Ex: Tendências de Ecoturismo para 2025"
                        required
                    />
                </div>

                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-semibold text-gray-700">Categoria</label>
                        <button 
                            type="button" 
                            onClick={() => setShowCatInput(!showCatInput)}
                            className="text-xs text-azul-500 font-bold hover:underline"
                        >
                            {showCatInput ? 'Cancelar' : '+ Nova Categoria'}
                        </button>
                    </div>
                    
                    {showCatInput ? (
                        <div className="flex gap-2 mb-2 animate-fade-in items-center">
                            <input 
                                type="text" 
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Nome..."
                                className="flex-1 p-3 border border-gray-300 rounded-lg text-sm"
                                required
                            />
                            <button 
                                type="button"
                                onClick={handleAddCategorySubmit}
                                className="bg-green-500 hover:bg-green-600 text-white w-10 h-10 rounded-lg flex items-center justify-center"
                                title="Salvar"
                            >
                                <i className="fas fa-check"></i>
                            </button>
                            <button 
                                type="button"
                                onClick={() => setShowCatInput(false)}
                                className="bg-red-500 hover:bg-red-600 text-white w-10 h-10 rounded-lg flex items-center justify-center"
                                title="Fechar"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    ) : (
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-transparent transition bg-white"
                        >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                        </select>
                    )}
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Resumo / Subtítulo (Máx. 160 caracteres)</label>
                <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    maxLength={160}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 resize-y"
                    placeholder="Um parágrafo curto e cativante para o seu artigo."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Autor</label>
                    <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Imagem de Capa</label>
                    <div className="flex gap-2 items-center">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'ARTICLE')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-azul-50 file:text-azul-700 hover:file:bg-azul-100"
                        />
                        {formData.imageUrl && (
                            <img src={formData.imageUrl} alt="Preview" className="h-10 w-10 object-cover rounded shadow" />
                        )}
                    </div>
                </div>
            </div>
            
            <div>
                <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-semibold text-gray-700">Conteúdo do Artigo</label>
                    <button 
                        type="button" 
                        onClick={handleGenerateContent}
                        className="text-xs bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-full font-bold transition flex items-center gap-2"
                        disabled={isGeneratingAI}
                    >
                        <i className="fas fa-magic"></i> {isGeneratingAI ? 'Gerando...' : 'Escrever com IA (Gemini 3 Pro)'}
                    </button>
                </div>
                
                {/* Editor Container Style Card/Paper */}
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex flex-col shadow-inner">
                    {/* Toolbar - Estilo Word */}
                    <div className="bg-white border-b border-gray-200 p-2 flex flex-wrap gap-1 items-center sticky top-0 z-10">
                        {/* Histórico */}
                        <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                            <ToolbarButton command="undo" icon="fa-undo" title="Desfazer" />
                            <ToolbarButton command="redo" icon="fa-redo" title="Refazer" />
                        </div>

                        {/* Formatação Básica */}
                        <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                            <ToolbarButton command="bold" icon="fa-bold" title="Negrito" />
                            <ToolbarButton command="italic" icon="fa-italic" title="Itálico" />
                            <ToolbarButton command="formatBlock" value="h1" icon="fa-heading" title="Título Principal" />
                            <ToolbarButton command="formatBlock" value="h2" label="H2" title="Subtítulo" />
                        </div>

                        {/* Listas e Links */}
                        <div className="flex items-center gap-1 pr-2 border-r border-gray-200 mr-1">
                            <ToolbarButton command="insertUnorderedList" icon="fa-list-ul" title="Lista com Marcadores" />
                            <ToolbarButton command="insertOrderedList" icon="fa-list-ol" title="Lista Numerada" />
                            <button 
                                type="button" 
                                onClick={() => {
                                    const url = prompt('URL do link:');
                                    if(url) applyFormatting('createLink', url);
                                }}
                                className="p-2 text-gray-600 hover:text-azul-600 hover:bg-azul-50 rounded transition flex items-center justify-center min-w-[32px]"
                                title="Inserir Link"
                            >
                                <i className="fas fa-link"></i>
                            </button>
                        </div>

                        {/* Alinhamento */}
                        <div className="flex items-center gap-1">
                            <ToolbarButton command="justifyLeft" icon="fa-align-left" title="Alinhar à Esquerda" />
                            <ToolbarButton command="justifyCenter" icon="fa-align-center" title="Centralizar" />
                            <ToolbarButton command="justifyRight" icon="fa-align-right" title="Alinhar à Direita" />
                            <ToolbarButton command="justifyFull" icon="fa-align-justify" title="Justificar" />
                        </div>
                    </div>

                    {/* Área de Edição - Papel */}
                    <div className="p-8 bg-gray-100 cursor-text" onClick={() => contentEditableRef.current?.focus()}>
                        <div
                            ref={contentEditableRef}
                            contentEditable="true"
                            onInput={(e) => setFormData({ ...formData, content: e.currentTarget.innerHTML })}
                            className="editor-content w-full bg-white shadow-md p-8 min-h-[500px] rounded"
                            data-placeholder="Comece a escrever seu artigo aqui... Selecione um texto para formatar."
                        ></div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
            <button
                type="submit"
                className="px-8 py-4 bg-azul-900 text-white font-bold rounded-lg hover:bg-azul-700 transition-colors shadow-lg flex items-center gap-2"
                disabled={isUploading || isGeneratingAI}
            >
                <i className="fas fa-paper-plane"></i> Publicar Artigo
            </button>
            </div>
        </form>
      )}
      
      {activeTab === 'BANNERS' && (
         <div className="animate-fade-in space-y-8">
            <div className="grid grid-cols-1 gap-6">
                {banners.map((banner) => (
                    <div key={banner.id} className="relative group rounded-xl overflow-hidden shadow-md border border-gray-200">
                        <div className="h-40 w-full relative">
                            <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40"></div>
                            <div className="absolute inset-0 flex items-center p-6">
                                <div className="text-white">
                                    <h3 className="text-xl font-bold">{banner.title}</h3>
                                    <p className="text-sm opacity-90">{banner.subtitle}</p>
                                    <span className="inline-block mt-2 text-xs bg-white/20 px-2 py-1 rounded">{banner.cta}</span>
                                    {banner.link && <p className="text-xs text-blue-200 mt-1 truncate max-w-md"><i className="fas fa-link mr-1"></i> {banner.link}</p>}
                                </div>
                            </div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center">
                                    <i className="fas fa-mouse-pointer mr-1"></i> {banner.clicks || 0}
                                </div>
                                <button 
                                onClick={() => onDeleteBanner(banner.id)}
                                className="bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition"
                            >
                                <i className="fas fa-trash"></i>
                            </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <i className="fas fa-plus-circle text-azul-500"></i> Adicionar Novo Banner
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Upload da Imagem</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'BANNER')}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-azul-50 file:text-azul-700 hover:file:bg-azul-100"
                        />
                        {newBanner.image && <p className="text-xs text-green-600 mt-1"><i className="fas fa-check-circle"></i> Imagem carregada</p>}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                            type="text" 
                            placeholder="Título da Campanha"
                            className="p-3 border rounded-lg w-full"
                            value={newBanner.title}
                            onChange={(e) => setNewBanner({...newBanner, title: e.target.value})}
                            required
                        />
                        <input 
                            type="text" 
                            placeholder="Subtítulo / Descrição Curta"
                            className="p-3 border rounded-lg w-full"
                            value={newBanner.subtitle}
                            onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input 
                            type="text" 
                            placeholder="Texto do Botão (Ex: Saiba Mais)"
                            className="p-3 border rounded-lg w-full"
                            value={newBanner.cta}
                            onChange={(e) => setNewBanner({...newBanner, cta: e.target.value})}
                            required
                        />
                         <input 
                            type="url" 
                            placeholder="Link de Destino (https://...)"
                            className="p-3 border rounded-lg w-full"
                            value={newBanner.link}
                            onChange={(e) => setNewBanner({...newBanner, link: e.target.value})}
                        />
                    </div>
                    <button 
                    onClick={handleAddBannerSubmit}
                    className="w-full bg-azul-900 text-white font-bold py-3 rounded-lg hover:bg-azul-700 transition"
                    >
                        Adicionar Banner
                    </button>
                </div>
            </div>
         </div>
      )}

      {activeTab === 'USERS' && (
          <div className="animate-fade-in space-y-8">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <i className="fas fa-user-plus text-azul-500"></i> Adicionar Novo Administrador
                  </h3>
                  <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input
                        type="text"
                        placeholder="Nome"
                        className="p-3 border rounded-lg w-full"
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        required
                      />
                      <input
                        type="email"
                        placeholder="E-mail"
                        className="p-3 border rounded-lg w-full"
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        required
                      />
                      <input
                        type="password"
                        placeholder="Senha"
                        className="p-3 border rounded-lg w-full"
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        required
                      />
                      <button 
                        type="submit"
                        className="md:col-span-3 bg-azul-900 text-white font-bold py-3 rounded-lg hover:bg-azul-700 transition"
                      >
                        Cadastrar Usuário
                      </button>
                  </form>
              </div>
              <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Equipe Cadastrada</h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-left border-collapse">
                          <thead>
                              <tr className="bg-gray-50 text-gray-600 text-sm border-b">
                                  <th className="p-4 font-semibold">Nome</th>
                                  <th className="p-4 font-semibold">E-mail</th>
                                  <th className="p-4 font-semibold text-right">Ações</th>
                              </tr>
                          </thead>
                          <tbody className="text-sm">
                              {users.length > 0 ? users.map((user) => (
                                  <tr key={user.id} className="border-b hover:bg-gray-50 transition">
                                      <td className="p-4 font-medium text-gray-800">{user.name}</td>
                                      <td className="p-4 text-gray-500">{user.email}</td>
                                      <td className="p-4 text-right">
                                          <button 
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="text-red-500 hover:text-red-700 font-bold text-xs uppercase border border-red-200 px-2 py-1 rounded hover:bg-red-50 transition"
                                          >
                                            <i className="fas fa-trash mr-1"></i> Remover
                                          </button>
                                      </td>
                                  </tr>
                              )) : (
                                  <tr>
                                      <td colSpan={3} className="p-8 text-center text-gray-400">
                                          Nenhum usuário extra encontrado no banco de dados.
                                      </td>
                                  </tr>
                              )}
                          </tbody>
                      </table>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;