import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import AdminOnly from './AdminOnly';

const links = [
  { to: '/', label: '首页' },
  { to: '/portfolio', label: '作品集' },
  { to: '/about', label: '关于' },
  { to: '/contact', label: '联系' },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, username, role, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled ? 'backdrop-blur-md bg-dark/40 border-b border-gray-800/50' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-white font-medium tracking-widest text-sm">
          PORTFOLIO
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-2">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="btn-base rounded-lg text-sm">
              {link.label}
            </Link>
          ))}
          <AdminOnly>
            <Link to="/admin" className="btn-base rounded-lg text-sm text-gray-400">
              管理
            </Link>
          </AdminOnly>
          {isAuthenticated ? (
            <>
              <span className="w-px h-4 bg-gray-700 mx-2" />
              <span className="text-sm text-gray-400">
                {username}
                <span className="ml-1 text-xs text-gray-600">
                  {role === 'admin' ? '管理员' : '用户'}
                </span>
              </span>
              <button onClick={handleLogout} className="btn-base rounded-lg text-sm text-gray-500">
                登出
              </button>
            </>
          ) : (
            <Link to="/login" className="btn-base rounded-lg text-sm text-gray-400">
              登录
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden btn-base rounded-lg p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <span className="block w-5 h-px bg-gray-200 mb-1" />
          <span className="block w-5 h-px bg-gray-200 mb-1" />
          <span className="block w-5 h-px bg-gray-200" />
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          className="md:hidden bg-dark/90 backdrop-blur-md border-t border-gray-800/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="px-6 py-4 flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`btn-base rounded-lg text-sm ${
                  location.pathname === link.to ? 'text-white' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
            <AdminOnly>
              <Link to="/admin" className="btn-base rounded-lg text-sm text-gray-400">
                管理后台
              </Link>
            </AdminOnly>
            {isAuthenticated ? (
              <>
                <hr className="border-gray-800 my-2" />
                <span className="text-sm text-gray-400">
                  {username}
                  <span className="ml-1 text-xs text-gray-600">
                    {role === 'admin' ? '管理员' : '用户'}
                  </span>
                </span>
                <button onClick={handleLogout} className="btn-base rounded-lg text-sm text-gray-500 text-left">
                  登出
                </button>
              </>
            ) : (
              <>
                <hr className="border-gray-800 my-2" />
                <Link to="/login" className="btn-base rounded-lg text-sm text-gray-400">
                  登录
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
