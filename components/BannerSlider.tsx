import React, { useState, useEffect } from 'react';
import { Banner } from '../types';

interface BannerSliderProps {
    banners: Banner[];
    onBannerClick?: (id: string) => void;
}

const BannerSlider: React.FC<BannerSliderProps> = ({ banners, onBannerClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // 5 seconds

    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full mb-8 relative group">
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden rounded-2xl shadow-lg bg-gray-200">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <img 
              src={banner.image} 
              alt={banner.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-azul-900/90 via-azul-900/40 to-transparent"></div>
            <div className="absolute inset-0 flex items-center">
                <div className="container mx-auto px-8 md:px-16">
                    <div className="max-w-lg text-white">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{banner.title}</h2>
                        <p className="text-lg md:text-xl mb-8 opacity-90">{banner.subtitle}</p>
                        <a 
                            href={banner.link || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => {
                                if (!banner.link) e.preventDefault();
                                if (onBannerClick) onBannerClick(banner.id);
                            }}
                            className="inline-block bg-white text-azul-900 hover:bg-azul-50 font-bold py-3 px-8 rounded-lg transition transform hover:scale-105 shadow-lg cursor-pointer"
                        >
                            {banner.cta}
                        </a>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Indicators */}
      <div className="absolute bottom-6 left-0 right-0 z-20 flex justify-center space-x-2">
        {banners.map((_, index) => (
            <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
                }`}
            />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider;