import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Truck, RefreshCw, Headphones } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { products, categories as defaultCategories } from '../data/products';

export default function HomePage() {
  const [categories, setCategories] = useState(defaultCategories);
  const featuredProducts = products.slice(0, 8);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories.map(c => ({
              name: c.name,
              slug: c.slug,
              icon: c.icon || '📦',
              count: 0,
              gradient: 'bg-gradient-to-br from-primary-100 to-primary-50',
            })));
          }
        }
      } catch (err) { /* fallback to default */ }
    }
    fetchCategories();
  }, []);

  return (
    <div>
      <HeroSection />

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">
              Kategori Sewa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan segala kebutuhan pernikahan yang bisa disewa dalam satu tempat
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.slug} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
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
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">
              Cara Sewa
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mudah dan aman, hanya dalam beberapa langkah
            </p>
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
            Bergabung dengan ribuan pasangan yang telah menyewa perlengkapan pernikahan
            premium dengan harga terjangkau di BridalNest.
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
