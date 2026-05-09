# Skenario End-to-End: Andi dan Target Keyboard Rp 1.000.000

> **Profil Pengguna**
> - **Nama:** Andi Pratama
> - **Status:** Mahasiswa
> - **Pemasukan:** Uang saku Rp 500.000 / minggu
> - **Target:** Membeli keyboard mechanical seharga Rp 1.000.000
> - **Masalah:** Uang selalu habis tanpa tahu kemana perginya, gagal menabung

---

## Fase 1 — Onboarding (Minggu ke-1, Hari ke-1)

### 1.1 Andi Mendaftar Akun (UC-01)

Andi membuka aplikasi FAST di browser ponselnya. Karena belum punya akun, sistem mengarahkannya ke halaman **Register**. Andi mengisi form: nama "Andi Pratama", email "andi@email.com", dan password. Frontend memvalidasi format email dan kekuatan password, lalu mengirim `POST /auth/register` ke backend. Backend melakukan hashing password dengan bcrypt, menyimpan data user ke database via parameterized query, dan mengirim email verifikasi secara asinkron. Backend men-generate JWT token dan mengembalikan `201 Created { token, user }`. Frontend menyimpan token ke localStorage dan **langsung mengarahkan Andi ke Dashboard** — tanpa redirect ke halaman Login **(UC-01)**.

### 1.2 Mencatat Pemasukan Pertama (UC-05)

Dashboard masih kosong. Andi menekan "Catat Pemasukan" dan mengisi: **nominal Rp 500.000**, **kategori "Uang Saku"**, **deskripsi "Uang saku minggu 1"**, **tanggal hari ini**. Frontend memvalidasi nominal > 0, lalu mengirim `POST /transactions { type: income, amount: 500000, category_id, desc, date }`. Backend memverifikasi JWT, menyimpan transaksi ke database, dan mendapat `transaction.id`.

Backend menjalankan **background process** untuk alokasi anggaran dan tabungan — namun karena Andi belum mengatur keduanya, proses berjalan tetapi tidak melakukan apa-apa. Dashboard menampilkan saldo Rp 500.000 **(UC-05)**.

### 1.3 Mengatur Alokasi Anggaran (UC-07, UC-08)

Andi membuka menu "Alokasi Anggaran". Frontend mengirim `GET /api/budget-allocations?month=current` — hasilnya kosong karena belum ada konfigurasi. Andi mengisi alokasi dalam bentuk **persentase** dengan periode **mingguan**:

| Kategori | % | Nominal/Minggu |
|---|---|---|
| Makanan & Minuman | 40% | Rp 200.000 |
| Transportasi | 20% | Rp 100.000 |
| Gaya Hidup | 15% | Rp 75.000 |
| Obat-obatan | 5% | Rp 25.000 |
| *Tabungan* | *20%* | *Rp 100.000* |

Frontend memvalidasi total ≤ 100%, lalu mengirim `POST /budget-allocations { allocations[{ category_id, pct, period }] }`. Backend melakukan UPSERT ke tabel `budget_allocations`.

Setelah tersimpan, backend otomatis menjalankan **Rekomendasi Alokasi (UC-08)**. Berikut proses kalkulasinya:

#### Cara Kerja Rule 50/30/20

Rule 50/30/20 adalah standar perencanaan keuangan yang membagi pemasukan menjadi **3 kelompok besar**:

| Kelompok | Ideal | Penjelasan |
|---|---|---|
| **Kebutuhan (Needs)** | **50%** | Pengeluaran wajib yang tidak bisa dihindari: makanan, transportasi, obat-obatan, tagihan |
| **Keinginan (Wants)** | **30%** | Pengeluaran yang bisa ditunda/dikurangi: hiburan, jajan, gaya hidup, langganan |
| **Tabungan (Savings)** | **20%** | Uang yang disisihkan untuk masa depan: tabungan, investasi, dana darurat |

#### Kalkulasi untuk Andi

Backend mengambil 3 data: (1) histori pengeluaran 1 bulan per kategori, (2) alokasi % user saat ini, (3) total pemasukan. Lalu memetakan setiap kategori Andi ke kelompok 50/30/20:

