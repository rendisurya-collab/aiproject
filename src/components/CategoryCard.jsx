import { Link } from 'react-router-dom';

export default function CategoryCard({ category }) {
  const { name, icon, count, slug, gradient } = category;

  return (
    <Link
      to={`/products?category=${slug}`}
      className="group relative overflow-hidden rounded-xl p-6 text-center transition-transform duration-300 hover:scale-105"
    >
      <div className={`absolute inset-0 ${gradient} opacity-90`} />
      <div className="relative z-10">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-serif font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-600">{count} produk</p>
      </div>
    </Link>
  );
}
