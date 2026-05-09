# Skenario Pengguna: Andi dan Target Laptop Rp 6.000.000

> **Profil Pengguna**
> - **Nama:** Andi
> - **Status:** Mahasiswa
> - **Pemasukan:** Uang saku Rp 500.000 / minggu
> - **Target:** Membeli laptop seharga Rp 6.000.000
> - **Masalah:** Uang selalu habis tanpa tahu kemana perginya, tidak pernah berhasil menabung

---

## Minggu ke-1: Pertama Kali Menggunakan FAST

### Andi Mendaftar Akun Baru (UC-01)

Andi sudah lama frustrasi karena setiap minggu menerima uang saku Rp 500.000 dari orang tuanya, tetapi uang itu selalu habis bahkan sebelum minggu berikutnya. Dia tidak pernah tahu kemana uangnya pergi — apakah habis untuk makan, transportasi, atau jajan yang sebenarnya tidak perlu. Seorang temannya merekomendasikan aplikasi FAST (Financial Analysis & Smart Tracking), dan Andi memutuskan untuk mencoba.

Andi membuka aplikasi FAST melalui browser di ponselnya. Karena ini pertama kalinya, dia diarahkan ke halaman **Registrasi**. Andi memilih untuk mendaftar menggunakan email. Dia mengisi formulir registrasi dengan memasukkan nama lengkapnya "Andi Pratama", alamat email "andi.pratama@email.com", dan membuat password yang kuat. Setelah menekan tombol "Daftar", sistem memvalidasi inputnya di sisi frontend, lalu mengirimkan data ke backend. Backend melakukan hashing password menggunakan bcrypt, menyimpan data akun ke database, dan mengirimkan email verifikasi secara asinkron. Yang penting bagi Andi adalah: **dia langsung diarahkan ke Dashboard tanpa perlu login ulang** — token JWT sudah tersimpan otomatis di browsernya. Tidak ada langkah tambahan, tidak ada formulir yang harus diisi lagi. Andi langsung bisa mulai menggunakan aplikasi **(UC-01)**.

---

### Andi Mencatat Pemasukan Pertama (UC-05)

Begitu masuk ke Dashboard, Andi melihat bahwa saldo dan data keuangannya masih kosong. Sistem mengarahkan Andi untuk memulai dengan **mencatat pemasukan terlebih dahulu** — karena pemasukan adalah fondasi dari seluruh fitur FAST. Tanpa data pemasukan, sistem tidak bisa mengalokasikan anggaran maupun tabungan.

Andi menekan tombol "Catat Pemasukan" dan mengisi formulir dengan detail: **nominal Rp 500.000**, **kategori penghasilan "Uang Saku"**, **deskripsi "Uang saku minggu ke-1 Mei"**, dan **tanggal hari ini**. Setelah validasi input di frontend (memastikan nominal lebih dari 0 dan kategori terisi), data dikirim ke backend melalui `POST /transactions`. Backend memverifikasi token JWT Andi, lalu menyimpan transaksi pemasukan ke database.

Namun, karena ini adalah pemasukan pertama Andi dan dia belum mengatur alokasi anggaran maupun target tabungan, **proses background untuk alokasi anggaran dan tabungan berjalan tetapi tidak melakukan apa-apa** — belum ada konfigurasi yang aktif. Dashboard Andi sekarang menunjukkan saldo Rp 500.000 **(UC-05)**.

---

### Andi Mengatur Alokasi Anggaran (UC-07)

Setelah mencatat pemasukan, Andi mulai berpikir: "Dari Rp 500.000 per minggu, sebenarnya aku butuh berapa untuk apa saja?" Dia membuka menu **"Alokasi Anggaran"** di sidebar. Sistem menampilkan formulir kosong karena Andi belum pernah mengatur alokasi sebelumnya.

Andi mulai mengkustomisasi alokasi anggarannya dalam bentuk **persentase (%) dari pemasukan** dengan periode **mingguan** karena pemasukannya juga mingguan. Dia memikirkan kebutuhan rutinnya dan menetapkan:

| Kategori | Alokasi (%) | Nominal per Minggu |
|---|---|---|
| Makanan & Minuman | 40% | Rp 200.000 |
| Transportasi | 20% | Rp 100.000 |
| Gaya Hidup (jajan, hiburan) | 15% | Rp 75.000 |
| Obat-obatan & Kesehatan | 5% | Rp 25.000 |
| **Tabungan (dialokasikan nanti)** | **20%** | **Rp 100.000** |

