import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/request';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { isAuthenticated, role: currentRole, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated && currentRole === 'admin') return <Navigate to="/admin" replace />;
  if (isAuthenticated && currentRole === 'user') return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('请填写账号和密码');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { username, password, role });
      login(res.data.token, res.data.role, res.data.username);
      navigate(res.data.role === 'admin' ? '/admin' : '/');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-6">
      <motion.div
        className="w-full max-w-sm p-8 bg-dark/60 backdrop-blur-md rounded-lg border border-gray-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-medium text-white text-center mb-6 tracking-wide">登录</h2>

        {error && (
          <p className="text-sm text-center mb-4" style={{ color: '#ef4444' }}>{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="账号"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-100 text-sm outline-none transition-colors focus:border-gray-400"
            autoComplete="username"
          />

          <input
            type="password"
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-gray-700 py-2 text-gray-100 text-sm outline-none transition-colors focus:border-gray-400"
            autoComplete="current-password"
          />

          <div className="flex gap-8 py-2">
            <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="user"
                checked={role === 'user'}
                onChange={() => setRole('user')}
              />
              普通用户
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="admin"
                checked={role === 'admin'}
                onChange={() => setRole('admin')}
              />
              管理员
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-base rounded-lg text-sm w-full py-2"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <button
          onClick={() => navigate('/')}
          className="btn-base rounded-lg text-xs w-full mt-3"
        >
          跳过，直接浏览
        </button>
      </motion.div>
    </div>
  );
}
