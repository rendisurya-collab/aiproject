import { useState, useEffect } from 'react';
import { Heart, Users, Sparkles, Recycle, ShieldCheck, Award } from 'lucide-react';

const defaultSettings = {
  about_title: 'Platform Sewa Pernikahan yang Terpercaya',
  about_subtitle: 'Kami percaya bahwa setiap pasangan layak mendapatkan pernikahan impian tanpa harus menguras tabungan.',
  about_story_title: 'Cerita Kami',
  about_story_1: 'BridalNest lahir dari pengalaman pribadi pendiri kami yang menyadari bahwa busana dan dekorasi pernikahan berkualitas premium sering kali hanya dipakai sekali.',
  about_story_2: 'Sejak 2024, kami menghubungkan pemilik busana pernikahan berkualitas dengan calon pengantin yang ingin menyewa.',
  about_story_3: 'Lebih dari sekadar platform sewa, kami adalah komunitas yang mendukung pernikahan berkelanjutan.',
  about_quote: 'Sewa Elegan, Tampil Memukau',
  about_value_1_title: 'Berkelanjutan',
  about_value_1_desc: 'Mendukung ekonomi sirkular dengan memaksimalkan penggunaan produk pernikahan berkualitas melalui penyewaan.',
  about_value_2_title: 'Terpercaya',
  about_value_2_desc: 'Setiap produk diverifikasi kualitasnya dan setiap transaksi sewa dilindungi dengan sistem yang aman.',
  about_value_3_title: 'Kualitas Premium',
  about_value_3_desc: 'Hanya produk berkualitas tinggi yang lolos kurasi ketat tim kami untuk disewakan.',
  about_stat_1: '500+',
  about_stat_1_label: 'Produk Sewa',
  about_stat_2: '1,200+',
  about_stat_2_label: 'Booking Sukses',
  about_stat_3: '150+',
  about_stat_3_label: 'Penyewa Terverifikasi',
  about_stat_4: '4.9/5',
  about_stat_4_label: 'Rating Kepuasan',
  about_cta_title: 'Bergabung Bersama Kami',
  about_cta_desc: 'Punya busana atau dekorasi pernikahan yang ingin disewakan? Atau sedang mencari perlengkapan pernikahan impian untuk disewa?',
  about_image: '',
};

const valueIcons = [Recycle, ShieldCheck, Award];

export default function AboutPage() {
  const [s, setS] = useState(defaultSettings);

  useEffect(() => {
    async function fetchAbout() {
      try {
        const res = await fetch('/api/settings/about');
        if (res.ok) {
          const data = await res.json();
          if (data.settings && Object.keys(data.settings).length > 0) {
            setS((prev) => ({ ...prev, ...data.settings }));
          }
        }
      } catch (err) { /* use defaults */ }
    }
    fetchAbout();
  }, []);

  const values = [
    { icon: valueIcons[0], title: s.about_value_1_title, desc: s.about_value_1_desc },
    { icon: valueIcons[1], title: s.about_value_2_title, desc: s.about_value_2_desc },
    { icon: valueIcons[2], title: s.about_value_3_title, desc: s.about_value_3_desc },
  ].filter((v) => v.title);

  const stats = [
    { value: s.about_stat_1, label: s.about_stat_1_label },
    { value: s.about_stat_2, label: s.about_stat_2_label },
    { value: s.about_stat_3, label: s.about_stat_3_label },
    { value: s.about_stat_4, label: s.about_stat_4_label },
  ].filter((st) => st.value);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-gold-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" />
            <span>Tentang Kami</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-serif font-bold text-gray-900 mb-6">
            {s.about_title}
          </h1>
          {s.about_subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {s.about_subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {s.about_story_title && (
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6">
                  {s.about_story_title}
                </h2>
              )}
              <div className="space-y-4 text-gray-600">
                {s.about_story_1 && <p>{s.about_story_1}</p>}
                {s.about_story_2 && <p>{s.about_story_2}</p>}
                {s.about_story_3 && <p>{s.about_story_3}</p>}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-100 to-gold-100 rounded-2xl aspect-[4/3] flex items-center justify-center overflow-hidden">
              {s.about_image ? (
                <img src={s.about_image} alt="Tentang Kami" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center px-8">
                  <Sparkles className="w-16 h-16 text-primary-600 mx-auto mb-4" />
                  {s.about_quote && (
                    <p className="font-serif text-xl font-semibold text-primary-800">
                      &ldquo;{s.about_quote}&rdquo;
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      {values.length > 0 && (
        <section className="py-16 bg-blue-50/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Nilai Kami</h2>
              <p className="text-gray-600">Prinsip yang menjadi fondasi layanan kami</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, i) => {
                const Icon = value.icon;
                return (
                  <div key={i} className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
                    <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
                      <Icon className="w-7 h-7 text-primary-600" />
                    </div>
                    <h3 className="font-serif font-semibold text-gray-900 text-lg mb-3">{value.title}</h3>
                    <p className="text-sm text-gray-600">{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {stats.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-10">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-3xl lg:text-4xl font-serif font-bold text-white">{stat.value}</p>
                    <p className="text-primary-200 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {s.about_cta_title && (
        <section className="py-16 bg-sky-50/60">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Users className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              {s.about_cta_title}
            </h2>
            {s.about_cta_desc && (
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{s.about_cta_desc}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#" className="btn-primary">Mulai Menyewakan</a>
              <a href="#" className="btn-secondary">Mulai Menyewa</a>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
