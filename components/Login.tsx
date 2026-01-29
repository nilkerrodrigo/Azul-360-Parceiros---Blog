import React, { useState } from 'react';
import { loginUser } from '../services/apiService';

interface LoginProps {
  onLogin: () => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      onLogin();
    } catch (err: any) {
        setError(err.message || "Erro ao fazer login");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
            <img 
                src="http://azul360parceiros.com.br/wp-content/uploads/2026/01/parceiros-scaled.png" 
                alt="Azul 360 Parceiros" 
                className="h-16 w-auto mx-auto mb-6 object-contain"
            />
            <h2 className="text-xl font-semibold text-gray-700">Acesso Restrito</h2>
            <p className="text-sm text-gray-500">
                Faça login para gerenciar o blog.
            </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
            <i className="fas fa-exclamation-circle mr-2"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
            <div className="relative">
                <i className="fas fa-envelope absolute left-3 top-3.5 text-gray-400"></i>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-transparent outline-none transition"
                    placeholder="admin@azul360.com.br"
                    required
                />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div className="relative">
                <i className="fas fa-lock absolute left-3 top-3.5 text-gray-400"></i>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-transparent outline-none transition"
                    placeholder="Sua senha"
                    required
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 shadow-md ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-azul-900 hover:bg-azul-700'}`}
          >
            {loading ? 'Validando...' : 'Entrar no Painel'}
          </button>
          
          <div className="flex justify-between items-center text-sm">
              <button
                type="button"
                onClick={onCancel}
                className="text-gray-500 hover:text-azul-900 transition"
              >
                Voltar para o site
              </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;