**Langkah 1 — Mapping kategori ke kelompok:**

| Kategori Andi | Alokasi | Kelompok 50/30/20 |
|---|---|---|
| Makanan & Minuman (40%) | Rp 200.000 | **Kebutuhan (Needs)** |
| Transportasi (20%) | Rp 100.000 | **Kebutuhan (Needs)** |
| Obat-obatan (5%) | Rp 25.000 | **Kebutuhan (Needs)** |
| Gaya Hidup (15%) | Rp 75.000 | **Keinginan (Wants)** |
| Tabungan (20%) | Rp 100.000 | **Tabungan (Savings)** |

**Langkah 2 — Hitung rasio aktual per kelompok:**

| Kelompok | Rasio Aktual Andi | Standar 50/30/20 | Status |
|---|---|---|---|
| Kebutuhan | 40% + 20% + 5% = **65%** | 50% | ⚠️ Lebih tinggi 15% |
| Keinginan | **15%** | 30% | ✅ Di bawah batas |
| Tabungan | **20%** | 20% | ✅ Sesuai standar |
| **Total** | **100%** | **100%** | — |

**Langkah 3 — Buat rekomendasi konkret:**

Backend membandingkan rasio aktual vs standar dan menghasilkan:
- Kebutuhan 65% > 50%: _"Alokasi kebutuhan Anda 15% di atas standar. Ini wajar untuk mahasiswa, namun pertimbangkan mencari alternatif transportasi yang lebih murah."_
- Keinginan 15% < 30%: _"Pengeluaran gaya hidup Anda terkontrol — 15% di bawah batas."_
- Tabungan 20% = 20%: _"Rasio tabungan Anda sudah sesuai standar 50/30/20. Pertahankan!"_

**Kesimpulan sistem:** Alokasi Andi mendekati ideal — meskipun kebutuhan sedikit tinggi, keinginan rendah sehingga mengompensasi. Frontend menampilkan **donut chart** distribusi 3 kelompok (65/15/20) dan rekomendasi di atas **(UC-07, UC-08)**.

### 1.4 Membuat Target Tabungan Keyboard (UC-11, UC-12)

Andi membuka "Target Tabungan" dan menekan "Tambah Target Tabungan". Dia mengisi: **nama "Keyboard Mechanical"**, **target Rp 1.000.000**, **saldo awal Rp 0**, **tanggal target "1 bulan lagi"**, **alokasi 20% dari pemasukan**. Frontend memvalidasi (target > 0, alokasi > 0) lalu mengirim `POST /saving-goals { goal_name, target_amount: 1000000, current_amount: 0, target_date, allocation_pct: 20 }`.

Backend mengambil rata-rata pemasukan Andi (Rp 500.000/minggu), menghitung estimasi alokasi bulanan = Rp 500.000 × 20% × 4 minggu = **Rp 400.000/bulan**, dan menghitung `estimated_completion_date` — target Rp 1.000.000 tercapai dalam **~2.5 minggu** (10 hari setelah estimasi 1 bulan Andi). Backend menyimpan target dengan `status=active`.

Frontend langsung me-render **Progress Bar (UC-12)**: progress 0%, label "Rp 0 dari Rp 1.000.000", estimasi pencapaian "~2.5 minggu", info alokasi "20% dari pemasukan", dan terakhir auto-update "belum ada". Karena target realistis, tidak ada saran penyesuaian **(UC-11, UC-12)**.

### 1.5 Mengatur Peringatan Batas Pengeluaran (UC-09)

Andi mengaktifkan peringatan untuk kategori "Gaya Hidup" dengan threshold **80%** — artinya peringatan muncul jika pengeluaran mencapai 80% × Rp 75.000 = **Rp 60.000**. Frontend mengirim `PATCH /budget-allocations/:id { warning_threshold_pct: 80 }`. Backend menyimpan threshold, memeriksa pengeluaran saat ini (masih Rp 0), dan tidak memicu notifikasi **(UC-09)**.

---

