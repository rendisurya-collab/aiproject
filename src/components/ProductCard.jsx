import { Link } from 'react-router-dom';
import { Heart, Calendar, Star } from 'lucide-react';

export default function ProductCard({ product }) {
  const { id, name, price, image, imageUrl, category, rating, condition } = product;

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const productLink = typeof id === 'string' && id.startsWith('db-')
    ? `/products/${id}`
    : `/products/${id}`;

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-gold-100 flex items-center justify-center">
            <span className="text-4xl">{image || '📷'}</span>
          </div>
        )}

        {/* Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Sewa
          </span>
          {condition && (
            <span className="bg-gray-100 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
              {condition}
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-500 hover:text-primary-600 transition-colors"
            aria-label="Tambah ke wishlist"
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{category}</p>
        <Link to={productLink}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
            {name}
          </h3>
        </Link>

        {/* Rating */}
        {rating && (
          <div className="flex items-center space-x-1 mb-2">
            <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
            <span className="text-xs text-gray-600">{rating}</span>
          </div>
        )}

        {/* Price */}
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2">
          <div className="flex items-baseline flex-wrap gap-x-1 min-w-0">
            <span className="text-base sm:text-lg font-semibold text-gray-900 break-words">
              {formatPrice(price)}
            </span>
            <span className="text-xs text-gray-500 whitespace-nowrap">/hari</span>
          </div>
          <Link
            to={productLink}
            className="flex items-center space-x-1 text-xs text-primary-600 hover:text-primary-700 font-medium whitespace-nowrap flex-shrink-0"
          >
            <Calendar className="w-3 h-3" />
            <span>Booking</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
