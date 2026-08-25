import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { products, categories as defaultCategories } from '../data/products';

export default function HomePage() {
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [currentBanner, setCurrentBanner] = useState(0);
  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    async function fetchData() {
      try {
        const [bannerRes, catRes] = await Promise.all([
          fetch('/api/banners'),
          fetch('/api/categories'),
        ]);
        if (bannerRes.ok) {
          const data = await bannerRes.json();
          if (data.banners && data.banners.length > 0) setBanners(data.banners);
        }
        if (catRes.ok) {
          const data = await catRes.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories.map(c => ({
              name: c.name,
              slug: c.slug,
              icon: c.icon || '📦',
              image: c.image || null,
              count: 0,
            })));
          }
        }
      } catch (err) { /* fallback */ }
    }
    fetchData();
  }, []);

  // Auto-slide banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div>
      {/* Banner / Hero Section */}
      {banners.length > 0 ? (
        <section className="relative overflow-hidden bg-gray-900">
          <div className="relative h-[400px] md:h-[500px]">
            {banners.map((banner, index) => (
              <Link
                key={banner.id}
                to={banner.link || '/products'}
                className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${
                  index === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.title || ''}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-800" />
                )}
                {/* Overlay */}
                <div className={`absolute inset-0 ${banner.title ? 'bg-black/30' : 'bg-black/10'}`} />
                {/* Content text only - no button */}
                {(banner.title || banner.subtitle) && (
                  <div className="absolute inset-0 flex items-center pointer-events-none">
                    <div className={`px-6 md:px-16 max-w-xl ${banners.length > 1 ? 'ml-auto mr-8 text-right' : 'ml-8 text-left'}`}>
                      {banner.title && (
                        <h1 className="text-2xl md:text-4xl font-serif font-bold text-white mb-3 drop-shadow-lg">
                          {banner.title}
                        </h1>
                      )}
                      {banner.subtitle && (
                        <p className="text-sm md:text-lg text-white/90 drop-shadow">
                          {banner.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            ))}

            {/* Navigation Arrows - only when more than 1 banner */}
            {banners.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                  aria-label="Banner sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/40 transition-colors"
                  aria-label="Banner selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                {/* Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                  {banners.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentBanner(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === currentBanner ? 'bg-white w-6' : 'bg-white/50'
                      }`}
                      aria-label={`Banner ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        /* Fallback hero when no banners */
        <section className="relative bg-gradient-to-br from-primary-50 via-white to-gold-50 py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl lg:text-6xl font-serif font-bold text-gray-900 leading-tight mb-6">
              Sewa Busana &amp; <span className="text-primary-600">Dekorasi</span> untuk Hari Istimewa Anda
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Tampil sempurna tanpa harus membeli. Sewa perlengkapan pernikahan premium dengan harga terjangkau.
            </p>
            <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
              <span>Jelajahi Katalog Sewa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Categories - Clickable Image Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">
              Kategori Sewa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan segala kebutuhan pernikahan yang bisa disewa
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-xl aspect-[4/5] shadow-sm hover:shadow-lg transition-all duration-300"
              >
                {/* Image or Gradient Background */}
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <span className="text-5xl">{cat.icon}</span>
                  </div>
                )}
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                {/* Text */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-serif font-semibold text-white text-lg drop-shadow">
                    {cat.name}
                  </h3>
                  <p className="text-white/80 text-sm mt-1 flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Lihat Koleksi</span>
                    <ArrowRight className="w-3 h-3" />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                Paling Banyak Disewa
              </h2>
              <p className="text-gray-600">Rekomendasi terbaik untuk hari spesial Anda</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:inline-flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
              <span>Lihat Semua Produk Sewa</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Cara Sewa</h2>
            <p className="text-gray-600">Mudah dan aman, hanya dalam beberapa langkah</p>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Pilih Produk', desc: 'Jelajahi katalog dan temukan produk yang sesuai.' },
              { step: '02', title: 'Pilih Tanggal', desc: 'Tentukan tanggal dan durasi sewa yang diinginkan.' },
              { step: '03', title: 'Booking & Bayar', desc: 'Konfirmasi booking dan lakukan pembayaran.' },
              { step: '04', title: 'Terima & Pakai', desc: 'Produk dikirim H-1, kembalikan setelah selesai.' },
            ].map((item) => (
              <div key={item.step} className="text-center px-4">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-serif font-bold text-xl">{item.step}</span>
                </div>
                <h3 className="text-lg font-serif font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="py-12 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Produk Terverifikasi', desc: 'Semua produk dicek kualitasnya' },
              { icon: Truck, title: 'Antar & Jemput', desc: 'Dikirim H-1, dijemput H+1' },
              { icon: RefreshCw, title: 'Deposit Dikembalikan', desc: 'Deposit kembali setelah retur' },
              { icon: Headphones, title: 'Layanan 24/7', desc: 'Tim support siap membantu' },
            ].map((item) => (
              <div key={item.title} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            Siap Menyewa untuk Hari Istimewa Anda?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Bergabung dengan ribuan pasangan yang telah menyewa perlengkapan pernikahan premium dengan harga terjangkau.
          </p>
          <Link to="/products" className="btn-gold inline-flex items-center space-x-2">
            <span>Mulai Sewa Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
