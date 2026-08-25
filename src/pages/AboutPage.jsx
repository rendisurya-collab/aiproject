import { Heart, Users, Sparkles, Recycle, ShieldCheck, Award } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-gold-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>Tentang BridalNest</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            Platform Sewa Pernikahan yang
            <span className="text-primary-600"> Terpercaya</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami percaya bahwa setiap pasangan layak mendapatkan pernikahan impian tanpa
            harus menguras tabungan. BridalNest hadir sebagai solusi cerdas untuk sewa
            busana &amp; dekorasi pernikahan berkualitas.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                Cerita Kami
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  BridalNest lahir dari pengalaman pribadi pendiri kami yang menyadari bahwa
                  busana dan dekorasi pernikahan berkualitas premium sering kali hanya dipakai sekali.
                  Sementara banyak calon pengantin yang menginginkan produk premium tetapi terkendala budget.
                </p>
                <p>
                  Sejak 2024, kami menghubungkan pemilik busana pernikahan berkualitas dengan
                  calon pengantin yang ingin menyewa. Platform kami memungkinkan siapa saja untuk
                  menyewakan koleksi pernikahan mereka dengan aman dan nyaman.
                </p>
                <p>
                  Lebih dari sekadar platform sewa, BridalNest adalah komunitas yang mendukung
                  pernikahan berkelanjutan &mdash; di mana keindahan bisa dinikmati bersama
                  tanpa harus memiliki.
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-gold-100 rounded-2xl aspect-[4/3] flex items-center justify-center">
              <div className="text-center px-8">
                <Sparkles className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                <p className="font-serif text-xl font-semibold text-primary-800">
                  &ldquo;Sewa Elegan, Tampil Memukau&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Nilai Kami</h2>
            <p className="text-gray-600">Prinsip yang menjadi fondasi layanan kami</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Recycle, title: 'Berkelanjutan', desc: 'Mendukung ekonomi sirkular dengan memaksimalkan penggunaan produk pernikahan berkualitas melalui penyewaan.' },
              { icon: ShieldCheck, title: 'Terpercaya', desc: 'Setiap produk diverifikasi kualitasnya dan setiap transaksi sewa dilindungi dengan sistem yang aman.' },
              { icon: Award, title: 'Kualitas Premium', desc: 'Hanya produk berkualitas tinggi yang lolos kurasi ketat tim kami untuk disewakan.' },
            ].map((value) => (
              <div key={value.title} className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                  <value.icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-serif font-semibold text-gray-900 text-lg mb-3">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-10">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { value: '500+', label: 'Produk Sewa' },
                { value: '1,200+', label: 'Booking Sukses' },
                { value: '150+', label: 'Penyewa Terverifikasi' },
                { value: '4.9/5', label: 'Rating Kepuasan' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl lg:text-4xl font-serif font-bold text-white">{stat.value}</p>
                  <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
            Bergabung Bersama Kami
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Punya busana atau dekorasi pernikahan yang ingin disewakan? Atau sedang mencari
            perlengkapan pernikahan impian untuk disewa? Bergabunglah dengan komunitas BridalNest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#" className="btn-primary">Mulai Menyewakan</a>
            <a href="#" className="btn-secondary">Mulai Menyewa</a>
          </div>
        </div>
      </section>
    </div>
  );
}
