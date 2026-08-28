import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  CalendarDays,
  Star,
  MapPin,
  ShieldCheck,
  Truck,
  MessageCircle,
  Minus,
  Plus,
} from 'lucide-react';
import { products as mockProducts } from '../data/products';

const API_URL = '/api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rentalDays, setRentalDays] = useState(1);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    async function loadProduct() {
      // Check if it's a database product
      if (id.startsWith('db-')) {
        const dbId = id.replace('db-', '');
        try {
          const res = await fetch(`${API_URL}/products/${dbId}`);
          if (res.ok) {
            const data = await res.json();
            const p = data.product;
            setProduct({
              id: `db-${p.id}`,
              name: p.name,
              price: p.price,
              image: p.image ? null : '📷',
              imageUrl: p.image ? p.image : null,
              images: (p.images || []).map((img) => img.image_path),
              category: p.category,
              categorySlug: p.category_slug,
              type: 'sewa',
              rating: p.rating || null,
              condition: p.condition,
              description: p.description,
              seller: p.seller?.name || 'Penyewa',
              location: p.location || '-',
              sizes: p.sizes ? p.sizes.split(',').map((s) => s.trim()) : [],
              includes: p.includes ? p.includes.split(',').map((s) => s.trim()) : [],
              minDays: 1,
              maxDays: 7,
            });
          }
        } catch (err) {
          console.error('Failed to fetch product:', err);
        }
      } else {
        // Mock product
        const found = mockProducts.find((p) => p.id === Number(id));
        if (found) setProduct(found);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-500">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-xl font-serif font-semibold mb-2">Produk tidak ditemukan</h2>
          <Link to="/products" className="text-primary-600 hover:underline text-sm">
            Kembali ke katalog
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalPrice = product.price * rentalDays;
  const minDays = product.minDays || 1;
  const maxDays = product.maxDays || 7;
  const today = new Date().toISOString().split('T')[0];

  const handleBooking = () => {
    if (!startDate) {
      alert('Pilih tanggal mulai sewa terlebih dahulu');
      return;
    }
    navigate('/booking', {
      state: { product, rentalDays, startDate, totalPrice },
    });
  };

  const relatedProducts = mockProducts
    .filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link to="/products" className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Katalog</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-10">
          {/* Image */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            <div className="aspect-[3/4] bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center overflow-hidden">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-8xl">{product.image}</span>
              )}
            </div>
            {/* Additional images */}
            {product.images && product.images.length > 1 && (
              <div className="p-3 flex gap-2 overflow-x-auto">
                {product.images.map((img, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Sewa
              </span>
              {product.condition && (
                <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {product.condition}
                </span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-serif font-bold text-gray-900">{product.name}</h1>

            {product.rating && (
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 fill-gold-400 text-gold-400" />
                <span className="text-sm font-medium text-gray-900">{product.rating}</span>
                <span className="text-sm text-gray-400">|</span>
                <span className="text-sm text-gray-500">{product.category}</span>
              </div>
            )}

            {/* Pricing & Booking */}
            <div className="floating-card">
              <div className="flex items-baseline space-x-2 mb-3">
                <span className="text-3xl font-bold text-primary-700">{formatPrice(product.price)}</span>
                <span className="text-sm text-primary-600">/hari</span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Durasi Sewa</span>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                    <button onClick={() => setRentalDays(Math.max(minDays, rentalDays - 1))} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-primary-600" aria-label="Kurangi hari">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold">{rentalDays}</span>
                    <button onClick={() => setRentalDays(Math.min(maxDays, rentalDays + 1))} className="w-9 h-9 flex items-center justify-center text-gray-500 hover:text-primary-600" aria-label="Tambah hari">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">hari</span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tanggal Mulai Sewa</label>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} min={today} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white" />
                </div>
                <div className="pt-3 border-t border-primary-100 flex justify-between items-center">
                  <span className="text-sm text-gray-700 font-medium">Total Sewa</span>
                  <span className="text-xl font-bold text-primary-700">{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500">{formatPrice(product.price)} × {rentalDays} hari</p>
              </div>
            </div>

            {/* Seller */}
            <div className="flex items-center space-x-3 border rounded-lg p-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-semibold text-sm">{product.seller.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{product.seller}</p>
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" /><span>{product.location}</span>
                </div>
              </div>
              <button className="text-primary-600 hover:text-primary-700"><MessageCircle className="w-5 h-5" /></button>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Deskripsi</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ukuran Tersedia</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button key={size} className="px-4 py-2 border border-gray-200 rounded-lg text-sm hover:border-primary-400 hover:text-primary-600 transition-colors">{size}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Includes */}
            {product.includes && product.includes.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sudah Termasuk</h3>
                <ul className="grid grid-cols-2 gap-1">
                  {product.includes.map((item) => (
                    <li key={item} className="flex items-center space-x-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full" /><span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button onClick={handleBooking} className="btn-primary flex-1 flex items-center justify-center space-x-2">
                <CalendarDays className="w-5 h-5" /><span>Booking Sekarang</span>
              </button>
              <button className="w-12 h-12 border-2 border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors" aria-label="Tambah ke wishlist">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <ShieldCheck className="w-4 h-4 text-green-500" /><span>Produk Terverifikasi</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <Truck className="w-4 h-4 text-blue-500" /><span>Pengiriman Aman</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Produk Serupa</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <Link key={p.id} to={`/products/${p.id}`}>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] bg-gradient-to-br from-primary-50 to-gold-50 flex items-center justify-center">
                      <span className="text-4xl">{p.image}</span>
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{p.name}</p>
                      <p className="text-sm text-primary-600 font-semibold mt-1">
                        {formatPrice(p.price)}<span className="text-xs text-gray-500">/hari</span>
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
