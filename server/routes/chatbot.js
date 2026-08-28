const express = require('express');
const { getDatabase, saveDatabase } = require('../database/init');

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

// --- Text similarity helpers ---

// Normalize text: lowercase, remove punctuation, collapse spaces
function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Levenshtein distance for fuzzy word matching
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

// Are two words similar (allow small typos)?
function wordsSimilar(a, b) {
  if (a === b) return true;
  if (a.length < 4 || b.length < 4) return false;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  return dist / maxLen <= 0.25; // allow up to 25% difference
}

// Similarity score between user message and an FAQ entry (0..1)
function faqScore(userWords, faq) {
  const questionWords = normalize(faq.question).split(' ').filter(Boolean);
  const keywordList = (faq.keywords || '')
    .split(',')
    .map((k) => normalize(k))
    .filter(Boolean);

  let matches = 0;
  let keywordHits = 0;

  for (const uw of userWords) {
    // keyword match (strong signal)
    if (keywordList.some((kw) => kw && (uw === kw || uw.includes(kw) || kw.includes(uw) || wordsSimilar(uw, kw)))) {
      keywordHits++;
    }
    // question word overlap
    if (questionWords.some((qw) => wordsSimilar(uw, qw))) {
      matches++;
    }
  }

  const questionScore = questionWords.length ? matches / questionWords.length : 0;
  const keywordScore = keywordList.length ? keywordHits / Math.max(userWords.length, 1) : 0;
  // Weight keywords higher
  return Math.max(questionScore, keywordScore * 1.2);
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

const FALLBACK_REPLY = 'Maaf, saya belum punya jawaban untuk pertanyaan ini. 🤔\n\nPertanyaan Anda sudah kami catat dan tim kami akan segera melengkapi jawabannya. Untuk bantuan cepat, hubungi WhatsApp +62 812-3456-7890.\n\nSaya juga bisa membantu tentang: cara sewa, harga, deposit, pengiriman, dan fitting. 😊';

// Auto-save an unanswered question to the FAQ bank (dedup by normalized question)
async function autoSaveUnanswered(db, message) {
  try {
    const normalized = normalize(message);
    if (!normalized || normalized.length < 3) return;

    // Avoid duplicate pending entries
    const existing = db.exec('SELECT id FROM faq_bank WHERE LOWER(question) = ?', [message.toLowerCase().trim()]);
    if (existing.length > 0 && existing[0].values.length > 0) return;

    // Derive keywords from significant words
    const stopwords = ['yang', 'untuk', 'dengan', 'apakah', 'apa', 'bisa', 'saya', 'kah', 'dan', 'atau', 'di', 'ke', 'dari', 'ada', 'itu', 'ini'];
    const keywords = normalized.split(' ').filter((w) => w.length > 3 && !stopwords.includes(w)).slice(0, 6).join(',');

    db.run(
      'INSERT INTO faq_bank (question, keywords, answer, status, source) VALUES (?,?,?,?,?)',
      [message.trim(), keywords, null, 'pending', 'customer_auto_save']
    );
    saveDatabase();
  } catch (e) {
    console.error('Auto-save FAQ error:', e.message);
  }
}

// POST /api/chatbot - Get chatbot response
router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: 'Pesan kosong' });

    const lowerMsg = message.toLowerCase();
    const userWords = normalize(message).split(' ').filter(Boolean);
    const db = await getDatabase();

    // 1) Check dynamic FAQ bank (active + has answer) with fuzzy matching
    try {
      const faqResult = db.exec("SELECT * FROM faq_bank WHERE status = 'active' AND answer IS NOT NULL AND answer != ''");
      const faqs = resultToObjects(faqResult);
      let bestFaq = null;
      let bestFaqScore = 0;
      for (const faq of faqs) {
        const score = faqScore(userWords, faq);
        if (score > bestFaqScore) {
          bestFaqScore = score;
          bestFaq = faq;
        }
      }
      // Threshold for a confident match
      if (bestFaq && bestFaqScore >= 0.5) {
        db.run('UPDATE faq_bank SET hit_count = hit_count + 1 WHERE id = ?', [bestFaq.id]);
        saveDatabase();
        return res.json({ reply: bestFaq.answer, source: 'faq_bank' });
      }
    } catch (e) { /* continue */ }

    // 2) Live product/category query
    if (/(produk|katalog|apa saja|tersedia|koleksi|list)/i.test(lowerMsg)) {
      try {
        const catResult = db.exec('SELECT name FROM categories WHERE is_active = 1 ORDER BY sort_order LIMIT 10');
        const cats = resultToObjects(catResult).map(c => c.name);
        if (cats.length > 0) {
          return res.json({
            reply: `Kategori produk yang tersedia untuk disewa:\n${cats.map(c => `• ${c}`).join('\n')}\n\nSilakan buka menu "Katalog Sewa" untuk melihat semua produk beserta harga dan detailnya! 🛍️`,
          });
        }
      } catch (e) { /* continue */ }
    }

    // 3) Built-in static knowledge base
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
      return res.json({ reply: bestMatch.response, source: 'builtin' });
    }

    // 4) No match — auto-save the question as pending, return fallback
    await autoSaveUnanswered(db, message);
    res.json({ reply: FALLBACK_REPLY, source: 'fallback' });
  } catch (err) {
    console.error('Chatbot error:', err);
    res.status(500).json({ reply: 'Maaf, terjadi kesalahan. Silakan coba lagi.' });
  }
});

