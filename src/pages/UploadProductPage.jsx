import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, ImagePlus, Package, Tag, MapPin, Ruler, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const defaultCategories = [
  { label: 'Gaun Pengantin', value: 'Gaun Pengantin', slug: 'gaun' },
  { label: 'Kebaya & Beskap', value: 'Kebaya & Beskap', slug: 'kebaya' },
  { label: 'Dekorasi', value: 'Dekorasi', slug: 'dekorasi' },
  { label: 'Aksesoris', value: 'Aksesoris', slug: 'aksesoris' },
  { label: 'Sepatu & Heels', value: 'Sepatu & Heels', slug: 'sepatu' },
  { label: 'Jas & Tuxedo', value: 'Jas & Tuxedo', slug: 'jas' },
];

const types = [
  { label: 'Sewa', value: 'sewa', desc: 'Produk disewakan per hari' },
];

const conditionOptions = [
  'Baru',
  'Seperti Baru',
  '95% Like New',
  '90% Like New',
  'Sangat Baik',
  'Baik',
];

export default function UploadProductPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState(defaultCategories);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.categories && data.categories.length > 0) {
            setCategories(data.categories.map(c => ({
              label: c.name,
              value: c.name,
              slug: c.slug,
            })));
          }
        }
      } catch (err) { /* use defaults */ }
    }
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    type: '',
    condition: '',
    location: '',
    sizes: '',
    includes: '',
  });

  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) {
    navigate('/login', { state: { from: '/upload-product' } });
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      setError('Maksimal 5 gambar yang bisa diunggah');
      return;
    }

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) {
        setError('Hanya file gambar yang diperbolehkan');
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Ukuran file maksimal 10MB per gambar');
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setError('');
    setImages((prev) => [...prev, ...validFiles]);

    // Generate previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.name) return setError('Nama produk wajib diisi');
    if (!formData.price) return setError('Harga wajib diisi');
    if (!formData.category) return setError('Kategori wajib dipilih');
    if (!formData.type) return setError('Tipe wajib dipilih');
    if (images.length === 0) return setError('Minimal 1 foto produk wajib diunggah');

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('price', formData.price);
      if (formData.originalPrice) submitData.append('originalPrice', formData.originalPrice);
      submitData.append('category', formData.category);

      const selectedCat = categories.find((c) => c.value === formData.category);
      submitData.append('categorySlug', selectedCat?.slug || '');

      submitData.append('type', formData.type);
      if (formData.condition) submitData.append('condition', formData.condition);
      if (formData.location) submitData.append('location', formData.location);
      if (formData.sizes) submitData.append('sizes', formData.sizes);
      if (formData.includes) submitData.append('includes', formData.includes);

      images.forEach((file) => {
        submitData.append('images', file);
      });

      const res = await fetch('/api/upload/product', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: submitData,
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Gagal mengunggah produk');
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError('Tidak dapat terhubung ke server');
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Produk Berhasil Diunggah!
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Produk Anda telah ditambahkan ke katalog Rian Rias Pengantin.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                setFormData({ name: '', description: '', price: '', originalPrice: '', category: '', type: '', condition: '', location: '', sizes: '', includes: '' });
                setImages([]);
                setPreviews([]);
              }}
              className="btn-secondary"
            >
              Unggah Produk Lain
            </button>
            <button onClick={() => navigate('/products')} className="btn-primary">
              Lihat Katalog
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Unggah Produk
          </h1>
          <p className="text-gray-600">
            Jual atau sewakan busana &amp; dekorasi pernikahan Anda di Rian Rias Pengantin
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center space-x-2">
              <ImagePlus className="w-5 h-5 text-primary-600" />
              <span>Foto Produk</span>
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Unggah hingga 5 foto. Foto pertama akan menjadi foto utama. Maks 10MB per foto.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {/* Previews */}
              {previews.map((preview, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group"
                >
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-primary-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                      Utama
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Hapus gambar"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add More Button */}
              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  <Upload className="w-6 h-6 mb-1" />
                  <span className="text-xs">Tambah</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              aria-label="Pilih foto produk"
            />
          </div>

          {/* Product Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Package className="w-5 h-5 text-primary-600" />
              <span>Informasi Produk</span>
            </h2>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nama Produk <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Gaun Pengantin Ballgown Ivory Lace Premium"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Deskripsikan produk Anda: bahan, detail, ukuran, warna, kondisi..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Category & Type */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Pilih kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tipe <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Pilih tipe</option>
                    {types.map((t) => (
                      <option key={t.value} value={t.value}>{t.label} — {t.desc}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Kondisi
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Pilih kondisi (opsional)</option>
                  {conditionOptions.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Tag className="w-5 h-5 text-primary-600" />
              <span>Harga</span>
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga {formData.type === 'sewa' ? '(per hari)' : ''} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="originalPrice" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Harga Asli <span className="text-xs text-gray-400">(opsional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">Rp</span>
                  <input
                    id="originalPrice"
                    name="originalPrice"
                    type="number"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Untuk menampilkan diskon/selisih harga</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Ruler className="w-5 h-5 text-primary-600" />
              <span>Detail Tambahan</span>
            </h2>

            <div className="space-y-4">
              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1.5">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Lokasi</span>
                  </span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Sizes */}
              <div>
                <label htmlFor="sizes" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Ukuran Tersedia
                </label>
                <input
                  id="sizes"
                  name="sizes"
                  type="text"
                  value={formData.sizes}
                  onChange={handleChange}
                  placeholder="Contoh: S, M, L, XL (pisahkan dengan koma)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Pisahkan dengan koma. Kosongkan jika tidak relevan (misal: dekorasi)</p>
              </div>

              {/* Includes */}
              <div>
                <label htmlFor="includes" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Sudah Termasuk
                </label>
                <input
                  id="includes"
                  name="includes"
                  type="text"
                  value={formData.includes}
                  onChange={handleChange}
                  placeholder="Contoh: Veil, Petticoat, Hanger premium (pisahkan dengan koma)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">Item tambahan yang termasuk dalam harga</p>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span>Mengunggah...</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Unggah Produk</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
