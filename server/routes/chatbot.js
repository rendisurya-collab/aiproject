const express = require('express');
const { getDatabase } = require('../database/init');

const router = express.Router();

function resultToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map((row) => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

// Wedding knowledge base - keyword based matching
const knowledgeBase = [
  {
    keywords: ['halo', 'hai', 'hi', 'hello', 'assalamualaikum', 'pagi', 'siang', 'sore', 'malam'],
    response: 'Halo! 👋 Selamat datang di Rian Rias Pengantin. Saya siap membantu pertanyaan Anda seputar sewa busana pengantin, dekorasi, dan perlengkapan pernikahan. Ada yang bisa saya bantu?',
  },
  {
    keywords: ['sewa', 'rental', 'cara sewa', 'bagaimana sewa', 'proses sewa'],
    response: 'Cara sewa di Rian Rias Pengantin sangat mudah:\n1️⃣ Pilih produk di katalog\n2️⃣ Tentukan tanggal & durasi sewa\n3️⃣ Klik "Booking Sekarang" & isi form\n4️⃣ Tim kami akan menghubungi Anda untuk konfirmasi\n\nProduk dikirim H-1 sebelum acara dan dijemput H+1 setelahnya. 😊',
  },
  {
    keywords: ['gaun', 'dress', 'baju pengantin', 'busana', 'wedding dress'],
    response: 'Kami menyediakan berbagai gaun pengantin: ballgown, mermaid, A-line, dan lainnya. 👗\nTersedia dalam berbagai ukuran (S-XL) dengan fitting gratis. Semua gaun sudah termasuk veil dan petticoat. Silakan cek kategori "Gaun Pengantin" di katalog kami!',
  },
  {
    keywords: ['kebaya', 'beskap', 'adat', 'tradisional', 'jawa'],
    response: 'Untuk pernikahan adat, kami punya koleksi kebaya pengantin dan beskap Jawa modern. 🎎\nSet lengkap termasuk kain batik, selendang, blangkon, dan aksesoris. Cocok untuk akad maupun resepsi adat!',
  },
  {
    keywords: ['dekorasi', 'decoration', 'pelaminan', 'backdrop', 'dekor'],
    response: 'Paket dekorasi kami tersedia dengan berbagai tema: rustic garden, minimalis putih emas, dan custom sesuai keinginan. 🌸\nSudah termasuk backdrop, standing flower, centerpiece, dan setup + bongkar. Tim dekorasi profesional kami siap membuat hari Anda istimewa!',
  },
  {
    keywords: ['aksesoris', 'tiara', 'veil', 'sepatu', 'buket', 'bouquet', 'mahkota'],
    response: 'Kami menyediakan aksesoris pelengkap: tiara kristal, veil cathedral, sepatu heels, dan hand bouquet. 💍👠\nSemua bisa disewa terpisah atau paket. Cek kategori "Aksesoris" dan "Sepatu & Heels"!',
  },
  {
    keywords: ['harga', 'biaya', 'tarif', 'berapa', 'price', 'murah'],
    response: 'Harga sewa bervariasi tergantung produk:\n• Gaun pengantin: mulai Rp 1.800.000/hari\n• Kebaya/Beskap: mulai Rp 1.200.000/hari\n• Dekorasi: mulai Rp 5.500.000\n• Aksesoris: mulai Rp 200.000/hari\n\nHarga sudah termasuk perlengkapan pendukung. Cek detail di masing-masing produk ya! 💰',
  },
  {
    keywords: ['deposit', 'jaminan', 'dp', 'uang muka'],
    response: 'Untuk penyewaan, kami menerapkan sistem deposit 30% dari total sewa. 💳\nDeposit ini akan dikembalikan sepenuhnya setelah produk dikembalikan dalam kondisi baik. Aman dan transparan!',
  },
  {
    keywords: ['pengiriman', 'kirim', 'antar', 'delivery', 'ongkir'],
    response: 'Kami melayani pengiriman & penjemputan produk. 🚚\n• Produk dikirim H-1 sebelum tanggal acara\n• Dijemput H+1 setelah acara selesai\n• Packing khusus agar produk aman\n\nBiaya kirim tergantung lokasi, akan diinfokan saat konfirmasi booking.',
  },
  {
    keywords: ['ukuran', 'size', 'fitting', 'pas', 'kekecilan', 'kebesaran'],
    response: 'Tersedia berbagai ukuran dari S hingga XL untuk busana. 📏\nKami menyediakan fitting gratis sebelum hari H untuk memastikan busana pas di badan Anda. Beberapa produk juga bisa di-alter (disesuaikan). Konsultasikan dengan tim kami!',
  },
  {
    keywords: ['booking', 'pesan', 'order', 'tanggal', 'jadwal', 'reservasi'],
    response: 'Untuk booking, pilih produk yang diinginkan, tentukan tanggal acara dan durasi sewa, lalu isi form booking. 📅\nSebaiknya booking jauh-jauh hari (minimal 2 minggu sebelum acara) agar produk tersedia. Booking sekarang di katalog kami!',
  },
  {
    keywords: ['kondisi', 'bekas', 'baru', 'bersih', 'kualitas'],
    response: 'Semua produk kami terverifikasi kualitasnya. ✨\nProduk selalu dicuci/dry clean setelah setiap penyewaan. Kondisi produk tertera jelas di deskripsi (Seperti Baru, Sangat Baik, dll). Kami jaga kualitas untuk kepuasan Anda!',
  },
  {
    keywords: ['lokasi', 'alamat', 'dimana', 'toko', 'tempat', 'kota'],
    response: 'Rian Rias Pengantin melayani berbagai kota. 📍\nSetiap produk mencantumkan lokasi penyewa. Untuk detail lokasi dan kunjungan, silakan hubungi kami via WhatsApp atau isi form booking!',
  },
  {
    keywords: ['kontak', 'hubungi', 'whatsapp', 'wa', 'telepon', 'nomor', 'cs'],
    response: 'Anda bisa menghubungi kami melalui:\n📱 WhatsApp: +62 812-3456-7890\n📧 Email: hello@rianriaspengantin.id\n\nAtau langsung isi form booking, tim kami akan menghubungi Anda! 😊',
  },
  {
    keywords: ['terima kasih', 'makasih', 'thanks', 'thank you', 'oke', 'ok', 'sip'],
    response: 'Sama-sama! 😊 Senang bisa membantu. Kalau ada pertanyaan lain seputar pernikahan impian Anda, jangan ragu untuk bertanya ya. Semoga hari bahagia Anda berjalan lancar! 💐',
  },
  {
    keywords: ['batal', 'cancel', 'pembatalan', 'refund'],
    response: 'Untuk pembatalan booking, silakan hubungi tim kami sesegera mungkin. 📞\nKebijakan refund tergantung waktu pembatalan. Pembatalan H-7 sebelum acara umumnya mendapat refund penuh (kecuali deposit administrasi). Detail akan dijelaskan saat konfirmasi.',
  },
];

// POST /api/chatbot - Get chatbot response
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Pesan kosong' });

    const lowerMsg = message.toLowerCase();

    // Check if asking about specific products
    if (/(produk|katalog|apa saja|tersedia|koleksi|list)/i.test(lowerMsg)) {
      try {
        const db = await getDatabase();
        const catResult = db.exec('SELECT name FROM categories WHERE is_active = 1 ORDER BY sort_order LIMIT 10');
        const cats = resultToObjects(catResult).map(c => c.name);
        if (cats.length > 0) {
          return res.json({
            reply: `Kategori produk yang tersedia untuk disewa:\n${cats.map(c => `• ${c}`).join('\n')}\n\nSilakan buka menu "Katalog Sewa" untuk melihat semua produk beserta harga dan detailnya! 🛍️`,
          });
        }
      } catch (e) { /* fallback below */ }
    }

    // Match keywords in knowledge base
    let bestMatch = null;
    let maxScore = 0;
    for (const entry of knowledgeBase) {
      let score = 0;
      for (const keyword of entry.keywords) {
        if (lowerMsg.includes(keyword)) score += keyword.length;
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = entry;
      }
    }

    if (bestMatch && maxScore > 0) {
      return res.json({ reply: bestMatch.response });
    }

    // Default fallback
    res.json({
      reply: 'Maaf, saya belum sepenuhnya memahami pertanyaan Anda. 🤔\n\nSaya bisa membantu tentang:\n• Cara sewa & booking\n• Gaun, kebaya, dekorasi\n• Harga & deposit\n• Pengiriman & fitting\n\nCoba tanyakan hal spesifik, atau hubungi tim kami di WhatsApp +62 812-3456-7890 untuk bantuan lebih lanjut! 😊',
    });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ reply: 'Maaf, terjadi kesalahan. Silakan coba lagi.' });
  }
});

module.exports = router;
