import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CalendarDays, ArrowLeft, CheckCircle, CreditCard, Send } from 'lucide-react';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchFields() {
      try {
        const res = await fetch('/api/bookings/fields');
        if (res.ok) {
          const data = await res.json();
          setFields(data.fields || []);
        }
      } catch (err) { /* use empty */ }
    }
    fetchFields();
  }, []);

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const getEndDate = (startDate, days) => {
    if (!startDate) return '-';
    const end = new Date(startDate);
    end.setDate(end.getDate() + days - 1);
    return end.toISOString().split('T')[0];
  };

  if (!bookingData || !bookingData.product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">Tidak ada data booking</h2>
          <p className="text-sm text-gray-500 mb-6">Silakan pilih produk terlebih dahulu</p>
          <Link to="/products" className="btn-primary">Jelajahi Katalog</Link>
        </div>
      </div>
    );
  }

  const { product, rentalDays, startDate, totalPrice } = bookingData;
  const endDate = getEndDate(startDate, rentalDays);
  const serviceFee = 50000;
  const grandTotal = totalPrice + serviceFee;

  const handleChange = (fieldName, value) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    for (const field of fields) {
      if (field.is_required && !formValues[field.field_name]) {
        setError(`${field.field_label} wajib diisi`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          product_name: product.name,
          form_data: formValues,
          total_price: grandTotal,
          start_date: startDate,
          end_date: endDate,
          rental_days: rentalDays,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Gagal mengirim booking');
      }
    } catch (err) {
      setError('Tidak dapat terhubung ke server');
    }

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">Booking Berhasil!</h2>
          <p className="text-sm text-gray-600 mb-2">Terima kasih telah melakukan booking di Rian Rias Pengantin.</p>
          <p className="text-sm text-gray-500 mb-6">Tim kami akan menghubungi Anda melalui WhatsApp/telepon untuk konfirmasi.</p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-gray-500">Produk: <span className="font-medium text-gray-900">{product.name}</span></p>
            <p className="text-xs text-gray-500">Tanggal: <span className="font-medium text-gray-900">{formatDate(startDate)}</span></p>
            <p className="text-xs text-gray-500">Durasi: <span className="font-medium text-gray-900">{rentalDays} hari</span></p>
            <p className="text-xs text-gray-500">Total: <span className="font-bold text-primary-600">{formatPrice(grandTotal)}</span></p>
          </div>
          <button onClick={() => navigate('/')} className="btn-primary w-full">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate(-1)} className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-600 mb-4">
            <ArrowLeft className="w-4 h-4" /><span>Kembali</span>
          </button>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Form Booking</h1>
          <p className="text-gray-600 text-sm mt-1">Lengkapi data di bawah untuk konfirmasi sewa</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* Product Summary */}
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-primary-600" />
                <span>Detail Sewa</span>
              </h3>
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-gradient-to-br from-primary-50 to-gold-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">{product.image || '📷'}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(startDate)} — {rentalDays} hari</p>
                  <p className="text-primary-600 font-semibold text-sm mt-1">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* Dynamic Form */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Data Penyewa</h3>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {field.field_label}
                      {field.is_required ? <span className="text-red-500 ml-0.5">*</span> : ''}
                    </label>

                    {field.field_type === 'textarea' ? (
                      <textarea
                        value={formValues[field.field_name] || ''}
                        onChange={(e) => handleChange(field.field_name, e.target.value)}
                        placeholder={field.placeholder || ''}
                        required={!!field.is_required}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      />
                    ) : field.field_type === 'select' ? (
                      <select
                        value={formValues[field.field_name] || ''}
                        onChange={(e) => handleChange(field.field_name, e.target.value)}
                        required={!!field.is_required}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Pilih...</option>
                        {(field.options || '').split(',').map((opt) => (
                          <option key={opt.trim()} value={opt.trim()}>{opt.trim()}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={field.field_type || 'text'}
                        value={formValues[field.field_name] || ''}
                        onChange={(e) => handleChange(field.field_name, e.target.value)}
                        placeholder={field.placeholder || ''}
                        required={!!field.is_required}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full flex items-center justify-center space-x-2 mt-6 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Mengirim...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Kirim Booking</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-serif font-semibold text-gray-900 text-lg mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <span>Ringkasan</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Sewa ({rentalDays} hari)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Biaya layanan</span>
                  <span className="font-medium">{formatPrice(serviceFee)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-primary-700">{formatPrice(grandTotal)}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Pembayaran dilakukan setelah tim kami mengkonfirmasi ketersediaan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
