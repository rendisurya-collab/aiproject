import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 via-white to-gold-50 overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full opacity-30 blur-3xl" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-gold-100 rounded-full opacity-30 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              <span>Platform Sewa Perlengkapan Pernikahan</span>
            </div>

            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Sewa Busana &amp;
              <span className="text-primary-600"> Dekorasi</span> untuk
              Hari Istimewa Anda
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Tampil sempurna tanpa harus membeli. Sewa gaun pengantin, kebaya, dekorasi,
              dan perlengkapan pernikahan premium dengan harga terjangkau.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/products" className="btn-primary inline-flex items-center justify-center space-x-2">
                <span>Jelajahi Katalog Sewa</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6">
              <div>
                <p className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">500+</p>
                <p className="text-sm text-gray-500">Produk Sewa</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">1.2K</p>
                <p className="text-sm text-gray-500">Booking Sukses</p>
              </div>
              <div>
                <p className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">4.9</p>
                <p className="text-sm text-gray-500">Rating Bintang</p>
              </div>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-gold-200 flex items-center justify-center">
                <div className="text-center px-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-white/50 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-primary-600" />
                  </div>
                  <p className="text-primary-800 font-serif text-xl font-semibold">
                    Koleksi Sewa 2026
                  </p>
                  <p className="text-primary-600 text-sm mt-2">
                    Gaun &amp; Dekorasi Premium
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-white rounded-xl shadow-lg p-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✓</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Garansi Kualitas</p>
                <p className="text-xs text-gray-500">Setiap produk terverifikasi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
