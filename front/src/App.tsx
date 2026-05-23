import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import PortfolioPage from './pages/PortfolioPage';
import PhotoDetailPage from './pages/PhotoDetailPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';

function AdminRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated || role !== 'admin') return <Navigate to="/login" replace />;
  return children;
}

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const hideNavbar = location.pathname === '/login' || location.pathname.startsWith('/admin');

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'LOGOUT' && e.origin === window.location.origin) {
        logout();
        navigate('/login');
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [logout, navigate]);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <iframe
                  src={`/admin/index.html?token=${localStorage.getItem('token') || ''}`}
                  className="w-full h-screen border-none"
                  title="管理后台"
                />
              </AdminRoute>
            }
          />
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/photo/:id" element={<PhotoDetailPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