Frontend memvalidasi bahwa total persentase tidak melebihi 100%. Andi menyisakan 20% untuk tabungan yang akan dia atur di langkah berikutnya. Setelah menekan "Simpan", data dikirim ke backend dan konfigurasi alokasi tersimpan. Backend juga secara otomatis menjalankan **Rekomendasi Alokasi (UC-08)** — menganalisis bahwa alokasi Andi sudah mendekati aturan 50/30/20 (Kebutuhan 65%, Keinginan 15%, Tabungan 20%), dan menampilkan donut chart distribusi beserta saran bahwa alokasi Andi sudah cukup sehat **(UC-07, UC-08)**.

---

### Andi Membuat Target Tabungan Laptop (UC-11)

Inilah yang paling Andi tunggu-tunggu. Dia sudah lama mengincar sebuah laptop untuk menunjang kuliahnya, dan harganya **Rp 6.000.000**. Andi membuka menu **"Target Tabungan"** dan menekan **"Tambah Target Tabungan"**.

Andi mengisi formulir target: **nama target "Laptop Baru"**, **jumlah target Rp 6.000.000**, **saldo awal Rp 0** (belum ada tabungan sebelumnya), **tanggal target "3 bulan lagi"**, dan yang terpenting — dia menetapkan **alokasi 20% dari setiap pemasukan** untuk tabungan ini. Frontend memvalidasi bahwa target dan persentase alokasi valid, lalu mengirim ke backend.

Backend melakukan kalkulasi penting: berdasarkan rata-rata pemasukan Andi (Rp 500.000/minggu = ~Rp 2.000.000/bulan), dengan alokasi 20%, maka **estimasi tabungan per bulan adalah Rp 400.000**. Backend menghitung bahwa dengan Rp 400.000/bulan, target Rp 6.000.000 akan tercapai dalam **sekitar 15 bulan** — lebih lama dari harapan Andi yang 3 bulan. Namun, target tetap tersimpan dengan status `active` dan estimasi tanggal pencapaian ditampilkan.

Yang membuat Andi lega adalah: **dia tidak perlu setiap minggu membuka aplikasi untuk meng-update progress tabungannya secara manual.** Setiap kali dia mencatat pemasukan **(UC-05)**, sistem FAST akan **secara otomatis** mengalokasikan 20% ke tabungan ini di background. Zero effort. Kartu target tabungan langsung muncul dengan **progress bar 0%** dan estimasi pencapaian **(UC-11, UC-12)**.

---

### Andi Mengatur Peringatan Batas Pengeluaran (UC-09)

Andi sadar bahwa kelemahannya adalah **gaya hidup** — dia sering jajan kopi dan nonton bioskop tanpa sadar sudah menghabiskan banyak uang. Untuk itu, dia membuka pengaturan anggaran dan **mengaktifkan peringatan** khusus untuk kategori "Gaya Hidup".

Andi menggeser slider threshold ke **80%** — artinya, jika pengeluaran gaya hidupnya sudah mencapai 80% dari alokasi (80% × Rp 75.000 = Rp 60.000), dia akan menerima peringatan. Backend menyimpan konfigurasi threshold ini dan memeriksa apakah pengeluaran saat ini sudah melewati batas baru. Karena Andi belum ada pengeluaran, belum ada notifikasi yang dipicu **(UC-09)**.

---

## Minggu ke-1: Pencatatan Pengeluaran Harian

### Andi Mencatat Pengeluaran Manual (UC-06)

Keesokan harinya, Andi naik angkot ke kampus dan membeli makan siang. Sepulang kuliah, dia membuka FAST dan menekan **"Catat Pengeluaran"**, lalu memilih **metode Input Manual**.

Andi mengisi: **nama toko "Angkot Jurusan A"**, **tanggal hari ini**, lalu menambahkan item: **"Ongkos angkot PP" dengan harga Rp 20.000**. Sistem menghitung total otomatis. Setelah submit, backend menerima data dan melakukan sesuatu yang menarik: **AI Service secara otomatis memprediksi kategori** untuk item ini. Model AI mengklasifikasikan "Ongkos angkot PP" ke kategori **"Transportasi"** dengan confidence tinggi. Andi tidak perlu memilih kategori secara manual — sistem yang menentukan.

Setelah transaksi tersimpan, backend langsung **memotong sisa alokasi anggaran** kategori Transportasi. Alokasi minggu ini Rp 100.000, dan sekarang sisa anggaran Transportasi menjadi **Rp 80.000**. Dashboard Andi langsung terupdate menunjukkan pemotongan ini **(UC-06)**.

