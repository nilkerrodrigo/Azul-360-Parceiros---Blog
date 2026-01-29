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
                src="http://azul360parceiros.com.br/wp-content/uploads/2025/12/logo-2-scaled.png" 
                alt="Azul 360 Admin" 
                className="h-16 mx-auto mb-4 object-contain"
            />
            <h2 className="text-2xl font-bold text-azul-900">Acesso Restrito</h2>
            <p className="text-gray-500 text-sm">Entre com suas credenciais de administrador</p>
        </div>
        
        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 flex items-center">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">E-mail</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-envelope text-gray-400"></i>
                    </div>
                    <input 
                        type="email" 
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-azul-500 transition"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Senha</label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <i className="fas fa-lock text-gray-400"></i>
                    </div>
                    <input 
                        type="password" 
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul-500 focus:border-azul-500 transition"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className={`w-full bg-azul-900 text-white font-bold py-3 rounded-lg hover:bg-azul-700 transition transform hover:-translate-y-0.5 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
                {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Entrar no Painel'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button onClick={onCancel} className="text-sm text-gray-500 hover:text-azul-700 underline">
                Voltar para o site
            </button>
        </div>
      </div>
    </div>
  );
};

export default Login;