// ===== ADMIN FAQ MANAGEMENT =====
const { authenticateToken } = require('../middleware/auth');

// GET /api/chatbot/faq - Admin, list all FAQ (with optional status filter)
router.get('/faq', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const { status } = req.query;
    let sql = 'SELECT * FROM faq_bank';
    const params = [];
    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }
    sql += ' ORDER BY CASE status WHEN "pending" THEN 0 ELSE 1 END, created_at DESC';
    const result = db.exec(sql, params);
    res.json({ faqs: resultToObjects(result) });
  } catch (err) {
    console.error('Get FAQ error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// POST /api/chatbot/faq - Admin, add new FAQ manually
router.post('/faq', authenticateToken, async (req, res) => {
  try {
    const { question, keywords, answer, status } = req.body;
    if (!question) return res.status(400).json({ message: 'Pertanyaan wajib diisi' });

    const db = await getDatabase();
    db.run(
      'INSERT INTO faq_bank (question, keywords, answer, status, source) VALUES (?,?,?,?,?)',
      [question, keywords || null, answer || null, status || (answer ? 'active' : 'pending'), 'manual']
    );
    saveDatabase();
    res.status(201).json({ message: 'FAQ berhasil ditambahkan' });
  } catch (err) {
    console.error('Add FAQ error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// PUT /api/chatbot/faq/:id - Admin, edit/answer a FAQ
router.put('/faq/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { question, keywords, answer, status } = req.body;

    const db = await getDatabase();
    const existing = db.exec('SELECT * FROM faq_bank WHERE id = ?', [parseInt(id)]);
    if (!existing.length || !existing[0].values.length) {
      return res.status(404).json({ message: 'FAQ tidak ditemukan' });
    }
    const current = resultToObjects(existing)[0];

    // If answer is provided and status not explicitly set, auto-activate
    const finalStatus = status || (answer && answer.trim() ? 'active' : current.status);

    db.run(
      'UPDATE faq_bank SET question=?, keywords=?, answer=?, status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
      [
        question !== undefined ? question : current.question,
        keywords !== undefined ? keywords : current.keywords,
        answer !== undefined ? answer : current.answer,
        finalStatus,
        parseInt(id),
      ]
    );
    saveDatabase();
    res.json({ message: 'FAQ berhasil diperbarui' });
  } catch (err) {
    console.error('Update FAQ error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

// DELETE /api/chatbot/faq/:id - Admin, delete FAQ
router.delete('/faq/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    db.run('DELETE FROM faq_bank WHERE id = ?', [parseInt(req.params.id)]);
    saveDatabase();
    res.json({ message: 'FAQ berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

module.exports = router;