---

### Andi Menggunakan OCR untuk Struk Makan (UC-06)

Sore harinya, Andi makan di warteg dan mendapatkan struk. Alih-alih menginput manual, Andi ingin mencoba fitur OCR. Dia menekan **"Catat Pengeluaran"** dan kali ini memilih **"Upload Struk OCR"**.

Andi memfoto struk dari warteg dan meng-upload gambarnya. Di balik layar, backend mengunggah gambar ke cloud storage, mengirimkannya ke Google Vision API untuk ekstraksi teks, lalu AI Service melakukan strukturisasi data — mengekstrak **nama toko "Warteg Bahari"**, **tanggal**, dan daftar item: **"Nasi + Lauk" Rp 15.000, "Es Teh" Rp 5.000**, dengan **total Rp 20.000**. Setiap item kemudian diklasifikasikan oleh GenAI: keduanya masuk kategori **"Makanan & Minuman"**.

Yang penting di sini adalah: **field yang dihasilkan OCR persis sama dengan field input manual** — nama toko, item (nama + harga), tanggal, total. Keduanya sinkron. Andi melihat form review yang sudah terisi otomatis dan memverifikasi bahwa datanya benar. Dia menekan "Konfirmasi", dan transaksi tersimpan. Sisa alokasi Makanan & Minuman minggu ini berkurang dari Rp 200.000 menjadi **Rp 180.000** **(UC-06)**.

---

### Andi Mendapat Peringatan! (UC-10)

Beberapa hari kemudian di minggu yang sama, Andi sudah mengeluarkan beberapa pengeluaran gaya hidup: kopi di kafe Rp 25.000, nonton bioskop Rp 35.000. Total pengeluaran gaya hidupnya sudah **Rp 60.000** — tepat **80%** dari alokasi Rp 75.000.

Saat Andi mencatat pembelian tiket bioskop **(UC-06)**, backend menghitung bahwa pengeluaran kategori "Gaya Hidup" sudah mencapai threshold 80% yang dia set sebelumnya. Sistem langsung memicu **Notifikasi Peringatan (UC-10)**. Backend menyimpan notifikasi ke database dan mengirimkan push notification real-time melalui WebSocket ke browser Andi. Sebuah **toast alert** muncul di layar: _"⚠️ Peringatan: Anggaran Gaya Hidup sudah 80% terpakai (Rp 60.000 dari Rp 75.000). Sisa Rp 15.000 untuk minggu ini."_

Andi terkejut — dia tidak sadar bahwa hanya dengan dua pengeluaran saja, anggaran gaya hidupnya hampir habis. Dia mengklik notifikasi untuk melihat detail, dan badge notifikasi berkurang setelah ditandai sudah dibaca. Ini adalah momen "aha!" pertama Andi: **sekarang dia tahu kenapa uangnya selalu habis** **(UC-10)**.

---

## Minggu ke-2: Ritme Mulai Terbentuk

### Pemasukan Baru + Auto-Alokasi (UC-05)

Awal minggu ke-2, Andi menerima uang saku lagi sebesar **Rp 500.000**. Dia membuka FAST dan mencatat pemasukan: **nominal Rp 500.000**, **kategori "Uang Saku"**, **deskripsi "Uang saku minggu ke-2 Mei"**, **tanggal hari ini**.

Kali ini, setelah backend menyimpan transaksi, terjadi **keajaiban di background** yang tidak memerlukan aksi apapun dari Andi:

1. **Auto-Alokasi Anggaran:** Sistem membaca konfigurasi alokasi yang sudah Andi set di minggu pertama **(UC-07)**. Dari Rp 500.000 pemasukan baru, sistem secara otomatis mendistribusikan:
   - Makanan & Minuman (40%): +Rp 200.000 → sisa anggaran di-refresh
   - Transportasi (20%): +Rp 100.000
   - Gaya Hidup (15%): +Rp 75.000
   - Obat-obatan (5%): +Rp 25.000

2. **Auto-Alokasi Tabungan:** Sistem membaca target tabungan "Laptop Baru" yang aktif dengan alokasi 20% **(UC-11)**. Dari Rp 500.000, sebesar **Rp 100.000 otomatis dialokasikan ke tabungan**. Progress tabungan Andi sekarang: Rp 100.000 dari Rp 6.000.000 (1.67%). Backend juga menghitung ulang `estimated_completion_date` berdasarkan tren terbaru.

