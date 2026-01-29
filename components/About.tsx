import React from 'react';

const About: React.FC = () => {
  return (
    <section className="bg-white min-h-[80vh] py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* Image Section */}
          <div className="w-full lg:w-1/2">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white transform hover:rotate-1 transition duration-500">
               <img 
                 src="http://azul360parceiros.com.br/wp-content/uploads/2026/01/azul-instagram-post-jh8a80zf9.png" 
                 alt="Sobre Azul 360 Parceiros" 
                 className="w-full h-auto object-cover"
                 onError={(e) => { e.currentTarget.src = 'https://picsum.photos/800/800?grayscale'; }}
               />
               <div className="absolute inset-0 bg-azul-900/10 mix-blend-multiply"></div>
            </div>
            {/* Decorative Element */}
            <div className="hidden lg:block absolute -left-4 top-1/2 w-24 h-24 bg-azul-500/20 rounded-full blur-3xl -z-10"></div>
          </div>

          {/* Text Section */}
          <div className="w-full lg:w-1/2 space-y-6">
            <div className="inline-block px-4 py-1 bg-azul-50 text-azul-700 font-bold text-xs rounded-full uppercase tracking-wider mb-2 border border-azul-100">
              Nossa Missão
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-azul-900 leading-tight">
              Central de Informação <br/>
              <span className="text-azul-500">Prática e Estratégica</span>
            </h1>
            
            <div className="text-gray-600 text-lg leading-relaxed space-y-6 text-justify">
              <p>
                Nosso blog foi criado para ser a central de informação prática dos parceiros <strong>Azul 360 Parceiros</strong>: um espaço atualizado, direto e aplicável para quem vive de crédito e precisa tomar decisões rápidas com segurança.
              </p>
              
              <p>
                Aqui você encontra novidades do setor e mudanças que impactam aprovações, além de conteúdos sobre inovação e ferramentas que ajudam a ganhar produtividade no dia a dia.
              </p>

              <div className="border-l-4 border-azul-500 pl-6 py-2 bg-gray-50 rounded-r-lg">
                <p className="italic text-gray-700 font-medium">
                  Também trazemos materiais voltados à eficiência operacional — processos, organização, performance comercial e gestão da rotina — e análises de cenários, tendências e oportunidades de mercado para você antecipar movimentos, ajustar sua estratégia e fechar mais negócios com consistência.
                </p>
              </div>

              <p className="font-semibold text-azul-900">
                A ideia é simples: transformar informação em vantagem competitiva. Conteúdo que você lê e já consegue usar na próxima conversa com o cliente.
              </p>
            </div>

            <div className="pt-6">
                <button className="bg-azul-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-azul-700 transition transform hover:-translate-y-1">
                    Explore Nossos Artigos
                </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
