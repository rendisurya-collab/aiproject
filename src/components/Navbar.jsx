import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, Search, LogOut, LogIn, User as UserIcon, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, getAvatarUrl } = useAuth();

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/products', label: 'Katalog Sewa' },
    { to: '/about', label: 'Tentang Kami' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const avatarUrl = user ? getAvatarUrl(user.avatar) : null;

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-serif font-bold text-lg">R</span>
            </div>
            <span className="font-serif text-xl font-semibold text-gray-900">Rian Rias Pengantin</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(link.to) ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/products" className="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Cari produk">
              <Search className="w-5 h-5" />
            </Link>
            <button className="text-gray-500 hover:text-primary-600 transition-colors" aria-label="Wishlist">
              <Heart className="w-5 h-5" />
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 transition-colors"
                  aria-label="Menu pengguna"
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-primary-700 font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link to="/profile" onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <UserIcon className="w-4 h-4" /><span>Profil Saya</span>
                    </Link>
                    <Link to="/upload-product" onClick={() => setShowUserMenu(false)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <Upload className="w-4 h-4" /><span>Sewakan Produk</span>
                    </Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                      <LogOut className="w-4 h-4" /><span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors">
                <LogIn className="w-4 h-4" /><span>Masuk</span>
              </Link>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-500" aria-label="Toggle menu">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100">
          <div className="px-4 py-3 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                      {avatarUrl ? <img src={avatarUrl} alt={user.name} className="w-full h-full object-cover" /> : <span className="text-primary-700 font-semibold text-sm">{user.name.charAt(0).toUpperCase()}</span>}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    <UserIcon className="w-4 h-4" /><span>Profil Saya</span>
                  </Link>
                  <Link to="/upload-product" onClick={() => setIsOpen(false)} className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Upload className="w-4 h-4" /><span>Sewakan Produk</span>
                  </Link>
                  <button onClick={() => { handleLogout(); setIsOpen(false); }} className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg w-full">
                    <LogOut className="w-4 h-4" /><span>Keluar</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg">Masuk</Link>
                  <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">Daftar</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
