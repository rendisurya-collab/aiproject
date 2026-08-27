import { Link } from 'react-router-dom';
import { Instagram, MessageCircle, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-serif font-bold text-lg">R</span>
              </div>
              <span className="font-serif text-xl font-semibold text-white">
                Rian Rias Pengantin
              </span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              Platform sewa busana &amp; dekorasi pernikahan terpercaya.
              Temukan gaun impian Anda dengan harga sewa terjangkau.
            </p>
            <div className="flex space-x-3">
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-primary-400 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Menu</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-sm hover:text-primary-400 transition-colors">
                  Katalog Sewa
                </Link>
              </li>
              <li>
                <Link to="/products?category=gaun" className="text-sm hover:text-primary-400 transition-colors">
                  Sewa Busana
                </Link>
              </li>
              <li>
                <Link to="/products?category=dekorasi" className="text-sm hover:text-primary-400 transition-colors">
                  Sewa Dekorasi
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-primary-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Kategori</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products?category=gaun" className="text-sm hover:text-primary-400 transition-colors">
                  Gaun Pengantin
                </Link>
              </li>
              <li>
                <Link to="/products?category=kebaya" className="text-sm hover:text-primary-400 transition-colors">
                  Kebaya &amp; Beskap
                </Link>
              </li>
              <li>
                <Link to="/products?category=dekorasi" className="text-sm hover:text-primary-400 transition-colors">
                  Dekorasi
                </Link>
              </li>
              <li>
                <Link to="/products?category=aksesoris" className="text-sm hover:text-primary-400 transition-colors">
                  Aksesoris
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary-400 flex-shrink-0" />
                <span className="text-sm">Jl. Raya Wedding No. 123, Jakarta Selatan</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm">+62 812-3456-7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <span className="text-sm">hello@rianriaspengantin.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 Rian Rias Pengantin. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-3 md:mt-0">
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300">Syarat &amp; Ketentuan</a>
            <a href="#" className="text-xs text-gray-500 hover:text-gray-300">Kebijakan Privasi</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