Dashboard Andi langsung terupdate menunjukkan: saldo bertambah, anggaran per kategori di-refresh, dan **progress bar tabungan bergerak dari 0% ke 1.67%**. Semua ini terjadi dalam satu kali klik "Simpan Pemasukan" — tanpa ada input tambahan **(UC-05)**.

---

### Andi Mengecek Progress Tabungan (UC-12)

Penasaran, Andi membuka kartu target tabungan "Laptop Baru" untuk melihat detailnya. Sistem menampilkan:

- **Progress bar:** 1.67% (hijau, baru dimulai)
- **Label:** Rp 100.000 dari Rp 6.000.000
- **Estimasi:** Target tercapai ~Agustus 2027
- **Info alokasi:** 20% dari setiap pemasukan (Rp 100.000/minggu)
- **Terakhir update otomatis:** Hari ini (saat pemasukan minggu ke-2 dicatat)

Karena estimasi 15 bulan jauh lebih lama dari harapan Andi (3 bulan), sistem menampilkan saran: _"Untuk mencapai target dalam 3 bulan, pertimbangkan menaikkan alokasi menjadi ~100% — atau cari sumber pemasukan tambahan."_ Andi menyadari bahwa dengan Rp 100.000/minggu, dia membutuhkan 60 minggu. Tapi setidaknya, **progress-nya berjalan otomatis tanpa harus repot update manual setiap minggu** **(UC-12)**.

---

## Minggu ke-4: Kebiasaan Baru

### Rutinitas Pencatatan yang Konsisten

Sekarang Andi sudah terbiasa dengan ritme FAST. Setiap awal minggu, dia mencatat pemasukan Rp 500.000 **(UC-05)** — dan setiap kali itu terjadi, Rp 100.000 otomatis masuk ke tabungan laptop **(UC-11)**, sisa Rp 400.000 terdistribusi ke 4 kategori anggaran **(UC-07)**.

Setiap hari, Andi mencatat pengeluarannya — kadang manual untuk transaksi kecil seperti angkot, kadang OCR untuk struk dari minimarket atau warung yang memberikan struk **(UC-06)**. Dia mulai memperhatikan bahwa:

- Struk dari Indomaret yang berisi "Chitato Rp 12.000" dan "Coca-Cola Rp 8.000" secara otomatis diklasifikasikan AI ke **"Makanan & Minuman"**
- Item "Pulsa Rp 25.000" diklasifikasikan ke **"Gaya Hidup"**
- Semua field antara manual dan OCR **selalu sinkron** — tidak ada perbedaan format data

Di akhir minggu ke-4, progress tabungan Andi sudah:
- **Rp 400.000 dari Rp 6.000.000 (6.67%)**
- Terakumulasi otomatis dari 4x pemasukan mingguan

---

## Bulan ke-3: Evaluasi dan Penyesuaian

### Andi Mengevaluasi Pengeluarannya

Setelah 3 bulan (12 minggu) menggunakan FAST, Andi sudah mengumpulkan **Rp 1.200.000** di tabungan laptopnya (12 minggu × Rp 100.000). Progress bar menunjukkan **20%**. Masih jauh dari target, tetapi Andi mulai melihat pola menarik dari riwayat pengeluarannya.

Dari data yang terkumpul, Andi menyadari bahwa alokasi Gaya Hidup-nya (15% = Rp 75.000/minggu) **hampir selalu habis** dan bahkan beberapa kali memicu peringatan **(UC-10)**. Sementara alokasi Obat-obatan (5% = Rp 25.000/minggu) **hampir tidak pernah terpakai**. Ini adalah insight yang tidak akan pernah Andi dapatkan tanpa pencatatan yang konsisten.

### Andi Menyesuaikan Alokasi (UC-07, UC-08, UC-09, UC-11)

Berdasarkan insight tersebut, Andi memutuskan untuk mengubah alokasi anggarannya. Dia membuka menu "Alokasi Anggaran" dan melakukan penyesuaian:

| Kategori | Lama | Baru |
|---|---|---|
| Makanan & Minuman | 40% | 35% |
| Transportasi | 20% | 20% |
| Gaya Hidup | 15% | 10% |
| Obat-obatan | 5% | 5% |
| **Tabungan** | **20%** | **30%** |

