import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowLeft, CheckCircle, Clock, CreditCard } from 'lucide-react';

export default function BookingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;

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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getEndDate = (startDate, days) => {
    if (!startDate) return '-';
    const end = new Date(startDate);
    end.setDate(end.getDate() + days - 1);
    return end.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!bookingData || !bookingData.product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-xl font-serif font-semibold text-gray-900 mb-2">
            Tidak ada data booking
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Silakan pilih produk terlebih dahulu
          </p>
          <Link to="/products" className="btn-primary inline-flex items-center space-x-2">
            <span>Jelajahi Katalog</span>
          </Link>
        </div>
      </div>
    );
  }

  const { product, rentalDays, startDate, totalPrice } = bookingData;
  const deposit = Math.round(totalPrice * 0.3);
  const serviceFee = 50000;
  const grandTotal = totalPrice + serviceFee;

  const handleConfirmBooking = () => {
    alert('Booking berhasil dikonfirmasi! Tim kami akan menghubungi Anda untuk detail selanjutnya.');
    navigate('/');
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-sm text-gray-500 hover:text-primary-600 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
          <h1 className="text-3xl font-serif font-bold text-gray-900">Konfirmasi Booking</h1>
          <p className="text-gray-600 text-sm mt-1">
            Periksa detail sewa Anda sebelum mengonfirmasi
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Detail Produk</h3>
              <div className="flex gap-4">
                <div className="w-20 h-24 bg-gradient-to-br from-primary-50 to-gold-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-3xl">{product.image}</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">{product.name}</h4>
                  <p className="text-xs text-gray-500 mb-2">{product.category}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span>{product.location}</span>
                  </div>
                  <p className="text-primary-600 font-semibold mt-2">
                    {formatPrice(product.price)}/hari
                  </p>
                </div>
              </div>
            </div>

            {/* Rental Schedule */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <CalendarDays className="w-5 h-5 text-primary-600" />
                <span>Jadwal Sewa</span>
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Tanggal Mulai</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(startDate)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Tanggal Kembali</span>
                  <span className="text-sm font-medium text-gray-900">{getEndDate(startDate, rentalDays)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">Durasi</span>
                  <span className="text-sm font-medium text-gray-900">{rentalDays} hari</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-primary-600" />
                <span>Ketentuan Sewa</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Produk akan dikirim H-1 sebelum tanggal mulai sewa</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Pengembalian paling lambat H+1 setelah tanggal kembali</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Deposit 30% akan dikembalikan setelah produk diterima kembali dalam kondisi baik</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Biaya keterlambatan: {formatPrice(Math.round(product.price * 0.5))}/hari</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-serif font-semibold text-gray-900 text-lg mb-4 flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <span>Ringkasan Pembayaran</span>
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
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Deposit (dikembalikan)</span>
                  <span>{formatPrice(deposit)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total Bayar</span>
                  <span className="font-bold text-lg text-primary-700">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">+ Deposit</span>
                  <span className="text-gray-500">{formatPrice(deposit)}</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-4">
                  Dengan mengonfirmasi, Anda menyetujui syarat dan ketentuan sewa BridalNest.
                </p>
                <button
                  onClick={handleConfirmBooking}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span>Konfirmasi Booking</span>
                </button>
              </div>

              <p className="text-xs text-center text-gray-400 mt-3">
                Pembayaran aman &amp; terenkripsi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
