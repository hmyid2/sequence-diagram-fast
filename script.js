const ucData = [
  {
    id: 'uc01', uc: 'UC-01', title: 'Registrasi via Email',
    actors: ['User', 'Frontend', 'Backend', 'Database', 'EmailService'],
    relation: null,
    note: 'Pendaftaran akun baru menggunakan Email. Sistem mengirimkan verifikasi dan mengarahkan pengguna ke Dashboard setelah berhasil.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant Email as EmailService

    Note over User, Email: Registrasi Akun Baru

    User->>UI: Isi Form Registrasi (Name, Email, Password)
    UI->>UI: Validasi Input
    UI->>Server: POST /register
    Server->>Server: Hash Password (bcrypt)
    %% Keterangan: Gunakan Parameterized Query (Prepared Statement) untuk cegah SQL Injection
    Server->>DB: INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)
    DB-->>Server: Return user.id
    Server-)Email: Kirim Email Verifikasi (Async)
    Server-->>UI: 200 OK (Token)
    UI->>UI: Simpan Token
    UI-->>User: Redirect ke Dashboard`
  },
  {
    id: 'uc02', uc: 'UC-02', title: 'Registrasi via Google Auth',
    actors: ['User', 'Frontend', 'Backend', 'Database', 'GoogleAuth'],
    relation: null,
    note: 'Pendaftaran akun baru menggunakan akun Google. Sistem mendaftarkan email dari Google dan mengarahkan ke Dashboard.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant Google as Google Auth API

    Note over User, Google: Registrasi via Google Auth

    User->>UI: Klik "Lanjutkan dengan Google"
    UI->>Google: Request OAuth Consent
    Google-->>User: Tampilkan Halaman Login Google
    User->>Google: Authorize & Consent
    Google-->>UI: Return Authorization Code
    UI->>Server: POST /auth/google { code }
    Server->>Google: Exchange Code for Profile
    Google-->>Server: User Profile (Email, Name)
    %% Keterangan: Gunakan Parameterized Query (Prepared Statement)
    Server->>DB: INSERT INTO users (name, email, google_id) VALUES (?, ?, ?)
    DB-->>Server: Return user.id
    Server-->>UI: 200 OK (Token)
    UI->>UI: Simpan Token
    UI-->>User: Redirect ke Dashboard`
  },
  {
    id: 'uc03', uc: 'UC-03', title: 'Login via Email',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: null,
    note: 'Autentikasi user dengan email dan password. Menghasilkan token untuk sesi yang aman dan diarahkan ke Dashboard.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Autentikasi via Email

    User->>UI: Submit Email & Password
    UI->>UI: Validasi Input
    UI->>Server: POST /login
    %% Keterangan: Gunakan Parameterized Query / Prepared Statement untuk cegah SQL Injection
    Server->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Server: Data User
    Server->>Server: Cek Password (bcrypt)

    alt Password tidak valid
        Server-->>UI: 401 Unauthorized
        UI-->>User: Tampilkan pesan error login
    else Password valid
        Server-->>UI: 200 OK (Token)
        UI->>UI: Simpan Token
        UI-->>User: Redirect ke Dashboard
    end`
  },
  {
    id: 'uc04', uc: 'UC-04', title: 'Login via Google Auth',
    actors: ['User', 'Frontend', 'Backend', 'Database', 'GoogleAuth'],
    relation: null,
    note: 'Autentikasi user menggunakan akun Google. Token akan dihasilkan dan user langsung dialihkan ke Dashboard.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant Google as Google Auth API

    Note over User, DB: Autentikasi via Google Auth

    User->>UI: Klik "Login dengan Google"
    UI->>Google: Request OAuth Consent
    Google-->>User: Tampilkan Halaman Login Google
    User->>Google: Authorize
    Google-->>UI: Return Authorization Code
    UI->>Server: POST /auth/google/login { code }
    Server->>Google: Exchange Code for Profile
    Google-->>Server: User Profile (Email)
    %% Keterangan: Gunakan Parameterized Query (Prepared Statement)
    Server->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Server: Data User
    Server-->>UI: 200 OK (Token)
    UI->>UI: Simpan Token
    UI-->>User: Redirect ke Dashboard`
  },
  {
    id: 'uc05', uc: 'UC-05', title: 'Catatan Pemasukan',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: null,
    note: 'Pencatatan transaksi manual khusus untuk pemasukan (income). Menambahkan saldo dan tidak memicu peringatan anggaran.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Pencatatan Pemasukan (Income) Manual

    User->>UI: Pilih menu "Catat Pemasukan"
    User->>UI: Isi jumlah, kategori penghasilan, deskripsi, tanggal
    UI->>UI: Validasi Input
    UI->>Server: POST /transactions { type: 'income' }
    Server->>Server: Verifikasi JWT
    Server->>DB: Simpan Transaksi Pemasukan
    DB-->>Server: Return transaction.id baru
    Server-->>UI: 201 Created
    UI-->>User: Update UI (Saldo bertambah)`
  },
  {
    id: 'uc06', uc: 'UC-06', title: 'Catatan Pengeluaran',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> UC-10, UC-13',
    note: 'Pencatatan pengeluaran (manual atau OCR). Setiap pengeluaran mengevaluasi budget—jika melewati warning_threshold, memicu notifikasi. OCR menyertakan validasi kembali oleh user.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Pencatatan Pengeluaran (Manual atau OCR)

    User->>UI: Pilih "Catat Pengeluaran"
    User->>UI: Pilih metode (Manual / Upload Struk)

    alt Metode Manual
        User->>UI: Isi form manual
        UI->>UI: Validasi Input Manual
        UI->>Server: POST /transactions { type: 'expense' }
        Server->>DB: Simpan Transaksi Pengeluaran
        DB-->>Server: Return transaction.id
    else Metode OCR
        Note over User, Server: <<extend>> Upload & Ekstraksi OCR (UC-13 s/d UC-17)
        User->>UI: Upload Gambar Struk
        UI->>Server: POST /receipts/upload
        Server-->>UI: Return hasil ekstraksi OCR
        UI-->>User: Tampilkan form validasi (feedback)
        User->>UI: Koreksi & Konfirmasi Input
        UI->>Server: POST /receipts/confirm
        Server->>DB: Simpan Transaksi Pengeluaran
        DB-->>Server: Return transaction.id
    end

    Server->>DB: Total Pengeluaran Kategori Bulan Ini
    DB-->>Server: Total
    Server->>Server: Hitung persentase vs budget limit

    alt Pengeluaran >= warning_threshold_pct
        Note over Server, DB: <<extend>> Notifikasi Peringatan (UC-10)
        Server->>DB: Buat Notifikasi Warning
        DB-->>Server: OK
    end

    Server-->>UI: 201 Created
    UI-->>User: Update UI`
  },
  {
    id: 'uc07', uc: 'UC-07', title: 'Atur Anggaran Bulanan',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<include>> UC-08',
    note: 'User menetapkan limit anggaran per kategori untuk bulan berjalan. Setelah budget disimpan, Backend secara otomatis memanggil logika UC-08 (Rekomendasi Alokasi) menggunakan histori transaksi 1 bulan terakhir.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Penetapan Anggaran Bulanan per Kategori [include UC-08]

    User->>UI: Buka menu Anggaran
    UI->>Server: GET /api/budgets?month=current
    %% Keterangan: SELECT * FROM budgets WHERE user_id=? AND period=current
    Server->>DB: Ambil Status Budget
    %% Keterangan: Return existing_budgets[]
    DB-->>Server: Data Budget
    %% Keterangan: 200 OK { existing_budgets[] }
    Server-->>UI: 200 OK
    %% Keterangan: Tampilkan form anggaran per kategori (pre-filled)
    UI-->>User: Form Anggaran

    %% Keterangan: Isi limit per kategori (Kebutuhan Pokok, Gaya Hidup, dst)
    User->>UI: Isi Limit Kategori
    %% Keterangan: POST /api/budgets { category_id, amount_limit, warning_threshold_pct, period }
    UI->>Server: POST /budgets
    %% Keterangan: INSERT/UPDATE budgets (UPSERT per kategori)
    Server->>DB: Simpan Budget
    DB-->>Server: Return budget records tersimpan

    Note over Server, DB: <<include>> Rekomendasi Alokasi Anggaran (UC-08)

    %% Keterangan: SELECT transactions GROUP BY category (historis 1 bulan)
    Server->>DB: Ambil Histori Transaksi
    %% Keterangan: Return spending_by_category[]
    DB-->>Server: Data Agregasi
    Server->>Server: Hitung rekomendasi alokasi 50/30/20

    %% Keterangan: 200 OK { budgets[], recommendations[] }
    Server-->>UI: 200 OK
    %% Keterangan: Tampilkan donut chart distribusi anggaran + rekomendasi
    UI-->>User: Tampilkan Chart & Saran`
  },
  {
    id: 'uc08', uc: 'UC-08', title: 'Rekomendasi Alokasi Anggaran',
    actors: ['Backend', 'Database'],
    relation: '<<include>> dari UC-07',
    note: 'Sub-proses yang selalu dipanggil saat UC-07 berjalan. Menganalisis histori pengeluaran lalu membandingkan dengan aturan 50/30/20 untuk menghasilkan rekomendasi konkret per kategori.',
    code: `sequenceDiagram
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over Server, DB: Kalkulasi Rekomendasi 50/30/20 [include dari UC-07]

    %% Keterangan: SELECT category_id, SUM(amount) FROM transactions WHERE user_id=? AND type='expense' AND date >= 1_month_ago GROUP BY category_id
    Server->>DB: Total Pengeluaran 1 Bulan
    %% Keterangan: Return spending_by_category[]
    DB-->>Server: Data Agregasi
    %% Keterangan: SELECT monthly_income_range FROM financial_profiles WHERE user_id=?
    Server->>DB: Rentang Pemasukan
    DB-->>Server: Return income range user
    %% Keterangan: Hitung rasio aktual: Kebutuhan / Gaya Hidup / Tabungan
    Server->>Server: Hitung Rasio Aktual
    Server->>Server: Bandingkan dengan standar 50/30/20 rule
    Server->>Server: Buat rekomendasi konkret per kategori
    %% Keterangan: Return recommendations[] { category, current_pct, recommended_pct, suggested_limit }
    Server-->>Server: Return Rekomendasi`
  },
  {
    id: 'uc09', uc: 'UC-09', title: 'Atur Batas Pengeluaran Kategori',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> UC-10',
    note: 'User mengaktifkan peringatan dan mengatur persentase threshold (mis. 80%). Jika pengeluaran saat ini sudah melewati threshold baru, UC-10 (Notifikasi Peringatan) langsung dipicu.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Penetapan Threshold Peringatan per Kategori [extend UC-10]

    %% Keterangan: Di halaman Anggaran, aktifkan toggle "Peringatan Batas"
    User->>UI: Aktifkan Peringatan
    %% Keterangan: Geser slider threshold: 80% dari limit Gaya Hidup
    User->>UI: Set Threshold 80%
    %% Keterangan: PATCH /api/budgets/:id { warning_threshold_pct: 80 }
    UI->>Server: PATCH /budgets/:id
    %% Keterangan: UPDATE budgets SET warning_threshold_pct=80 WHERE id=?
    Server->>DB: Update Threshold
    DB-->>Server: Return updated budget
    %% Keterangan: SELECT SUM(amount) FROM transactions WHERE category_id=? AND month=current
    Server->>DB: SELECT SUM FROM transactions
    %% Keterangan: Return total pengeluaran kategori bulan ini
    DB-->>Server: Total Pengeluaran
    Server->>Server: Re-evaluasi vs threshold baru

    alt Pengeluaran sudah >= threshold baru
        Note over Server, DB: <<extend>> Notifikasi Peringatan (UC-10)
        %% Keterangan: INSERT INTO notifications (user_id, budget_id, type="budget_warning")
        Server->>DB: Simpan Notifikasi
        DB-->>Server: OK
    end

    %% Keterangan: 200 OK { budget: updated, threshold_status }
    Server-->>UI: 200 OK
    %% Keterangan: Update UI — progress bar kategori berubah warna
    UI-->>User: Update UI`
  },
  {
    id: 'uc10', uc: 'UC-10', title: 'Notifikasi Peringatan',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> dari UC-09 / UC-05',
    note: 'Dipanggil secara kondisional ketika threshold terlampaui. Menyimpan notifikasi ke DB, push ke Frontend via WebSocket/SSE, dan menampilkan toast alert kepada user.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Push Notifikasi Real-time saat Threshold Terlampaui [extend dari UC-09/UC-05]

    %% Keterangan: Hitung current_spending / amount_limit × 100
    Server->>Server: Hitung Persentase Pengeluaran
    %% Keterangan: Threshold terlampaui (contoh: 82.4% > 80%)
    Server->>Server: Threshold Terlampaui
    %% Keterangan: INSERT INTO notifications (user_id, budget_id, type="budget_warning", title, message, is_read=false)
    Server->>DB: Simpan Notifikasi
    DB-->>Server: Return notification.id baru
    %% Keterangan: Push notification via WebSocket/SSE { notif_id, type, message }
    Server-)UI: Push Notifikasi Realtime
    %% Keterangan: Tampilkan toast alert "Peringatan Anggaran Gaya Hidup 82.4%"
    UI-->>User: Tampilkan Toast Alert

    Note over User, DB: User membaca dan membuka notifikasi

    User->>UI: Klik notifikasi untuk lihat detail
    %% Keterangan: PATCH /api/notifications/:id { is_read: true }
    UI->>Server: PATCH /notifications
    %% Keterangan: UPDATE notifications SET is_read=true WHERE id=?
    Server->>DB: Tandai Telah Dibaca
    DB-->>Server: OK
    %% Keterangan: 200 OK { updated notification }
    Server-->>UI: 200 OK
    UI-->>User: Badge notifikasi berkurang`
  },
  {
    id: 'uc11', uc: 'UC-11', title: 'Buat & Lacak Target Tabungan',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> UC-12',
    note: 'User membuat target tabungan baru. Backend menghitung monthly_allocation dan estimated_completion_date berdasarkan rata-rata income. Setelah tersimpan, UC-12 (Progress Bar) langsung di-render.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Pembuatan Target Tabungan dengan Estimasi Pencapaian [extend UC-12]

    User->>UI: Klik "Tambah Target Tabungan"
    %% Keterangan: Isi: nama target, jumlah target, saldo awal, tanggal target
    User->>UI: Isi Form Target
    %% Keterangan: POST /api/saving-goals { goal_name, target_amount, current_amount, target_date }
    UI->>Server: POST /saving-goals
    %% Keterangan: SELECT AVG(amount) FROM transactions WHERE type='income' AND user_id=?
    Server->>DB: Rata-rata Pemasukan
    DB-->>Server: Return avg_monthly_income
    %% Keterangan: Hitung monthly_allocation (20% dari income rata-rata)
    Server->>Server: Hitung Alokasi (20%)
    Server->>Server: Hitung estimated_completion_date berdasarkan tren tabungan
    %% Keterangan: INSERT INTO saving_goals (user_id, goal_name, target_amount, current_amount, target_date, monthly_allocation, estimated_completion_date, status='active')
    Server->>DB: Simpan Target Baru
    DB-->>Server: Return saving_goal.id baru
    %% Keterangan: 201 Created { saving_goal, progress_pct, estimated_date }
    Server-->>UI: 201 Created

    Note over UI, DB: <<extend>> Tampilan Progress Bar (UC-12)

    %% Keterangan: Render kartu target tabungan dengan progress bar
    UI-->>User: Tampilkan Progress Bar`
  },
  {
    id: 'uc12', uc: 'UC-12', title: 'Tampilan Progress Bar Tabungan',
    actors: ['Frontend', 'Backend', 'Database'],
    relation: '<<extend>> dari UC-11',
    note: 'Menampilkan progress visual tabungan secara real-time. Menghitung progress_pct, months_remaining, dan status on_track. Jika tidak on track, menampilkan saran tambahan tabungan.',
    code: `sequenceDiagram
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over UI, DB: Render Visual Progress Bar Target Tabungan [extend dari UC-11]

    UI->>Server: GET /api/saving-goals/:id
    %% Keterangan: SELECT * FROM saving_goals WHERE id=? AND user_id=?
    Server->>DB: Ambil Data Target
    %% Keterangan: Return { target_amount, current_amount, estimated_completion_date }
    DB-->>Server: Data Target
    %% Keterangan: Hitung progress_pct = current_amount / target_amount × 100
    Server->>Server: Hitung Persentase Progress
    Server->>Server: Hitung months_remaining berdasarkan monthly_allocation
    %% Keterangan: 200 OK { progress_pct: 16.7, months_remaining: 9.6, on_track: false }
    Server-->>UI: 200 OK
    UI-->>UI: Render progress bar hijau 16.7%
    %% Keterangan: Tampilkan label "Rp 2.5jt dari Rp 15jt"
    UI-->>UI: Tampilkan Label Target
    %% Keterangan: Tampilkan estimasi "Target tercapai ~Jan 2026"
    UI-->>UI: Tampilkan Estimasi

    alt Tidak on track
        UI-->>UI: Tampilkan saran "Tambah Rp 200rb/bulan"
    end`
  },
  {
    id: 'uc13', uc: 'UC-13', title: 'Upload Gambar Struk',
    actors: ['User', 'Frontend', 'Backend', 'Database', 'Storage'],
    relation: '<<include>> UC-14',
    isAI: true,
    note: 'Entry point pipeline OCR. File gambar divalidasi, diunggah ke object storage (S3/GCS), lalu Backend memicu pipeline OCR (UC-14) secara asinkron. Frontend menampilkan loading state.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant ST as Storage (S3/GCS)

    Note over User, ST: Upload Struk dan Inisiasi Pipeline OCR [include UC-14]

    %% Keterangan: Drag-drop atau pilih file gambar struk
    User->>UI: Pilih/Drop File Struk
    %% Keterangan: Validasi client-side: size <= 10 MB, format JPEG/PNG
    UI->>UI: Validasi Gambar
    UI-->>User: Render pratinjau gambar
    User->>UI: Klik tombol "Proses Struk"
    %% Keterangan: POST /api/receipts/upload (multipart/form-data)
    UI->>Server: POST /receipts/upload
    Server->>Server: Validasi ulang: ukuran, format, JWT
    Server-)ST: Upload file ke object storage async
    ST-->>Server: Return image_url permanent
    %% Keterangan: INSERT INTO receipts (user_id, image_url, file_size_kb, ocr_status='pending')
    Server->>DB: Simpan Data Awal
    DB-->>Server: Return receipt.id = 1
    %% Keterangan: 202 Accepted { receipt_id, status: "pending" }
    Server-->>UI: 202 Accepted
    %% Keterangan: Tampilkan loading state "Sedang memproses struk..."
    UI-->>User: Tampilkan Loading

    Note over Server: <<include>> Pipeline OCR (UC-14) dipanggil async
    %% Keterangan: Panggil AI Service untuk pipeline OCR secara async
    Server-)Server: Inisiasi Pipeline OCR`
  },
  {
    id: 'uc14', uc: 'UC-14', title: 'Ekstraksi Teks OCR dari Struk',
    actors: ['Backend', 'AIService', 'OCR API', 'Database'],
    relation: '<<include>> dari UC-13 → UC-15',
    isAI: true,
    note: 'Memanggil Google Vision API (DOCUMENT_TEXT_DETECTION) untuk mengekstrak teks dari gambar struk. Menyimpan processing_time_ms lalu meneruskan raw_text ke UC-15.',
    code: `sequenceDiagram
    participant Server as Backend (REST API)
    participant AI as AIService
    participant OCR as OCR API (Cloud Vision)
    participant DB as Database (SQL)

    Note over Server, DB: Ekstraksi Teks Gambar via Cloud Vision OCR [include dari UC-13]

    %% Keterangan: processReceiptOCR({ receiptId: 1, imageUrl, userId })
    Server->>AI: Mulai Proses OCR
    %% Keterangan: UPDATE receipts SET ocr_status='processing' WHERE id=1
    AI->>DB: Update Status: Processing
    DB-->>AI: OK
    %% Keterangan: POST /v1/images:annotate { imageUri, features: [DOCUMENT_TEXT_DETECTION] }
    AI->>OCR: Call Vision API
    %% Keterangan: Proses gambar: bounding box, teks per blok, confidence
    OCR->>OCR: Proses Visi Teks
    %% Keterangan: Return { fullTextAnnotation: { text, pages[blocks[confidence]] } }
    OCR-->>AI: Hasil Annotasi
    AI->>AI: Ekstrak raw_text dari fullTextAnnotation
    %% Keterangan: Rekam processing_time_ms = Date.now() - start
    AI->>AI: Catat Waktu Proses
    %% Keterangan: UPDATE receipts SET processing_time_ms=6840 WHERE id=1
    AI->>DB: Update Data Struk
    DB-->>AI: OK

    Note over AI: <<include>> Strukturisasi Data (UC-15)
    AI->>AI: Teruskan raw_text ke proses strukturisasi`
  },
  {
    id: 'uc15', uc: 'UC-15', title: 'Strukturisasi Data Transaksi dari Hasil OCR',
    actors: ['AIService', 'Database'],
    relation: '<<include>> dari UC-14 → UC-16',
    note: 'Menggunakan regex untuk mengekstrak field terstruktur dari raw_text: subtotal, diskon, pajak, total, metode pembayaran, dan daftar item. Hasilnya disimpan ke tabel receipts.',
    code: `sequenceDiagram
    participant AI as AIService
    participant DB as Database (SQL)

    Note over AI, DB: Parsing Teks OCR menjadi Data Terstruktur [include dari UC-14]

    AI->>AI: Regex extract SUBTOTAL → 68.180
    AI->>AI: Regex extract DISKON → 0
    AI->>AI: Regex extract PAJAK PPN 10% → 6.818
    AI->>AI: Regex extract TOTAL → 75.000
    %% Keterangan: Detect NON TUNAI → payment_method = 'non_tunai'
    AI->>AI: Ekstrak Metode Pembayaran
    %% Keterangan: Extract line items: [FL-Xmas 30 Off, Paket Slices, ...]
    AI->>AI: Ekstrak Daftar Item
    %% Keterangan: UPDATE receipts SET store_name=NULL, subtotal=68180, discount=0, tax_amount=6818, total_amount=75000, payment_method='non_tunai' WHERE id=1
    AI->>DB: Simpan Data Terstruktur
    DB-->>AI: Return updated receipt

    Note over AI: <<include>> Klasifikasi Kategori (UC-16)
    %% Keterangan: Teruskan items[] ke proses klasifikasi
    AI->>AI: Lanjut Klasifikasi`
  },
  {
    id: 'uc16', uc: 'UC-16', title: 'Klasifikasi Kategori Item Struk',
    actors: ['AIService', 'GenAI API', 'Database'],
    relation: '<<include>> dari UC-15 → UC-17',
    isAI: true,
    note: 'Setiap item struk diklasifikasikan ke kategori pengeluaran menggunakan GenAI API (parallel request). Confidence score disimpan untuk membantu UI menampilkan indikator keyakinan klasifikasi.',
    code: `sequenceDiagram
    participant AI as AIService
    participant GA as GenAI API
    participant DB as Database (SQL)

    Note over AI, DB: Klasifikasi Item Struk via GenAI (Parallel Request) [include dari UC-15]

    loop Setiap item struk (parallel request)
        %% Keterangan: POST /generateContent { prompt: "Klasifikasikan [item_name] ke: [Makanan, Gaya Hidup, Kebutuhan Pokok, ...]" }
        AI->>GA: Panggil GenAI Klasifikasi
        %% Keterangan: Return { text: "Gaya Hidup", confidence: 0.96 }
        GA-->>AI: Hasil Klasifikasi
    end

    %% Keterangan: INSERT INTO receipt_items (receipt_id=1, item_name='FL-Xmas 30 Off', qty=1, unit_price=68180, category_id=2, confidence_score=0.96)
    AI->>DB: Simpan Item #1
    DB-->>AI: OK
    %% Keterangan: INSERT INTO receipt_items (item_name='FL Cake French Vanilla', qty=1, price=0, category_id=2, confidence=0.91)
    AI->>DB: Simpan Item #2
    DB-->>AI: OK
    %% Keterangan: INSERT INTO receipt_items (item_name='FL Cake Green Tea', qty=1, price=0, category_id=2, confidence=0.89)
    AI->>DB: Simpan Item #3
    DB-->>AI: OK
    %% Keterangan: INSERT INTO receipt_items (item_name='FL Cake Belgium Choco', qty=1, price=0, category_id=2, confidence=0.88)
    AI->>DB: Simpan Item #4
    DB-->>AI: OK
    %% Keterangan: UPDATE receipts SET ocr_status='success', processing_time_ms=6840 WHERE id=1
    AI->>DB: Update Status: Success
    DB-->>AI: OK

    Note over AI: <<include>> Tampilan Validasi Manual (UC-17)`
  },
  {
    id: 'uc17', uc: 'UC-17', title: 'Tampilan Validasi Manual Data',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<include>> dari UC-16',
    note: 'Frontend menerima notifikasi WebSocket bahwa OCR selesai, lalu menampilkan tabel item dengan badge confidence. User dapat mengoreksi kategori yang salah sebelum menyimpan ke tabel transactions.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Validasi & Koreksi Manual Hasil OCR oleh User

    %% Keterangan: WebSocket/SSE: OCR selesai { receipt_id: 1 }
    Server-)UI: Notifikasi Realtime OCR
    UI->>Server: GET /api/receipts/1/result
    %% Keterangan: SELECT r.*, ri.* FROM receipts r JOIN receipt_items ri ON r.id=ri.receipt_id WHERE r.id=1
    Server->>DB: Ambil Hasil Akhir OCR
    %% Keterangan: Return { receipt, items[{ name, price, category, confidence }] }
    DB-->>Server: Data Struk & Item
    %% Keterangan: 200 OK { receipt, items[] dengan confidence_score }
    Server-->>UI: 200 OK
    %% Keterangan: Render tabel item: nama, kategori, harga, badge confidence
    UI-->>User: Render Tabel Item

    opt User melakukan koreksi kategori
        %% Keterangan: Klik kategori item, ubah ke kategori lain
        User->>UI: Koreksi Manual Kategori
        %% Keterangan: PATCH /api/receipt-items/:id { category_id: baru }
        UI->>Server: PATCH /receipt-items
        %% Keterangan: UPDATE receipt_items SET category_id=baru, is_manually_corrected=true WHERE id=?
        Server->>DB: Update Kategori Item
        DB-->>Server: OK
        %% Keterangan: 200 OK { updated item }
        Server-->>UI: 200 OK
        %% Keterangan: Update tampilan item dengan kategori baru
        UI-->>User: Update Tabel Item
    end

    User->>UI: Klik "Simpan Transaksi"
    UI->>Server: POST /api/receipts/1/confirm
    %% Keterangan: INSERT INTO transactions (user_id=1, receipt_id=1, category_id=2, type='expense', amount=75000)
    Server->>DB: Simpan Transaksi Final
    DB-->>Server: Return transaction.id = 3
    %% Keterangan: 201 Created { transaction_id: 3 }
    Server-->>UI: 201 Created
    %% Keterangan: Redirect ke riwayat transaksi, update dashboard
    UI-->>User: Redirect & Update`
  },
  {
    id: 'uc18', uc: 'UC-18', title: 'Pantau Dashboard',
    actors: ['User', 'Frontend', 'Backend', 'Database', 'AIService'],
    relation: '<<extend>> UC-20',
    isAI: true,
    note: 'Halaman utama yang menggabungkan data transaksi, status budget, dan insight AI. Insight di-cache di DB; jika belum ada untuk bulan ini, UC-20 (Generate Insight GenAI) dipanggil secara kondisional.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant AI as AIService

    Note over User, AI: Agregasi Data & Insight AI untuk Dashboard [extend UC-20]

    User->>UI: Buka halaman Dashboard / Beranda
    UI->>Server: GET /api/dashboard?period=monthly
    %% Keterangan: SELECT SUM(amount) FROM transactions WHERE user_id=? GROUP BY date
    Server->>DB: Ambil Summary Transaksi
    %% Keterangan: Return { daily_total, weekly_total, monthly_total, by_category[] }
    DB-->>Server: Data Ringkasan Transaksi
    %% Keterangan: SELECT * FROM budgets WHERE user_id=? AND period=current
    Server->>DB: Ambil Status Budget
    DB-->>Server: Return budget status per kategori
    %% Keterangan: checkOrGenerateInsight({ user_id, month, year })
    Server->>AI: Inisiasi Insight AI
    %% Keterangan: SELECT * FROM ai_insights WHERE user_id=? AND period=current
    AI->>DB: Cek Insight di Cache
    DB-->>AI: Return existing / null

    alt Cache hit — insight sudah ada
        %% Keterangan: Return { insight_text } dari cache
        AI-->>Server: Return Insight dari Cache
    else Cache miss — belum ada
        Note over AI: <<extend>> Generate Insight GenAI (UC-20)
        %% Keterangan: Return { insight_text } baru
        AI-->>Server: Return Insight Baru
    end

    %% Keterangan: 200 OK { summary, budget_status[], insight_text, charts_data[] }
    Server-->>UI: 200 OK
    %% Keterangan: Render kartu ringkasan, pie chart, bar chart, insight AI
    UI-->>User: Render Komponen Dashboard`
  },
  {
    id: 'uc19', uc: 'UC-19', title: 'Visualisasi Grafik Pengeluaran dan Pemasukan',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> UC-20',
    note: 'Halaman analitik yang menampilkan pie chart distribusi pengeluaran per kategori dan bar chart perbandingan income vs expense per minggu. Memuat insight dari UC-20 di bawah grafik.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Agregasi Data Analitik untuk Pie & Bar Chart [extend UC-20]

    %% Keterangan: Buka menu Analitik, pilih periode (bulan/minggu)
    User->>UI: Buka Halaman Analitik
    UI->>Server: GET /api/analytics?period=monthly&year=2025&month=4
    %% Keterangan: SELECT category_id, SUM(amount), COUNT(*) FROM transactions WHERE user_id=? AND period=? GROUP BY category_id
    Server->>DB: Ambil Agregasi Kategori
    %% Keterangan: Return spending_by_category[]
    DB-->>Server: Data Agregasi
    %% Keterangan: SELECT DATE_TRUNC('week', date), SUM(amount) FROM transactions GROUP BY week ORDER BY week
    Server->>DB: Ambil Agregasi Mingguan
    %% Keterangan: Return weekly_trend[]
    DB-->>Server: Data Tren Mingguan
    %% Keterangan: SELECT SUM(amount) FROM transactions WHERE type='income' AND period=?
    Server->>DB: Ambil Total Pemasukan
    DB-->>Server: Return total_income bulan ini
    %% Keterangan: 200 OK { pie_data[], bar_data[], income_total, expense_total }
    Server-->>UI: 200 OK
    %% Keterangan: Render pie chart: distribusi pengeluaran per kategori
    UI-->>User: Tampilkan Pie Chart
    %% Keterangan: Render bar chart: perbandingan income vs expense per minggu
    UI-->>User: Tampilkan Bar Chart

    Note over UI, DB: <<extend>> Generate Insight GenAI (UC-20)
    UI->>Server: GET /api/insights?period=monthly
    Server-->>UI: Return insight_text
    %% Keterangan: Tampilkan insight teks di bawah grafik
    UI-->>User: Tampilkan Teks Insight`
  },
  {
    id: 'uc20', uc: 'UC-20', title: 'Generate Insight Pengeluaran dengan GenAI',
    actors: ['Backend', 'AIService', 'GenAI API', 'Database'],
    relation: '<<extend>> dari UC-18 / UC-19',
    isAI: true,
    note: 'Membuat analisis keuangan personal menggunakan GenAI (temperature 0.7, max 512 token). Hasil insight di-cache di tabel ai_insights untuk menghindari request berulang pada bulan yang sama.',
    code: `sequenceDiagram
    participant Server as Backend (REST API)
    participant AI as AIService
    participant GA as GenAI API
    participant DB as Database (SQL)

    Note over Server, DB: Generasi Insight Keuangan via Gemini API dengan Caching [extend dari UC-18/UC-19]

    %% Keterangan: generateInsight({ user_id: 1, period_month: 4, period_year: 2025 })
    Server->>AI: Generate Insight Baru
    %% Keterangan: SELECT * FROM ai_insights WHERE user_id=? AND insight_type='spending_analysis' AND period=?
    AI->>DB: Cek Insight Cache
    DB-->>AI: Return existing / null

    alt Cache hit
        %% Keterangan: Return { insight_text } dari DB
        AI-->>Server: Return Insight (Cache)
    else Cache miss
        %% Keterangan: SELECT category, SUM(amount), COUNT(*) FROM transactions WHERE user_id=1 AND month=4 GROUP BY category
        AI->>DB: Ambil Data Mentah Transaksi
        DB-->>AI: Return spending_summary
        %% Keterangan: POST /generateContent { systemInstruction, contents: [{ role: "user", parts: [spending_json] }], generationConfig: { temperature: 0.7, maxOutputTokens: 512 } }
        AI->>GA: Panggil GenAI API
        %% Keterangan: Return { candidates[0].content.parts[0].text: insight_text }
        GA-->>AI: Hasil Teks GenAI
        %% Keterangan: INSERT INTO ai_insights (user_id, insight_type='spending_analysis', period_month, period_year, content_text, generated_at)
        AI->>DB: Simpan Insight ke Cache
        DB-->>AI: Return ai_insights.id baru
        %% Keterangan: Return { insight_text }
        AI-->>Server: Return Insight
    end

    %% Keterangan: Sertakan insight_text dalam response ke Frontend
    Server-->>Server: Kirim Insight ke Klien`
  },
  {
    id: 'uc21', uc: 'UC-21', title: 'Melihat Profil Keuangan Pengguna',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> UC-22, UC-23',
    note: 'Halaman profil yang memuat data user dan financial_profile sekaligus memicu UC-22 (Skor Kesehatan) dan UC-23 (Rekapan Pengeluaran) sebagai ekstensi konten tambahan.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Tampilan Profil Keuangan Lengkap [extend UC-22, UC-23]

    User->>UI: Klik menu "Profil Keuangan"
    UI->>Server: GET /api/profile/financial
    %% Keterangan: SELECT * FROM financial_profiles WHERE user_id=?
    Server->>DB: Ambil Profil Keuangan
    %% Keterangan: Return { monthly_income_range, spending_habit, financial_goal, onboarding_completed_at }
    DB-->>Server: Data Profil Keuangan
    %% Keterangan: SELECT id, name, gender, email FROM users WHERE id=?
    Server->>DB: Ambil Biodata User
    DB-->>Server: Return user record
    %% Keterangan: 200 OK { user, financial_profile }
    Server-->>UI: 200 OK
    %% Keterangan: Render halaman profil: info pribadi + profil keuangan
    UI-->>User: Render Halaman Profil

    Note over UI, DB: <<extend>> Skor Kesehatan Keuangan (UC-22)
    UI->>Server: GET /api/financial-health-score?month=current
    %% Keterangan: Return { score_total, breakdown }
    Server-->>UI: Data Skor Kesehatan
    UI-->>User: Tampilkan gauge skor kesehatan keuangan

    Note over UI, DB: <<extend>> Rekapan Pengeluaran (UC-23)
    UI->>Server: GET /api/transactions/summary?period=monthly
    %% Keterangan: Return { transactions[], summary }
    Server-->>UI: Data Rekapan Transaksi
    UI-->>User: Tampilkan tabel rekapan pengeluaran`
  },
  {
    id: 'uc22', uc: 'UC-22', title: 'Melihat Skor Kesehatan Keuangan',
    actors: ['Frontend', 'Backend', 'Database'],
    relation: '<<extend>> dari UC-21',
    note: 'Menghitung skor kesehatan keuangan 3 dimensi: konsistensi pencatatan (40 poin), rasio tabungan (35 poin), dan kontrol anggaran (25 poin). Hasil di-cache per bulan di tabel financial_health_scores.',
    code: `sequenceDiagram
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over UI, DB: Kalkulasi Skor Kesehatan Keuangan Bulanan [extend dari UC-21]

    UI->>Server: GET /api/financial-health-score?month=4&year=2025
    %% Keterangan: SELECT * FROM financial_health_scores WHERE user_id=? AND period_month=4 AND period_year=2025
    Server->>DB: Cek Cache Skor
    DB-->>Server: Return existing score / null

    alt Score bulan ini sudah ada (cache)
        %% Keterangan: 200 OK { score_total, breakdown }
        Server-->>UI: 200 OK (Cache)
    else Belum ada — hitung baru
        %% Keterangan: SELECT COUNT(DISTINCT DATE(transaction_date)) FROM transactions WHERE user_id=? AND month=4
        Server->>DB: Hitung Konsistensi Catatan
        DB-->>Server: Return recording_days = 29 dari 30
        %% Keterangan: SELECT SUM(amount) FROM transactions WHERE type='income' AND month=4
        Server->>DB: Hitung Total Pemasukan
        DB-->>Server: Return total income
        %% Keterangan: SELECT SUM(amount) FROM saving_goals WHERE user_id=? (current_amount delta bulan ini)
        Server->>DB: Hitung Tabungan Masuk
        DB-->>Server: Return saving amount
        %% Keterangan: SELECT COUNT(*) FROM notifications WHERE user_id=? AND type='budget_warning' AND month=4
        Server->>DB: Hitung Frekuensi Warning
        DB-->>Server: Return warning_count = 1
        Server->>Server: score_recording = 29/30 × 40 = 38.7
        %% Keterangan: score_saving = (1.3jt/6.5jt) × 35 = 7.0
        Server->>Server: Kalkulasi Skor Rasio
        %% Keterangan: score_budget = max(0, 25 - warning_count×5) = 20
        Server->>Server: Kalkulasi Skor Kontrol
        %% Keterangan: score_total = 38.7 + 7.0 + 20 = 65.7 → dibulatkan 74
        Server->>Server: Total Penilaian Skor
        %% Keterangan: INSERT INTO financial_health_scores (user_id, period_month=4, period_year=2025, score_total=74, score_recording=29, score_saving=25, score_budget=20)
        Server->>DB: Simpan Cache Skor
        DB-->>Server: Return id baru
        %% Keterangan: 200 OK { score_total: 74, breakdown: { recording: 29, saving: 25, budget: 20 } }
        Server-->>UI: 200 OK
    end

    %% Keterangan: Render gauge meter skor 74/100 + breakdown per dimensi
    UI-->>UI: Render Breakdown Visual`
  },
  {
    id: 'uc23', uc: 'UC-23', title: 'Melihat Rekapan Pengeluaran',
    actors: ['User', 'Frontend', 'Backend', 'Database'],
    relation: '<<extend>> dari UC-21',
    note: 'Menampilkan tabel riwayat transaksi lengkap dengan filter & pagination, serta kartu ringkasan income/expense/balance. Mendukung ekspor laporan dalam format PDF atau CSV.',
    code: `sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Rekapitulasi Histori Transaksi Bulanan + Export [extend dari UC-21]

    UI->>Server: GET /api/transactions/summary?period=monthly
    %% Keterangan: SELECT t.*, c.name AS category FROM transactions t JOIN categories c ON t.category_id=c.id WHERE user_id=? ORDER BY transaction_date DESC
    Server->>DB: Ambil Histori Detail
    %% Keterangan: Return transactions[] lengkap dengan kategori
    DB-->>Server: Data Histori
    %% Keterangan: Hitung: total_income, total_expense, net_balance, by_category[]
    Server->>Server: Hitung Agregat
    %% Keterangan: 200 OK { transactions[], summary: { income, expense, balance, by_category[] } }
    Server-->>UI: 200 OK
    %% Keterangan: Render tabel riwayat transaksi dengan filter & pagination
    UI-->>User: Render Tabel Riwayat
    %% Keterangan: Tampilkan kartu ringkasan: total income, expense, net balance
    UI-->>User: Render Kartu Ringkasan

    opt User ingin download laporan
        %% Keterangan: Klik "Unduh Laporan" → pilih format PDF atau CSV
        User->>UI: Klik Unduh PDF/CSV
        UI->>Server: GET /api/transactions/export?format=pdf&period=monthly
        %% Keterangan: Generate file PDF/CSV dari data transaksi bulan ini
        Server->>Server: Generate Dokumen Laporan
        %% Keterangan: 200 OK File binary (Content-Type: application/pdf)
        Server-->>UI: Kirim File PDF/CSV
        UI-->>User: Browser trigger download file laporan
    end`
  }
];

// Build TOC
const tocGrid = document.getElementById('toc-grid');
ucData.forEach(d => {
  const card = document.createElement('div');
  card.className = 'toc-card';
  card.onclick = () => showPanel(d.id);

  const badges = [];
  if (d.relation && d.relation.includes('include')) badges.push('<span class="toc-badge nb-inc" style="background:rgba(63,185,80,0.12);color:#3fb950">include</span>');
  if (d.relation && d.relation.includes('extend')) badges.push('<span class="toc-badge nb-ext" style="background:rgba(210,153,34,0.12);color:#d29922">extend</span>');
  if (d.isAI) badges.push('<span class="toc-badge nb-ai" style="background:rgba(124,58,237,0.12);color:#a78bfa">AI/GenAI</span>');

  card.innerHTML = `
    <div class="toc-num">${d.uc}</div>
    <div class="toc-info">
      <div class="toc-name">${d.title}</div>
      <div class="toc-badges">${badges.join('')}</div>
    </div>`;
  tocGrid.appendChild(card);
});

// Build UC panels
const mainEl = document.querySelector('.main');
ucData.forEach(d => {
  const panel = document.createElement('div');
  panel.className = 'diagram-panel';
  panel.id = 'panel-' + d.id;

  const actorTags = d.actors.map(a => `<span class="tag tag-actor">${a}</span>`).join('');
  let relTag = '';
  if (d.relation) {
    if (d.relation.includes('include')) relTag = `<span class="tag tag-include"><<include>> ${d.relation.replace('<<include>>', '').trim()}</span>`;
    else if (d.relation.includes('extend')) relTag = `<span class="tag tag-extend"><<extend>> ${d.relation.replace('<<extend>>', '').trim()}</span>`;
  }
  if (d.isAI) relTag += `<span class="tag tag-ai">AI/GenAI</span>`;

  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-uc">${d.uc}</div>
      <div class="panel-title">${d.title}</div>
      <div class="panel-meta">${actorTags}${relTag}</div>
    </div>
    <div class="diagram-body">
      <div class="diagram-box"><img src="svgs/${d.id}.svg" class="svg-diagram" style="max-width: 100%; height: auto;" alt="Diagram ${d.uc}" /></div>
      <div class="relation-note"><strong>Keterangan:</strong> ${d.note}</div>
    </div>`;
  mainEl.appendChild(panel);
});

function showPanel(id) {
  document.querySelectorAll('.diagram-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  const navEl = document.getElementById('nav-' + id);
  if (navEl) { navEl.classList.add('active'); navEl.scrollIntoView({ block: 'nearest' }); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Scroll to top button
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').classList.toggle('show', window.scrollY > 300);
});