Andi mengurangi Gaya Hidup dari 15% ke 10% dan Makanan dari 40% ke 35%, lalu meningkatkan alokasi tabungan dari 20% ke **30%**. Ini berarti tabungan per minggu naik dari Rp 100.000 menjadi **Rp 150.000**. Setelah menyimpan, sistem **Rekomendasi Alokasi (UC-08)** menghitung bahwa dengan 30% untuk tabungan, rasio Andi menjadi Kebutuhan 55% / Keinginan 10% / Tabungan 30% — bahkan **lebih baik** dari standar 50/30/20 **(UC-07, UC-08)**.

Andi juga memperbarui target tabungannya untuk merefleksikan alokasi baru 30% **(UC-11)**. Backend menghitung ulang: dengan Rp 150.000/minggu, sisa Rp 4.800.000 (Rp 6.000.000 − Rp 1.200.000) akan tercapai dalam **~32 minggu (8 bulan lagi)**.

Terakhir, Andi menyesuaikan threshold peringatan untuk Gaya Hidup: karena alokasi baru hanya Rp 50.000/minggu, dia set threshold **70%** — peringatan muncul di Rp 35.000 **(UC-09)**.

---

## Bulan ke-10: Target Tercapai! 🎉

### Momen Pencapaian

> **Catatan kalkulasi:**
> - Bulan 1–3 (12 minggu): 12 × Rp 100.000 = **Rp 1.200.000**
> - Bulan 4–10 (32 minggu): 32 × Rp 150.000 = **Rp 4.800.000**
> - **Total: Rp 6.000.000 ✅**

Setelah 10 bulan disiplin mencatat setiap pemasukan dan pengeluaran, setiap minggu tabungan teralokasi otomatis, progress bar "Laptop Baru" akhirnya menunjukkan angka yang Andi tunggu-tunggu.

Andi membuka FAST dan mencatat pemasukan minggu ini Rp 500.000 **(UC-05)**. Background process berjalan seperti biasa — Rp 150.000 otomatis dialokasikan ke tabungan **(UC-11)**. Dan kali ini, progress bar **(UC-12)** menunjukkan:

- **Progress bar:** 100% ✅ (hijau penuh)
- **Label:** Rp 6.000.000 dari Rp 6.000.000
- **Status:** TARGET TERCAPAI! 🎉
- **Terakhir update otomatis:** Hari ini

Andi tersenyum lebar. Dari seorang mahasiswa yang tidak tahu uangnya habis kemana, sekarang dia berhasil **menabung Rp 6.000.000 untuk laptop impiannya** — dan seluruh prosesnya **otomatis**, tanpa harus repot update progress manual setiap minggu.

---

## Ringkasan Alur Use Case yang Dilalui Andi

```
Minggu 1:
  UC-01 → Registrasi via Email, langsung ke Dashboard
  UC-05 → Catat pemasukan pertama Rp 500.000
  UC-07 → Atur alokasi % per kategori (mingguan)
  UC-08 → Terima rekomendasi 50/30/20
  UC-11 → Buat target tabungan "Laptop Baru" Rp 6.000.000 (20%)
  UC-12 → Lihat progress bar 0%
  UC-09 → Set peringatan Gaya Hidup 80%
  UC-06 → Catat pengeluaran: input manual (angkot) + OCR (struk warteg)
  UC-10 → Terima peringatan Gaya Hidup 80%

Minggu 2+:
  UC-05 → Catat pemasukan → trigger auto-alokasi anggaran (UC-07) + tabungan (UC-11)
  UC-06 → Catat pengeluaran harian (manual / OCR, AI kategorisasi otomatis)
  UC-10 → Notifikasi saat threshold terlampaui
  UC-12 → Progress tabungan naik otomatis setiap pemasukan dicatat

Bulan 3:
  UC-07 → Sesuaikan alokasi (naikkan tabungan 20% → 30%)
  UC-08 → Rekomendasi menyetujui rasio baru
  UC-11 → Perbarui target tabungan dengan alokasi baru (30%)
  UC-09 → Sesuaikan threshold peringatan Gaya Hidup (80% → 70%)

Bulan 10:
  UC-05 → Pemasukan terakhir → trigger auto-alokasi tabungan (UC-11)
  UC-12 → Progress bar penuh — TARGET TERCAPAI! 🎉
```

> [!TIP]
> **Kunci keberhasilan Andi:** Sistem FAST meminimalkan input berulang. Andi hanya perlu (1) mencatat pemasukan 1x per minggu, (2) mencatat pengeluaran saat terjadi, dan (3) sesekali mengevaluasi alokasi. Sisanya — distribusi anggaran, progress tabungan, peringatan — **semuanya otomatis di background**.