## Fase 2 — Pencatatan Pengeluaran Harian (Minggu ke-1)

### 2.1 Pengeluaran Manual: Angkot (UC-06)

Andi naik angkot ke kampus. Sepulang kuliah, dia buka FAST → "Catat Pengeluaran" → pilih **Input Manual**. Andi mengisi: **toko "Angkot Jurusan A"**, **tanggal hari ini**, **item "Ongkos angkot PP" Rp 20.000**. Frontend menghitung total otomatis dan mengirim `POST /expenses/manual { store, date, items[], total }`.

Backend mengirim items ke **AI Service** untuk prediksi kategori. AI mengklasifikasikan "Ongkos angkot PP" → **"Transportasi"** (confidence tinggi), lalu menentukan kategori summary = "Transportasi". Backend menyimpan transaksi + items dengan kategori, lalu **memotong sisa alokasi Transportasi**: Rp 100.000 − Rp 20.000 = **Rp 80.000**. Backend memeriksa threshold → 20% terpakai, belum melewati batas. Dashboard terupdate **(UC-06)**.

### 2.2 Pengeluaran OCR: Struk Warteg (UC-06 → UC-13 → UC-14 → UC-15 → UC-16 → UC-17)

Sore hari, Andi makan di warteg dan dapat struk. Dia pilih **"Upload Struk OCR"**.

**Upload (UC-13):** Andi memfoto struk dan meng-upload gambar. Frontend memvalidasi (≤10MB, JPEG/PNG), menampilkan pratinjau, Andi klik "Proses Struk". Frontend mengirim `POST /receipts/upload` (multipart). Backend memvalidasi ulang ukuran/format/JWT, meng-upload file ke **cloud storage (S3/GCS)** secara async, mendapat `image_url`. Backend menyimpan data awal ke tabel receipts dengan `ocr_status=pending`, mengembalikan `202 Accepted`, dan frontend menampilkan **loading state** "Sedang memproses struk...". Backend memicu pipeline OCR secara async **(UC-13)**.

**Ekstraksi Teks (UC-14):** AIService meng-update status ke `processing`, lalu memanggil **Google Vision API** dengan `DOCUMENT_TEXT_DETECTION`. Vision API memproses gambar (bounding box, teks per blok, confidence), mengembalikan `fullTextAnnotation`. AIService mengekstrak `raw_text`, mencatat `processing_time_ms`, meng-update data struk di database, dan meneruskan raw_text ke proses strukturisasi **(UC-14)**.

**Strukturisasi Data (UC-15):** AIService menggunakan **regex** untuk mengekstrak field terstruktur dari raw_text: nama toko "Warteg Bahari", subtotal Rp 18.000, diskon Rp 0, pajak Rp 0, total Rp 20.000, metode pembayaran "tunai", dan daftar item ["Nasi + Lauk Rp 15.000", "Es Teh Rp 5.000"]. Data terstruktur disimpan ke tabel receipts **(UC-15)**.

**Klasifikasi Kategori (UC-16):** Setiap item dikirim ke **GenAI API** secara parallel. GenAI mengklasifikasikan "Nasi + Lauk" → "Makanan & Minuman" (confidence 0.97), "Es Teh" → "Makanan & Minuman" (confidence 0.95). Hasil disimpan ke tabel `receipt_items` dengan `confidence_score`. Status receipt di-update ke `ocr_status=success` **(UC-16)**.

**Validasi Manual (UC-17):** Frontend menerima notifikasi WebSocket bahwa OCR selesai, lalu meminta `GET /api/receipts/1/result`. Backend mengembalikan data struk dan items dengan confidence. Frontend me-render **tabel item** dengan badge confidence. Andi melihat semua data sudah benar — nama toko, items, harga, kategori — dan **tidak perlu koreksi**. Dia klik "Simpan Transaksi". Frontend mengirim `POST /api/receipts/1/confirm`, backend menyimpan ke tabel transactions, dan mengembalikan `201 Created`. Sisa alokasi Makanan berkurang: Rp 200.000 − Rp 20.000 = **Rp 180.000** **(UC-17)**.

