import React, { useState } from 'react';
import { generateBlogPost, generateExcerpt } from '../services/geminiService';
import { Article, Category, Banner } from '../types';

interface AdminPanelProps {
  onPublish: (article: Article) => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onDeleteCategory: (id: string) => void;
  banners: Banner[];
  onUpdateBanners: (banners: Banner[]) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    onPublish, 
    categories, 
    onAddCategory, 
    onDeleteCategory,
    banners,
    onUpdateBanners
}) => {
  const [activeTab, setActiveTab] = useState<'ARTICLE' | 'BANNERS'>('ARTICLE');
  const [isLoading, setIsLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showCatInput, setShowCatInput] = useState(false);
  
  // Article Form State
  const [formData, setFormData] = useState({
    title: '',
    category: categories[0]?.name || '',
    content: '',
    author: 'Equipe Azul 360',
    imageUrl: ''
  });

  // New Banner State
  const [newBanner, setNewBanner] = useState({
      title: '',
      subtitle: '',
      image: '',
      cta: 'Saiba Mais'
  });

  const handleGenerate = async () => {
    if (!formData.title) {
      alert("Por favor, insira um título ou tópico para a IA gerar o conteúdo.");
      return;
    }

    setIsLoading(true);
    try {
      const content = await generateBlogPost(formData.title, formData.category);
      setFormData(prev => ({ ...prev, content }));
      setGenerated(true);
    } catch (error) {
      alert("Erro ao gerar conteúdo. Verifique sua chave de API.");
    } finally {
      setIsLoading(false);
    }
  };

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
              setFormData({ ...formData, imageUrl: objectUrl });
          } else {
              setNewBanner({ ...newBanner, image: objectUrl });
          }
      }
  };

  const handleArticleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    const img = formData.imageUrl || `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
    const excerpt = await generateExcerpt(formData.content);

    const newArticle: Article = {
      id: Date.now().toString(),
      title: formData.title,
      content: formData.content,
      category: formData.category,
      imageUrl: img,
      author: formData.author,
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
      excerpt: excerpt,
    };

    onPublish(newArticle);
    alert('Artigo publicado com sucesso!');
    setFormData({
        title: '',
        category: categories[0]?.name || '',
        content: '',
        author: 'Equipe Azul 360',
        imageUrl: ''
    });
    setGenerated(false);
  };

  const handleAddBanner = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newBanner.title || !newBanner.image) {
          alert("Título e Imagem são obrigatórios");
          return;
      }

      const bannerToAdd: Banner = {
          id: Date.now(),
          title: newBanner.title,
          subtitle: newBanner.subtitle,
          image: newBanner.image,
          cta: newBanner.cta
      };

      onUpdateBanners([...banners, bannerToAdd]);
      setNewBanner({ title: '', subtitle: '', image: '', cta: 'Saiba Mais' });
  };

  const handleDeleteBanner = (id: number) => {
      onUpdateBanners(banners.filter(b => b.id !== id));
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto my-10 border border-gray-100">
      
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 border-b pb-4 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-azul-900">Painel Administrativo</h2>
            <div className="flex gap-4 mt-4">
                <button 
                    onClick={() => setActiveTab('ARTICLE')}
                    className={`pb-2 px-1 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'ARTICLE' ? 'text-azul-500 border-b-2 border-azul-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Novo Artigo
                </button>
                <button 
                    onClick={() => setActiveTab('BANNERS')}
                    className={`pb-2 px-1 text-sm font-bold uppercase tracking-wider transition ${activeTab === 'BANNERS' ? 'text-azul-500 border-b-2 border-azul-500' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    Gerenciar Banners
                </button>
            </div>
        </div>
        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-white px-4 py-2 rounded-full border border-blue-200">
             <i className="fas fa-sparkles text-yellow-500"></i>
             <span className="text-sm font-semibold text-azul-900">Powered by Gemini 3 Pro</span>
        </div>
      </div>

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
                    <>
                    <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-transparent transition bg-white"
                    >
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                    </select>
                    
                    {/* Category Management List */}
                    <div className="mt-3 flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <span key={cat.id} className="inline-flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs text-gray-600 border border-gray-200">
                                {cat.name}
                                <button 
                                    type="button" 
                                    onClick={() => onDeleteCategory(cat.id)}
                                    className="text-red-400 hover:text-red-600 ml-1"
                                    title="Excluir categoria"
                                >
                                    <i className="fas fa-trash-alt text-[10px]"></i>
                                </button>
                            </span>
                        ))}
                    </div>
                    </>
                )}
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Autor</label>
                    <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500"
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
            
            {/* AI Action Area */}
            {!generated && (
                <div className="bg-azul-50 p-6 rounded-xl border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-azul-900">
                        <h4 className="font-bold"><i className="fas fa-magic mr-2"></i>Assistente de Escrita AI</h4>
                        <p className="text-sm opacity-80">Deixe o Gemini criar um rascunho completo baseado no título acima.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isLoading || !formData.title}
                        className={`px-6 py-3 rounded-lg font-bold text-white shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-azul-700 to-azul-500 hover:shadow-azul-500/30'}`}
                    >
                        {isLoading ? (
                            <><i className="fas fa-circle-notch fa-spin"></i> Gerando (Gemini Thinking)...</>
                        ) : (
                            <><i className="fas fa-pen-nib"></i> Gerar Rascunho</>
                        )}
                    </button>
                </div>
            )}

            <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Conteúdo do Artigo (Markdown)</label>
            <div className="relative">
                <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={12}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 font-mono text-sm leading-relaxed"
                    placeholder="# Escreva seu artigo ou gere com IA..."
                />
                {generated && (
                    <div className="absolute top-2 right-2">
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded border border-green-200">
                            <i className="fas fa-check mr-1"></i> Gerado por IA
                        </span>
                    </div>
                )}
            </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
            <button
                type="submit"
                className="px-8 py-4 bg-azul-900 text-white font-bold rounded-lg hover:bg-azul-700 transition-colors shadow-lg flex items-center gap-2"
            >
                <i className="fas fa-paper-plane"></i> Publicar Artigo
            </button>
            </div>
        </form>
      )}

      {activeTab === 'BANNERS' && (
          <div className="animate-fade-in space-y-8">
              
              {/* List Existing Banners */}
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
                                  </div>
                              </div>
                              <button 
                                onClick={() => handleDeleteBanner(banner.id)}
                                className="absolute top-4 right-4 bg-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center hover:bg-red-700 transition"
                              >
                                  <i className="fas fa-trash"></i>
                              </button>
                          </div>
                      </div>
                  ))}
              </div>

              {/* Add New Banner Form */}
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
                          />
                          <input 
                              type="text" 
                              placeholder="Subtítulo / Descrição Curta"
                              className="p-3 border rounded-lg w-full"
                              value={newBanner.subtitle}
                              onChange={(e) => setNewBanner({...newBanner, subtitle: e.target.value})}
                          />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Texto do Botão (Ex: Saiba Mais)"
                          className="p-3 border rounded-lg w-full"
                          value={newBanner.cta}
                          onChange={(e) => setNewBanner({...newBanner, cta: e.target.value})}
                      />
                      <button 
                        onClick={handleAddBanner}
                        className="w-full bg-azul-900 text-white font-bold py-3 rounded-lg hover:bg-azul-700 transition"
                      >
                          Adicionar Banner
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminPanel;