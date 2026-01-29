import React from 'react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
  layout?: 'vertical' | 'horizontal';
  onClick: (article: Article) => void;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, layout = 'vertical', onClick }) => {
  if (layout === 'horizontal') {
    return (
      <div className="flex gap-4 group cursor-pointer" onClick={() => onClick(article)}>
        <div className="w-1/3 h-24 overflow-hidden rounded-lg">
          <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        </div>
        <div className="w-2/3 flex flex-col justify-center">
          <span className="text-xs font-bold text-azul-700 uppercase mb-1">{article.category}</span>
          <h4 className="font-bold text-gray-800 leading-tight group-hover:text-azul-900 transition-colors line-clamp-2">
            {article.title}
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full flex flex-col" onClick={() => onClick(article)}>
      <div className="relative h-48 overflow-hidden">
        <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute top-4 left-4">
           <span className="bg-azul-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
             {article.category}
           </span>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-azul-700 transition-colors">
          {article.title}
        </h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-3 flex-grow">
          {article.excerpt}
        </p>
        <div className="flex items-center text-xs text-gray-400 border-t pt-4 mt-auto">
          <span className="font-semibold text-gray-600 mr-2">{article.author}</span>
          <span>• {article.date}</span>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;