> **Catatan:** Field OCR **persis sama** dengan field manual — nama toko, items (nama + harga), tanggal, total. Keduanya sinkron.

### 2.3 Peringatan Gaya Hidup! (UC-10)

Beberapa hari kemudian, Andi sudah mengeluarkan: kopi Rp 25.000 + jajan Rp 35.000 = **Rp 60.000** untuk Gaya Hidup — tepat **80%** dari alokasi Rp 75.000.

Saat mencatat pengeluaran jajan **(UC-06)**, backend menghitung persentase pengeluaran vs alokasi anggaran dan mendeteksi threshold terlampaui. Backend langsung memicu **Notifikasi Peringatan (UC-10)**: menyimpan notifikasi ke database (`type=budget_warning, is_read=false`), lalu **push notification real-time** via WebSocket ke browser Andi. Toast alert muncul: _"⚠️ Peringatan: Anggaran Gaya Hidup sudah 80% terpakai (Rp 60.000 dari Rp 75.000). Sisa Rp 15.000."_

Andi mengklik notifikasi, frontend mengirim `PATCH /notifications/:id { is_read: true }`, badge notifikasi berkurang. **Momen "aha!"** — Andi akhirnya tahu kenapa uangnya cepat habis **(UC-10)**.

---

## Fase 3 — Minggu ke-2: Auto-Alokasi Bekerja

### 3.1 Pemasukan Baru + Background Process (UC-05)

Awal minggu ke-2, Andi mencatat pemasukan Rp 500.000 **(UC-05)**. Setelah backend menyimpan transaksi, **dua background process** berjalan otomatis:

1. **Auto-Alokasi Anggaran (UC-07):** Backend membaca konfigurasi alokasi aktif, lalu loop setiap kategori: Makanan +Rp 200.000, Transportasi +Rp 100.000, Gaya Hidup +Rp 75.000, Obat +Rp 25.000 — masing-masing di-update via `UPDATE budget_categories SET remaining += calculated`.

2. **Auto-Alokasi Tabungan (UC-11):** Backend membaca target "Keyboard Mechanical" (aktif, alokasi 20%). Dari Rp 500.000: **Rp 100.000 otomatis dialokasikan** via `UPDATE saving_goals SET current_amount += 100000`. Backend juga recalculate `estimated_completion_date`.

Dashboard terupdate: saldo bertambah, anggaran di-refresh, **progress bar tabungan naik ke 10%** (Rp 100.000 / Rp 1.000.000). Semua dalam satu klik **(UC-05)**.

### 3.2 Cek Progress Tabungan (UC-12)

Andi membuka kartu "Keyboard Mechanical". Frontend meminta `GET /api/saving-goals/:id`. Backend menghitung `progress_pct = 100000/1000000 × 100 = 10%`, `months_remaining` berdasarkan allocation_pct, dan mengambil tanggal pemasukan terakhir. Response: `{ progress_pct: 10, months_remaining: 2.25, on_track: true, last_auto_update: today }`.

Frontend menampilkan: progress bar **10%**, label "Rp 100.000 dari Rp 1.000.000", estimasi "~2 minggu lagi", info "20% dari pemasukan (Rp 100.000/minggu)", terakhir auto-update hari ini. Status **on track** — tidak ada saran penyesuaian **(UC-12)**.

---

## Fase 4 — Minggu ke-3: Dashboard & Analitik

### 4.1 Pantau Dashboard (UC-18, UC-20)

Andi membuka Dashboard. Frontend mengirim `GET /api/dashboard?period=monthly`. Backend mengambil summary transaksi (daily, weekly, monthly, by_category), status budget per kategori, lalu meminta insight AI. AIService mengecek cache di tabel `ai_insights` — **cache miss** (belum ada insight bulan ini).

**Generate Insight GenAI (UC-20):** AIService mengambil data mentah transaksi dari database, menyusun spending_summary, lalu memanggil **GenAI API** dengan `POST /generateContent { systemInstruction, contents: [spending_json], generationConfig: { temperature: 0.7, maxOutputTokens: 512 } }`. GenAI mengembalikan insight teks, misalnya: _"Pengeluaran Gaya Hidup Anda mendekati batas setiap minggu. Pertimbangkan mengurangi frekuensi ngopi di kafe."_ AIService menyimpan insight ke cache (`INSERT INTO ai_insights`) untuk menghindari request berulang bulan ini **(UC-20)**.

