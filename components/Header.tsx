import React, { useState } from 'react';
import { ViewState } from '../types';

interface HeaderProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onSearch: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onSearch }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      onSearch(searchText);
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="bg-azul-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex justify-between items-center h-20">
          {/* Logo Area */}
          <div className="flex items-center cursor-pointer py-2" onClick={() => onNavigate('HOME')}>
             <img 
                src="http://azul360parceiros.com.br/wp-content/uploads/2026/01/parceiros-scaled.png" 
                alt="Azul 360 Parceiros" 
                className="h-12 w-auto object-contain"
             />
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-semibold tracking-wide uppercase">
            <button 
              onClick={() => onNavigate('HOME')}
              className={`hover:text-azul-500 transition-colors ${currentView === 'HOME' ? 'text-azul-500' : 'text-gray-200'}`}
            >
              Início
            </button>
            <button 
              onClick={() => onNavigate('HOME')}
              className="hover:text-azul-500 transition-colors text-gray-200"
            >
              Blog
            </button>
            <button className="hover:text-azul-500 transition-colors text-gray-200">Sobre</button>
            <button 
              onClick={() => onNavigate('ADMIN')}
              className={`hover:text-azul-500 transition-colors ${currentView === 'ADMIN' || currentView === 'LOGIN' ? 'text-azul-500' : 'text-gray-200'}`}
            >
              Painel Admin
            </button>
          </nav>

          {/* Social / Actions */}
          <div className="flex items-center space-x-4">
            {!isSearchOpen && (
              <>
                <i className="fab fa-facebook hover:text-azul-500 cursor-pointer transition hidden sm:block"></i>
                <i className="fab fa-instagram hover:text-azul-500 cursor-pointer transition hidden sm:block"></i>
                <i className="fab fa-linkedin hover:text-azul-500 cursor-pointer transition hidden sm:block"></i>
                <div className="w-px h-6 bg-gray-600 mx-2 hidden sm:block"></div>
              </>
            )}
            
            <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-auto'}`}>
                {isSearchOpen ? (
                    <form onSubmit={handleSearchSubmit} className="relative w-full">
                        <input 
                            type="text" 
                            className="w-full bg-azul-700 text-white rounded-full py-1 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-azul-500 placeholder-blue-300"
                            placeholder="Buscar..."
                            autoFocus
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onBlur={() => !searchText && setIsSearchOpen(false)}
                        />
                        <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white">
                            <i className="fas fa-search"></i>
                        </button>
                    </form>
                ) : (
                    <button 
                        className="text-white hover:text-azul-500 transition-transform hover:scale-110"
                        onClick={() => setIsSearchOpen(true)}
                    >
                        <i className="fas fa-search"></i>
                    </button>
                )}
            </div>
            
            {isSearchOpen && (
                 <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-white ml-2">
                     <i className="fas fa-times"></i>
                 </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Sub-header categories (Only on Home) */}
      {currentView === 'HOME' && (
        <div className="bg-white text-gray-600 border-b border-gray-200 py-3 overflow-x-auto">
          <div className="container mx-auto px-4 flex justify-center space-x-8 text-xs font-bold uppercase whitespace-nowrap">
            <a href="#" className="hover:text-azul-900">Mercado</a>
            <a href="#" className="hover:text-azul-900">Gestão de Agências</a>
            <a href="#" className="hover:text-azul-900">Tecnologia</a>
            <a href="#" className="hover:text-azul-900">Eventos</a>
            <a href="#" className="hover:text-azul-900">Colunistas</a>
            <a href="#" className="hover:text-azul-900">Azul News</a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;