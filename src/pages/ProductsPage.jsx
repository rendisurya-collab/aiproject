import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { products as mockProducts, categories as defaultCategories } from '../data/products';

const API_URL = '/api';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilter, setShowFilter] = useState(false);
  const [dbProducts, setDbProducts] = useState([]);
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(true);

  const activeCategory = searchParams.get('category') || '';
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch products and categories from API
  useEffect(() => {
    async function fetchData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
        ]);
        if (prodRes.ok) {
          const data = await prodRes.json();
          setDbProducts(data.products || []);
        }
        if (catRes.ok) {
          const data = await catRes.json();
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
      } catch (err) {
        console.log('API not available, using fallback data');
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Combine mock products with database products
  const allProducts = useMemo(() => {
    const dbMapped = dbProducts.map((p) => ({
      id: `db-${p.id}`,
      name: p.name,
      price: p.price,
      image: p.image || null,
      imageUrl: p.image ? p.image : null,
      category: p.category,
      categorySlug: p.category_slug,
      type: p.type || 'sewa',
      rating: p.rating || null,
      condition: p.condition,
      description: p.description,
      seller: p.seller?.name || 'Penjual',
      location: p.location,
      sizes: p.sizes ? p.sizes.split(',').map((s) => s.trim()) : [],
      includes: p.includes ? p.includes.split(',').map((s) => s.trim()) : [],
      images: p.images || [],
      isFromDb: true,
    }));

    return [...dbMapped, ...mockProducts];
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    if (activeCategory) {
      result = result.filter((p) => p.categorySlug === activeCategory);
    }

    return result;
  }, [searchQuery, activeCategory, allProducts]);

  const handleCategoryChange = (slug) => {
    const params = new URLSearchParams(searchParams);
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Katalog Sewa
          </h1>
          <p className="text-gray-600 mb-6">
            Temukan busana dan dekorasi pernikahan terbaik untuk disewa di hari istimewa Anda
          </p>
          <SearchBar
            onSearch={setSearchQuery}
            onFilter={() => setShowFilter(!showFilter)}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`lg:w-64 flex-shrink-0 ${
              showFilter ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div>
                <h3 className="font-semibold text-sm text-gray-900 mb-3">Kategori</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={activeCategory === ''}
                      onChange={() => handleCategoryChange('')}
                      className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Semua Kategori</span>
                  </label>
                  {categories.map((cat) => (
                    <label key={cat.slug} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={activeCategory === cat.slug}
                        onChange={() => handleCategoryChange(cat.slug)}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">
                        {cat.icon} {cat.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Menampilkan <span className="font-medium">{filteredProducts.length}</span> produk sewa
              </p>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4 animate-pulse">⏳</div>
                <p className="text-gray-500">Memuat produk...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Produk tidak ditemukan
                </h3>
                <p className="text-sm text-gray-500">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