Dashboard menampilkan: kartu ringkasan keuangan, pie chart distribusi, bar chart, dan **insight AI** di bawahnya **(UC-18)**.

### 4.2 Visualisasi Grafik (UC-19, UC-20)

Andi membuka halaman Analitik. Frontend mengirim `GET /api/analytics?period=monthly`. Backend mengambil agregasi per kategori, tren mingguan, dan total pemasukan.

Frontend me-render **pie chart** (distribusi pengeluaran: Makanan 50%, Transportasi 25%, Gaya Hidup 25%) dan **bar chart** (income vs expense per minggu — income Rp 500.000 stabil, expense bervariasi). Di bawah grafik, frontend memuat insight dari cache **(UC-20)** **(UC-19)**.

### 4.3 Skor Kesehatan Keuangan (UC-22)

Andi penasaran dengan skor kesehatannya. Frontend mengirim `GET /api/financial-health-score?month=current`. Backend mengecek cache — belum ada, jadi menghitung baru dengan **3 dimensi**:

1. **Konsistensi Pencatatan (40 poin):** Andi mencatat 18 dari 21 hari → 18/21 × 40 = **34.3 poin**
2. **Rasio Tabungan (35 poin):** Rp 200.000 tabungan / Rp 1.000.000 income × 35 = **7.0 poin**
3. **Kontrol Anggaran (25 poin):** 1 kali warning → max(0, 25 − 1×5) = **20 poin**

**Total: 61.3/100.** Backend menyimpan ke cache `financial_health_scores`. Frontend me-render gauge meter 61/100 dengan breakdown per dimensi **(UC-22)**.

---

## Fase 5 — Akhir Bulan: Profil & Rekapan

### 5.1 Profil Keuangan (UC-21)

Andi membuka "Profil Keuangan". Frontend mengirim `GET /api/profile/financial`. Backend mengambil `financial_profiles` (income range, spending habit, financial goal) dan biodata user. Frontend me-render halaman profil lengkap.

Halaman ini juga memicu dua ekstensi: **Skor Kesehatan (UC-22)** — kali ini cache hit, langsung tampil — dan **Rekapan Pengeluaran (UC-23)** **(UC-21)**.

### 5.2 Rekapan Pengeluaran + Export (UC-23)

Frontend mengirim `GET /api/transactions/summary?period=monthly`. Backend mengambil seluruh histori transaksi dengan JOIN kategori, menghitung agregat (total income, total expense, net balance, by_category), dan mengembalikan response.

Frontend me-render **tabel riwayat transaksi** dengan filter & pagination, serta **kartu ringkasan**: Total Pemasukan Rp 2.000.000, Total Pengeluaran Rp 1.600.000, Saldo Bersih Rp 400.000.

Andi ingin mengunduh laporan untuk arsip. Dia klik "Unduh PDF". Frontend mengirim `GET /api/transactions/export?format=pdf&period=monthly`. Backend men-generate dokumen PDF dari data transaksi, mengembalikan file binary. Browser memicu download **(UC-23)**.

---

## Fase 6 — Minggu ke-3: Target Tercapai! 🎉

### 6.1 Pemasukan Terakhir (UC-05)

> **Kalkulasi:**
> - Minggu 1: Rp 500.000 → tabungan Rp 0 (belum ada target saat input)
> - Minggu 2: Rp 500.000 → tabungan +Rp 100.000 = Rp 100.000
> - Minggu 3: Rp 500.000 → tabungan +Rp 100.000 = Rp 200.000

Setelah minggu ke-3, tabungan Andi baru Rp 200.000. Andi menyadari ini lambat, lalu memutuskan **menyesuaikan alokasi (UC-07)**: naikkan tabungan dari 20% → **40%** (Rp 200.000/minggu), kurangi Gaya Hidup 15% → 5%. Rekomendasi **(UC-08)** menunjukkan rasio baru masih sehat. Andi juga update target tabungan **(UC-11)** ke 40%.

> **Kalkulasi setelah penyesuaian:**
> - Minggu 3 (sudah masuk): Rp 200.000
> - Minggu 4: +Rp 200.000 = Rp 400.000
> - Minggu 5: +Rp 200.000 = Rp 600.000
> - Minggu 6: +Rp 200.000 = Rp 800.000
> - Minggu 7: +Rp 200.000 = **Rp 1.000.000 ✅**

Minggu ke-7, Andi mencatat pemasukan Rp 500.000 **(UC-05)**. Background process mengalokasikan Rp 200.000 ke tabungan **(UC-11)**. Progress bar **(UC-12)** menunjukkan:

- **Progress bar:** 100% ✅ (hijau penuh)
- **Label:** Rp 1.000.000 dari Rp 1.000.000
- **Status:** TARGET TERCAPAI! 🎉
- **Terakhir update otomatis:** Hari ini

---

## Ringkasan Alur Seluruh 23 Use Case

```
ONBOARDING (Hari 1):
  UC-01 → Registrasi Email → langsung ke Dashboard
  UC-05 → Catat pemasukan pertama Rp 500.000
  UC-07 → Set alokasi %: Makan 40%, Transport 20%, Gaya Hidup 15%, Obat 5%
  UC-08 → Rekomendasi 50/30/20 → alokasi Andi sudah sehat
  UC-11 → Buat target "Keyboard" Rp 1jt, alokasi 20%
  UC-12 → Progress bar 0%
  UC-09 → Set peringatan Gaya Hidup threshold 80%

PENCATATAN HARIAN (Minggu 1):
  UC-06 → Manual: angkot Rp 20.000 → AI prediksi "Transportasi"
  UC-06 → OCR: struk warteg → pipeline berikut:
    UC-13 → Upload gambar → cloud storage → status pending
    UC-14 → Google Vision API → ekstrak raw_text
    UC-15 → Regex strukturisasi: toko, items, total
    UC-16 → GenAI klasifikasi per item → "Makanan & Minuman"
    UC-17 → Validasi manual → konfirmasi → simpan transaksi
  UC-10 → Peringatan Gaya Hidup 80% → toast alert + WebSocket

AUTO-ALOKASI (Minggu 2+):
  UC-05 → Pemasukan → auto-alokasi anggaran (UC-07) + tabungan (UC-11)
  UC-12 → Progress naik otomatis setiap pemasukan dicatat

DASHBOARD & ANALITIK (Minggu 3):
  UC-18 → Dashboard: ringkasan + pie/bar chart + insight AI
  UC-20 → GenAI generate insight (cache miss → simpan ke DB)
  UC-19 → Halaman Analitik: pie chart + bar chart + insight (cache hit)
  UC-22 → Skor Kesehatan: konsistensi 34 + tabungan 7 + kontrol 20 = 61/100

PROFIL & RIWAYAT (Akhir Bulan):
  UC-21 → Profil Keuangan + trigger UC-22 dan UC-23
  UC-22 → Skor Kesehatan (cache hit)
  UC-23 → Rekapan transaksi + export PDF

PENYESUAIAN & TARGET TERCAPAI:
  UC-07 → Naikkan tabungan 20% → 40%
  UC-08 → Rekomendasi menyetujui rasio baru
  UC-11 → Update alokasi target
  UC-09 → Sesuaikan threshold Gaya Hidup
  UC-05 → Pemasukan minggu ke-7 → auto-alokasi tabungan (UC-11)
  UC-12 → Progress 100% — TARGET TERCAPAI! 🎉
```

> [!TIP]
> **Seluruh 23 UC tercover.** Andi hanya perlu: (1) catat pemasukan 1x/minggu, (2) catat pengeluaran saat terjadi, (3) sesekali cek dashboard. Sisanya — alokasi anggaran, progress tabungan, klasifikasi AI, insight, skor kesehatan — **semuanya otomatis**.
