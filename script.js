const ucData = [
  {
    id: 'uc01', uc: 'UC-01', title: 'Registrasi via Email', scenario: 'User mengakses halaman registrasi, memasukkan kredensial, dan sistem memproses pembuatan akun serta pengiriman email verifikasi secara asinkron.',
    actors: ["User","Frontend","Backend","Database","EmailService"],
    relation: null,
    note: 'Pendaftaran akun baru menggunakan Email. Setelah registrasi berhasil, Frontend langsung diarahkan ke Dashboard dengan JWT tanpa redirect ke halaman Login.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant Email as EmailService

    Note over User, Email: Registrasi Akun Baru via Email

    User->>UI: Buka halaman Register
    User->>UI: Isi Form Registrasi (Name, Email, Password)
    UI->>UI: Validasi Input (format email, password strength)
    UI->>Server: POST /auth/register { name, email, password }
    Server->>Server: Hash Password (bcrypt)
    %% Keterangan: Gunakan Parameterized Query (Prepared Statement) untuk cegah SQL Injection
    Server->>DB: INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)
    DB-->>Server: Return user.id
    Server-)Email: Kirim Email Verifikasi (Async)
    Server->>Server: Generate JWT Token
    Server-->>UI: 201 Created { token, user }
    Note over UI, User: Direct ke Dashboard tanpa redirect ke Login
    UI->>UI: Simpan Token ke localStorage
    UI-->>User: Redirect langsung ke Dashboard`
  },
  {
    id: 'uc02', uc: 'UC-02', title: 'Registrasi via Google Auth',
    actors: ["User","Frontend","Backend","Database","GoogleAuth"],
    relation: null,
    note: 'Pendaftaran akun baru menggunakan akun Google. Setelah registrasi, user langsung diarahkan ke Dashboard tanpa redirect ke Login.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant Google as Google Auth API

    Note over User, Google: Registrasi via Google Auth

    User->>UI: Klik "Daftar dengan Google"
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
    Server->>Server: Generate JWT Token
    Server-->>UI: 201 Created { token, user }
    Note over UI, User: Direct ke Dashboard tanpa redirect ke Login
    UI->>UI: Simpan Token ke localStorage
    UI-->>User: Redirect langsung ke Dashboard`
  },
  {
    id: 'uc03', uc: 'UC-03', title: 'Login via Email',
    actors: ["User","Frontend","Backend","Database"],
    relation: null,
    note: 'Autentikasi user dengan email dan password. Halaman Login hanya muncul ketika user sudah logout.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Login via Email (hanya setelah Logout)

    User->>UI: Buka halaman Login
    User->>UI: Submit Email & Password
    UI->>UI: Validasi Input
    UI->>Server: POST /auth/login { email, password }
    %% Keterangan: Gunakan Parameterized Query / Prepared Statement untuk cegah SQL Injection
    Server->>DB: SELECT * FROM users WHERE email = ?
    DB-->>Server: Data User
    Server->>Server: Cek Password (bcrypt.compare)

    alt Password tidak valid
        Server-->>UI: 401 Unauthorized { message: "Email atau password salah" }
        UI-->>User: Tampilkan pesan error berwarna merah
    else Password valid
        Server->>Server: Generate JWT Token
        Server-->>UI: 200 OK { token, user }
        UI->>UI: Simpan Token ke localStorage
        UI-->>User: Redirect ke Dashboard
    end`
  },
  {
    id: 'uc04', uc: 'UC-04', title: 'Login via Google Auth',
    actors: ["User","Frontend","Backend","Database","GoogleAuth"],
    relation: null,
    note: 'Autentikasi user menggunakan akun Google (Login). Halaman Login hanya muncul ketika user sudah logout.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant Google as Google Auth API

    Note over User, Google: Login via Google (hanya setelah Logout)

    User->>UI: Buka halaman Login
    User->>UI: Klik "Login dengan Google"
    UI->>Google: Request OAuth Consent
    Google-->>User: Tampilkan Halaman Login Google
    User->>Google: Authorize
    Google-->>UI: Return Authorization Code
    UI->>Server: POST /auth/google { code }
    Server->>Google: Exchange Code for Profile
    Google-->>Server: User Profile (Email)
    %% Keterangan: Gunakan Parameterized Query (Prepared Statement)
    Server->>DB: SELECT * FROM users WHERE google_id = ?
    DB-->>Server: Data User
    alt User tidak ditemukan
        Server-->>UI: 404 Not Found
        UI-->>User: Tampilkan pesan akun belum terdaftar
    else User ditemukan
        Server->>Server: Generate JWT Token
        Server-->>UI: 200 OK { token, user }
        UI->>UI: Simpan Token ke localStorage
        UI-->>User: Redirect ke Dashboard
    end`
  },
  {
    id: 'uc05', uc: 'UC-05', title: 'Catat Pemasukan',
    actors: ["User","Frontend","Backend","Database"],
    relation: '<<include>> UC-07, UC-11',
    note: 'Pencatatan pemasukan bulanan (uang saku, beasiswa, dll). Backend menyimpan transaksi lalu memicu auto-alokasi 4 kategori: 50% Pokok / 30% Hiburan / 15% Tabungan / 5% Darurat (mode ON), atau 60% Pokok / 30% Hiburan / 10% Darurat (mode tabungan OFF).',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Pencatatan Pemasukan & Auto-Alokasi 4 Kategori [include UC-07, UC-11]

    User->>UI: Pilih menu "Catat Pemasukan"
    User->>UI: Isi nominal pemasukan (misal: Rp 2.000.000)
    UI->>Server: GET /api/user-settings (cek saving_mode)
    Server-->>UI: Return { saving_mode: ON/OFF }
    UI->>UI: Preview alokasi real-time sesuai mode aktif
    Note over UI: Mode ON: 50% Pokok | 30% Hiburan | 15% Tabungan | 5% Darurat
    Note over UI: Mode OFF: 60% Pokok | 30% Hiburan | 10% Darurat

    UI->>Server: POST /transactions/income { amount, date, source }
    Server->>Server: Verifikasi JWT & ambil saving_mode user
    Server->>DB: INSERT INTO transactions (type='income', amount, date)
    DB-->>Server: Return transaction.id

    Note over Server, DB: <<include>> Background Auto-Alokasi 4 Kategori (UC-07)
    Server->>Server: Panggil UC-07 (distribusi berdasarkan mode)

    Note over Server, DB: <<include>> Validasi & Kalkulasi Target Tabungan (UC-08)
    Server->>Server: Panggil UC-08 jika saving_mode = ON

    Note over Server, DB: <<include>> Update Alokasi Target Tabungan (UC-11)
    Server->>Server: Panggil UC-11 jika saving_mode = ON

    Server-->>UI: 201 Created { transaction, allocations, saving_progress }
    UI-->>User: Perbarui Dashboard (saldo & 4 kategori anggaran diperbarui)`
  },
  {
    id: 'uc06', uc: 'UC-06', title: 'Catat Pengeluaran (Manual)',
    actors: ["User","Frontend","Backend","Database","AIService"],
    relation: '<<extend>> UC-10, UC-13',
    note: 'Pencatatan pengeluaran manual. Jika saldo kategori habis, sistem otomatis menggunakan Dana Darurat (5%/10% dari pemasukan) sebagai buffer. Notifikasi dikirim jika anggaran mencapai 80% atau 100%.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant AI as AIService

    Note over User, AI: Pencatatan Pengeluaran Manual [extend UC-10, UC-13]

    User->>UI: Pilih "Catat Pengeluaran"
    User->>UI: Isi nama item, nominal, kategori, tanggal
    UI->>UI: Tampilkan sisa anggaran kategori secara real-time
    UI->>Server: POST /expenses/manual { name, amount, category, date }

    Note over Server, AI: AI Prediksi/Validasi Kategori Item
    Server->>AI: Prediksi Kategori item
    AI-->>Server: Return { summary_category }

    Server->>DB: Cek sisa budget_remaining[kategori]
    DB-->>Server: Return sisa_anggaran

    alt Sisa anggaran cukup
        Server->>DB: UPDATE budget_remaining SET sisa -= amount
        DB-->>Server: OK
    else Sisa anggaran habis (budget = 0)
        Note over Server, DB: Gunakan Dana Darurat sebagai Buffer Otomatis
        Server->>DB: SELECT balance FROM emergency_fund WHERE user_id = ?
        DB-->>Server: Return emergency_balance
        Server->>DB: UPDATE emergency_fund SET balance -= kelebihan
        DB-->>Server: OK
        Note over Server: <<extend>> Notifikasi Dana Darurat Terpakai (UC-10)
    end

    Server->>DB: INSERT INTO transactions (expense)
    DB-->>Server: Return expense.id

    Server->>Server: Hitung % terpakai vs alokasi (re-evaluasi)
    alt Pengeluaran >= threshold (80% atau 100%)
        Note over Server, DB: <<extend>> Notifikasi Peringatan (UC-10)
        Server->>DB: INSERT INTO notifications (type, category, threshold_pct)
        DB-->>Server: OK
    end

    Server-->>UI: 201 Created { expense, budget_remaining, emergency_used }
    UI-->>User: Update UI (sisa anggaran & status dana darurat diperbarui)`
  },
  {
    id: 'uc07', uc: 'UC-07', title: 'Background Auto-Alokasi 4 Kategori',
    actors: ["Backend","Database"],
    relation: '<<include>> dari UC-05',
    note: 'Proses otomatis saat pemasukan dicatat. Mendistribusikan saldo ke 4 kategori berdasarkan mode tabungan: Mode ON (50% Pokok / 30% Hiburan / 15% Tabungan / 5% Darurat) atau Mode OFF (60% Pokok / 30% Hiburan / 10% Darurat).',
    code: `
sequenceDiagram
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over Server, DB: Background Auto-Alokasi 4 Kategori [include UC-05]

    Server->>DB: SELECT saving_mode, monthly_income FROM user_settings WHERE user_id = ?
    DB-->>Server: Return { saving_mode: ON, monthly_income: 2000000 }

    alt saving_mode = ON
        Note over Server: Skema Aktif — 50% Pokok | 30% Hiburan | 15% Tabungan | 5% Darurat
        Server->>DB: UPDATE budget_remaining SET amount = 1000000 WHERE category='Kebutuhan Pokok'
        DB-->>Server: OK
        Server->>DB: UPDATE budget_remaining SET amount = 600000 WHERE category='Hiburan'
        DB-->>Server: OK
        Server->>DB: UPDATE saving_goals SET deposit += 300000 (15% x pemasukan)
        DB-->>Server: OK
        Server->>DB: UPDATE emergency_fund SET balance += 100000 (5% x pemasukan)
        DB-->>Server: OK
    else saving_mode = OFF
        Note over Server: Skema Aktif — 60% Pokok | 30% Hiburan | 10% Darurat
        Server->>DB: UPDATE budget_remaining SET amount = 1200000 WHERE category='Kebutuhan Pokok'
        DB-->>Server: OK
        Server->>DB: UPDATE budget_remaining SET amount = 600000 WHERE category='Hiburan'
        DB-->>Server: OK
        Server->>DB: UPDATE emergency_fund SET balance += 200000 (10% x pemasukan)
        DB-->>Server: OK
    end

    Server->>DB: INSERT INTO budget_allocations (log alokasi bulan ini)
    DB-->>Server: OK
    Server->>Server: Lanjut ke UC-08 & UC-09 (Validasi + Threshold)`
  },
  {
    id: 'uc08', uc: 'UC-08', title: 'Validasi & Kalkulasi Target Tabungan',
    actors: ["Backend","Database"],
    relation: '<<include>> dari UC-07',
    note: 'Memvalidasi apakah target tabungan realistis berdasarkan pemasukan dan deadline. Menghitung jumlah yang harus ditabung per bulan dan per hari. Batas maksimal tabungan adalah 15% dari pemasukan bulanan.',
    code: `
sequenceDiagram
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over Server, DB: Validasi & Kalkulasi Target Tabungan [include UC-07]

    Server->>DB: SELECT target_amount, deadline, current_amount FROM saving_goals WHERE status='active'
    DB-->>Server: Return data target (target: 8jt, deadline: 10 bln lagi, current: 0)

    Server->>Server: Hitung months_remaining = DATEDIFF(deadline, NOW()) / 30
    Server->>Server: Validasi: months_remaining >= 10 (batas minimal)

    alt months_remaining < 10
        Note over Server: Deadline terlalu dekat! Minimal 10 bulan dari sekarang
        Server->>DB: INSERT INTO notifications (type='deadline_warning')
        DB-->>Server: OK
    else months_remaining >= 10
        Server->>Server: Hitung monthly_saving_needed = (target - current) / months_remaining
        Server->>Server: Hitung daily_saving = monthly_saving_needed / 30
        Server->>DB: SELECT monthly_income FROM user_settings WHERE user_id = ?
        DB-->>Server: Return monthly_income (Rp 2.000.000)
        Server->>Server: Hitung max_allowed = 15% x monthly_income = Rp 300.000

        alt monthly_saving_needed > max_allowed (target terlalu berat)
            Server->>DB: INSERT INTO notifications (type='saving_too_heavy')
            DB-->>Server: OK
            Note over Server: Saran: perpanjang deadline atau turunkan target
        else Kalkulasi valid dan realistis
            Server->>DB: UPDATE saving_goals SET monthly_saving=?, daily_saving=?, months_remaining=?
            DB-->>Server: OK
            Note over Server: Target OK — Rp 300rb/bln | Rp 10rb/hari
        end
    end

    Server-->>Server: Return kalkulasi ke UC-05/UC-11`
  },
  {
    id: 'uc09', uc: 'UC-09', title: 'Penetapan Threshold Peringatan',
    actors: ["Backend","Database"],
    relation: '<<include>> dari UC-05',
    note: 'Menetapkan batas threshold default 80% untuk 4 kategori (Pokok, Hiburan, Tabungan, Darurat). Dana Darurat memiliki threshold khusus 50% penggunaan sebagai tanda bahwa cadangan sudah menipis.',
    code: `
sequenceDiagram
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over Server, DB: Penetapan Threshold 4 Kategori [include UC-05]

    loop Untuk setiap kategori (Pokok, Hiburan, Tabungan, Darurat)
        Server->>DB: UPDATE budget_allocations SET warning_threshold_pct = 80 WHERE category = ?
        DB-->>Server: OK
        Server->>DB: SELECT SUM(amount) FROM transactions WHERE category = ?
        DB-->>Server: Return total pengeluaran kategori
        Server->>Server: Evaluasi: (total / alokasi) x 100
        alt Pengeluaran >= 80% threshold
            Server->>Server: Panggil UC-10 (Notifikasi Peringatan Kuning)
        end
        alt Pengeluaran >= 100% threshold
            Server->>Server: Panggil UC-10 (Notifikasi Overspend Merah)
        end
    end

    Note over Server, DB: Khusus Dana Darurat: Threshold Penggunaan 50%
    Server->>DB: SELECT balance, initial_balance FROM emergency_fund WHERE user_id = ?
    DB-->>Server: Return { balance: 80000, initial_balance: 200000 }
    Server->>Server: Hitung: penggunaan = (initial - balance) / initial x 100
    alt Dana darurat terpakai > 50%
        Server->>Server: Panggil UC-10 (Notifikasi Dana Darurat Menipis)
    end`
  },
  {
    id: 'uc10', uc: 'UC-10', title: 'Notifikasi Peringatan Anggaran',
    actors: ["Frontend","Backend","Database"],
    relation: '<<extend>> dari UC-06',
    note: 'Push notifikasi Real-Time (WebSocket) ke pengguna dengan 3 level: Kuning (80% terpakai), Merah (100% overspend), dan Oranye (dana darurat > 50% terpakai). Badge notifikasi berkurang otomatis saat dibaca.',
    code: `
sequenceDiagram
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over UI, DB: Notifikasi Peringatan Real-Time (3 Level)

    Server->>Server: Deteksi kondisi threshold terlampaui
    Server->>DB: INSERT INTO notifications (type, category, message, threshold_pct)
    DB-->>Server: Return notification.id

    alt Anggaran >= 80% (Peringatan Kuning)
        Server-)UI: Push WebSocket: Toast Kuning
        UI-->>UI: Tampilkan: Hati-hati! [Kategori] hampir habis (80%)
    else Anggaran >= 100% (Overspend Merah)
        Server-)UI: Push WebSocket: Toast Merah
        UI-->>UI: Tampilkan: OVERSPEND! Anggaran [Kategori] habis
        UI-->>UI: Sistem menggunakan Dana Darurat sebagai buffer
    else Dana Darurat > 50% terpakai (Peringatan Oranye)
        Server-)UI: Push WebSocket: Toast Oranye
        UI-->>UI: Tampilkan: Dana Darurat menipis! Segera kontrol pengeluaran
    end

    Note over UI, DB: Saat user membuka/membaca notifikasi
    UI->>Server: PATCH /notifications { read: true }
    Server->>DB: UPDATE notifications SET read = true
    DB-->>Server: OK
    Server-->>UI: 200 OK
    UI-->>UI: Badge notifikasi berkurang`
  },
  {
    id: 'uc11', uc: 'UC-11', title: 'Setup & Auto-Alokasi Target Tabungan',
    actors: ["Backend","Database"],
    relation: '<<include>> dari UC-05',
    note: 'Mengelola target tabungan berbasis deadline. Setiap pemasukan masuk, sistem mengalokasikan 15% ke tabungan dan menghitung ulang daily_saving serta estimasi ketercapaian. Batas minimal deadline adalah 10 bulan.',
    code: `
sequenceDiagram
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over Server, DB: Auto-Alokasi Target Tabungan Deadline-Based [include UC-05]

    Server->>DB: SELECT * FROM saving_goals WHERE user_id = ? AND status = 'active'
    DB-->>Server: Return { target: 8000000, deadline: '2027-03-01', current: 500000 }

    Server->>Server: Hitung months_remaining = DATEDIFF(deadline, NOW()) / 30

    alt months_remaining < 10
        Note over Server: Deadline < 10 bulan! Sistem peringatkan user
        Server->>DB: INSERT INTO notifications (type='deadline_too_close')
        DB-->>Server: OK
    else months_remaining >= 10
        Note over Server, DB: Proses Deposit 15% dari Pemasukan Masuk
        Server->>Server: Hitung deposit = 15% x income_amount
        Server->>DB: UPDATE saving_goals SET current_amount += deposit
        DB-->>Server: OK

        Server->>Server: Recalculate monthly_saving_needed = (target - current) / months_remaining
        Server->>Server: Recalculate daily_saving = monthly_saving_needed / 30
        Server->>DB: UPDATE saving_goals SET monthly_saving=?, daily_saving=?, months_remaining=?
        DB-->>Server: OK
    end`
  },
  {
    id: 'uc12', uc: 'UC-12', title: 'Progress Bar & Detail Target Tabungan',
    actors: ["Frontend","Backend","Database"],
    relation: '<<extend>> dari UC-11',
    note: 'Merender detail lengkap target tabungan: persentase progres, nominal per hari, nominal per bulan, countdown deadline, dan status on_track. Menampilkan badge TERTINGGAL jika tabungan aktual di bawah ekspektasi.',
    code: `
sequenceDiagram
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over UI, DB: Render Progress Bar & Detail Tabungan

    UI->>Server: GET /api/saving-goals/{id}
    Server->>DB: SELECT * FROM saving_goals WHERE id = ?
    DB-->>Server: Return { target: 8jt, current: 1.5jt, deadline, monthly_saving, daily_saving }

    Server->>Server: Hitung progress_pct = (current / target) x 100 = 18.75%
    Server->>Server: Hitung days_remaining = DATEDIFF(deadline, NOW())
    Server->>Server: Hitung days_elapsed = total_days - days_remaining
    Server->>Server: Hitung expected_current = daily_saving x days_elapsed
    Server->>Server: Evaluasi on_track = (current_amount >= expected_current)

    Server-->>UI: 200 OK { progress_pct: 18.75, days_remaining: 550, monthly_saving: 300000, daily_saving: 10000, on_track: true }

    UI-->>UI: Render progress bar visual (18.75%)
    UI-->>UI: Render kartu: Nabung Rp 10.000/hari | Rp 300.000/bulan
    UI-->>UI: Render countdown: 550 hari tersisa menuju deadline
    UI-->>UI: Render badge: ON TRACK (hijau) atau TERTINGGAL (merah)`
  },
  {
    id: 'uc13', uc: 'UC-13', title: 'Upload Gambar Struk (OCR)',
    actors: ["User","Frontend","Backend","Database","Storage"],
    relation: '<<include>> UC-14',
    isAI: true,
    note: 'Validasi sisi client dan server, menyimpan gambar secara async ke storage, dan menginisiasi pipeline OCR.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant ST as Storage (S3/GCS)

    Note over User, ST: Upload Struk — Pipeline OCR Dimulai [include UC-14]

    User->>UI: Pilih File Foto Struk
    UI->>UI: Validasi client (Format JPG/PNG, < 10MB, dimensi)
    UI-->>User: Tampilkan pratinjau gambar struk
    User->>UI: Klik "Proses Struk"
    UI->>Server: POST /receipts/upload [multipart/form-data]
    Server->>Server: Validasi ulang server: ukuran, format, JWT
    Server-)ST: Upload file ke Storage (Async)
    ST-->>Server: Return image_url permanen
    Server->>DB: INSERT INTO receipts (status = 'pending')
    DB-->>Server: Return receipt.id
    Server-->>UI: 202 Accepted { receipt_id, status: "processing" }
    UI-->>User: Tampilkan loading indicator animasi
    
    Server-)Server: Inisiasi Pipeline OCR (UC-14) Async`
  },
  {
    id: 'uc14', uc: 'UC-14', title: 'Ekstraksi Teks via Cloud Vision OCR',
    actors: ["Backend","AIService","OCR API","Database"],
    relation: '<<include>> dari UC-13 → UC-15',
    isAI: true,
    note: 'Pemanggilan Vision API (DOCUMENT_TEXT_DETECTION) untuk mengekstrak string teks utuh (raw_text) dan mengukur durasi.',
    code: `
sequenceDiagram
    participant Server as Backend (REST API)
    participant AI as AIService
    participant OCR as OCR API (Cloud Vision)
    participant DB as Database (SQL)

    Note over Server, DB: Ekstraksi Teks via Cloud Vision OCR

    Server->>AI: Mulai proses OCR untuk receipt.id
    AI->>DB: UPDATE receipts SET status = 'processing'
    DB-->>AI: OK
    AI->>OCR: POST /v1/images:annotate { type: DOCUMENT_TEXT_DETECTION }
    OCR->>OCR: Proses Visi Teks (Piksel ke Teks)
    OCR-->>AI: Return Hasil Annotasi (fullTextAnnotation)
    AI->>AI: Ekstrak raw_text utuh
    AI->>AI: Catat waktu proses OCR (ocr_processing_time_ms)
    AI->>DB: UPDATE receipts SET raw_text, status='ocr_done'
    DB-->>AI: OK
    
    AI->>AI: Teruskan raw_text ke UC-15`
  },
  {
    id: 'uc15', uc: 'UC-15', title: 'Parsing Teks OCR Menjadi Data Terstruktur',
    actors: ["AIService","Database"],
    relation: '<<include>> dari UC-14 → UC-16',
    note: 'Memecah raw_text yang berhasil dideteksi dengan Regex Pattern untuk mendeteksi SUBTOTAL, DISKON, PAJAK, TOTAL, dan baris daftar item.',
    code: `
sequenceDiagram
    participant AI as AIService
    participant DB as Database (SQL)

    Note over AI, DB: Parsing Teks OCR dgn Regex

    AI->>AI: Regex SUBTOTAL → Match!
    AI->>AI: Regex DISKON → Match!
    AI->>AI: Regex PAJAK PPN → Match!
    AI->>AI: Regex TOTAL → Match!
    AI->>AI: Ekstrak Metode Pembayaran (Regex: TUNAI/TRANSFER)
    AI->>AI: Ekstrak Daftar Item (Regex: Qty x Harga)
    
    AI->>DB: UPDATE receipts SET subtotal, tax, total, method, status='structured'
    DB-->>AI: OK
    AI->>DB: INSERT INTO receipt_items (item-item yg terekstrak)
    DB-->>AI: OK
    
    AI->>AI: Lanjut ke UC-16 (Klasifikasi)`
  },
  {
    id: 'uc16', uc: 'UC-16', title: 'Klasifikasi Item via GenAI (Parallel Request)',
    actors: ["AIService","GenAI API","Database"],
    relation: '<<include>> dari UC-15 → UC-17',
    isAI: true,
    note: 'Setiap item struk (bisa puluhan) dikirimkan secara serentak (Parallel) ke GenAI menggunakan Promise.all untuk kecepatan ekstraksi.',
    code: `
sequenceDiagram
    participant AI as AIService
    participant GA as GenAI API
    participant DB as Database (SQL)

    Note over AI, DB: Klasifikasi Item Paralel (GenAI)

    par Parallel Request
        loop Promise.all() Setiap item
            AI->>GA: Call GenAI (Klasifikasikan ke: Kebutuhan Pokok, Hiburan, dll)
            GA-->>AI: Return Kategori AI
        end
    end
    
    AI->>DB: Simpan masing-masing Item + Kategori AI ke DB
    DB-->>AI: OK
    AI->>DB: UPDATE receipts SET status = 'Success'
    DB-->>AI: OK
    
    AI->>AI: Selesai, Teruskan ke Validasi Manual (UC-17)`
  },
  {
    id: 'uc17', uc: 'UC-17', title: 'Validasi Manual Data Struk',
    actors: ["User","Frontend","Backend","Database"],
    relation: '<<include>> dari UC-16',
    note: 'Push real-time ke layar, render tabel item, user membetulkan (override) harga atau kategori AI, lalu simpan ke transaksi utama.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Validasi & Koreksi Manual Hasil OCR

    Server-)UI: WebSocket: Notifikasi Realtime OCR Sukses
    UI->>Server: GET /api/receipts/1/result
    Server->>DB: Ambil Hasil Akhir OCR (Struk, Item, Kategori AI)
    DB-->>Server: Return Data Lengkap
    Server-->>UI: 200 OK
    UI-->>User: Render Tabel Item & Total Berjalan
    
    opt User melakukan koreksi (Contoh: Harga salah atau Kategori di-override)
        User->>UI: Ubah harga atau kategori via UI dropdown
        UI->>Server: PATCH /receipt-items { item_id, price/category }
        Server->>DB: UPDATE harga/kategori di DB
        DB-->>Server: OK
        Server-->>UI: 200 OK
        UI-->>User: Update tabel seketika
    end
    
    User->>UI: Klik "Simpan Transaksi"
    UI->>Server: POST /api/receipts/1/confirm
    Server->>DB: INSERT INTO transactions (transaction.id = final)
    DB-->>Server: OK
    Server-->>UI: 201 Created
    UI-->>User: Redirect dan Potong Anggaran (UC-06)`
  },
  {
    id: 'uc18', uc: 'UC-18', title: 'Pantau Dashboard Utama',
    actors: ["User","Frontend","Backend","Database","AIService"],
    relation: '<<extend>> UC-20, UC-22',
    isAI: true,
    note: 'Merender summary 4 kategori anggaran, widget status Dana Darurat, toggle mode tabungan, progress tabungan ringkasan, Skor Kesehatan, dan Insight AI.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant AI as AIService

    Note over User, AI: Pantau Dashboard Utama (4 Kategori + Dana Darurat)

    User->>UI: Buka halaman Dashboard / Beranda
    UI->>Server: GET /api/dashboard?period=monthly
    Server->>DB: Query 1: Summary Transaksi (Income/Expense/Balance)
    DB-->>Server: Return { total_income, total_expense, net_balance }
    Server->>DB: Query 2: Status 4 Kategori (sisa per kategori & % terpakai)
    DB-->>Server: Return { pokok, hiburan, tabungan, darurat } dengan sisa_anggaran
    Server->>DB: Query 3: Status Dana Darurat (balance, initial, % terpakai)
    DB-->>Server: Return { balance: 80000, initial: 200000, used_pct: 60 }
    Server->>DB: Query 4: Status Tabungan (saving_mode, progress, daily_saving)
    DB-->>Server: Return { saving_mode: ON, progress_pct: 18.75, daily_saving: 10000 }

    Server->>AI: Inisiasi Insight AI (UC-20)
    AI->>DB: Cek Cache ai_insights (max 1 jam)
    DB-->>AI: Cache Hit / Miss
    alt Cache Miss
        AI->>AI: Generate Insight Baru (UC-20)
        AI-->>Server: Return Insight Baru
    else Cache Hit
        AI-->>Server: Return Insight dari Cache
    end

    Server-->>UI: 200 OK { summary, allocations[4], emergency_fund, saving_mode, progress, insight_text }
    UI-->>User: Render Kartu Ringkasan (Income / Expense / Balance)
    UI-->>User: Render 4 Bar Alokasi (Pokok / Hiburan / Tabungan / Darurat)
    UI-->>User: Render Widget Dana Darurat (gauge: 60% terpakai, warna oranye)
    UI-->>User: Render Toggle Mode Tabungan (ON/OFF switch)
    UI-->>User: Render Mini Progress Bar Tabungan

    Note over UI, Server: Render Skor Kesehatan
    UI->>Server: GET /api/financial-health-score?month=current
    Server-->>UI: Return Skor Kesehatan (UC-22)
    UI-->>User: Tampilkan Widget Skor Kesehatan (level 1-5 dengan label)`
  },
  {
    id: 'uc19', uc: 'UC-19', title: 'Visualisasi Grafik Analitik',
    actors: ["User","Frontend","Backend","Database"],
    relation: '<<extend>> UC-20',
    note: 'Menampilkan 5 jenis visualisasi: Bar Chart harian (income vs expense), Bar Chart bulanan, Grafik tahunan, Pie Chart 4 kategori, dan Histori transaksi lengkap. Semua didukung Insight AI.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Visualisasi Grafik Analitik (5 Jenis Chart)

    User->>UI: Buka Halaman "Analitik Lengkap"
    UI->>Server: GET /api/analytics?period=monthly&year=2025&month=5

    Server->>DB: Query 1: Agregasi harian 30 hari (Bar Chart Harian)
    DB-->>Server: Return { date, income, expense } per hari
    Server->>DB: Query 2: Agregasi bulanan 12 bulan (Bar Chart Bulanan)
    DB-->>Server: Return { month, total_expense } per bulan
    Server->>DB: Query 3: Agregasi tahunan (Grafik Perkembangan Tahunan)
    DB-->>Server: Return { year, income, expense, saving } per tahun
    Server->>DB: Query 4: Distribusi per 4 kategori (Pie Chart)
    DB-->>Server: Return { pokok, hiburan, tabungan, darurat } dengan %
    Server->>DB: Query 5: Histori transaksi lengkap bulan ini (LEFT JOIN receipt)
    DB-->>Server: Return daftar transaksi detail

    Server-->>UI: 200 OK { daily_chart, monthly_chart, yearly_chart, pie_chart, transactions }
    UI-->>User: Render Bar Chart Harian (income vs expense 30 hari)
    UI-->>User: Render Bar Chart Bulanan (pengeluaran 12 bulan)
    UI-->>User: Render Grafik Tahunan (line chart perkembangan)
    UI-->>User: Render Pie Chart 4 Kategori (Pokok/Hiburan/Tabungan/Darurat)
    UI-->>User: Render Tabel Histori Transaksi (filter & search)

    UI->>Server: GET /api/insights?period=monthly (UC-20)
    Server-->>UI: Return insight_text
    UI-->>User: Tampilkan teks Insight AI di bawah grafik`
  },
  {
    id: 'uc20', uc: 'UC-20', title: 'Generate Insight AI Personal (Gemini + Caching)',
    actors: ["Backend","AIService","GenAI API","Database"],
    relation: '<<extend>> dari UC-18 / UC-19',
    isAI: true,
    note: 'Menghasilkan insight personal berbasis konteks mahasiswa: pola konsumtif, status dana darurat, progres tabungan, dan saran spesifik. Menggunakan caching 1 jam untuk efisiensi biaya API.',
    code: `
sequenceDiagram
    participant Server as Backend (REST API)
    participant AI as AIService
    participant GA as GenAI API (Gemini)
    participant DB as Database (SQL)

    Note over Server, DB: Generate Insight AI Personal Mahasiswa

    Server->>AI: Generate Insight (user_id, period=monthly)
    AI->>DB: SELECT insight_text FROM ai_insights WHERE expired_at > NOW()
    DB-->>AI: Return existing / NULL

    alt Cache Miss (Belum ada / Expired)
        AI->>DB: Ambil spending_summary: { pokok, hiburan, tabungan, darurat, saving_progress }
        DB-->>AI: Return data pengeluaran bulan ini
        AI->>DB: Ambil profil: { monthly_income, saving_mode, target_name, deadline }
        DB-->>AI: Return profil user (konteks mahasiswa)

        Note over AI: Bangun prompt kaya konteks mahasiswa:
        Note over AI: pola konsumtif, status darurat, progres tabungan, saran spesifik

        AI->>GA: POST /gemini-pro:generateContent { prompt dengan konteks + data }
        GA-->>AI: Return teks insight personal (saran: kurangi jajan, dll)
        AI->>DB: INSERT INTO ai_insights (text, generated_at, expires_at = +1jam)
        DB-->>AI: OK
        AI-->>Server: Return Insight Baru
    else Cache Hit (Masih fresh)
        AI-->>Server: Return Insight dari Cache (milidetik)
    end`
  },
  {
    id: 'uc21', uc: 'UC-21', title: 'Rekap Bulanan "Financial Wrapped"',
    actors: ["User","Frontend","Backend","Database","AIService"],
    isAI: true,
    relation: null,
    note: 'Fitur rekap akhir bulan bergaya "Spotify Wrapped". Menampilkan ringkasan visual: kategori terbesar, total hemat, jumlah transaksi, kebiasaan pengeluaran, dan progres tabungan bulan ini — dilengkapi narasi AI.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)
    participant AI as AIService

    Note over User, AI: Generate Rekap Bulanan Financial Wrapped

    User->>UI: Buka Fitur "Rekap Bulan Ini"
    UI->>Server: GET /api/monthly-recap?month=5&year=2025
    Server->>DB: Cek Cache monthly_recap bulan ini
    DB-->>Server: Cache Miss (perlu generate)

    Server->>DB: Query 1: Kategori pengeluaran terbesar bulan ini
    DB-->>Server: Return { top_category: Hiburan, pct: 40% }
    Server->>DB: Query 2: Total sisa (uang berhasil dihemat)
    DB-->>Server: Return { saved_amount: 350000 }
    Server->>DB: Query 3: Jumlah & breakdown transaksi (manual vs OCR)
    DB-->>Server: Return { total: 42, manual: 18, ocr: 24 }
    Server->>DB: Query 4: Kebiasaan pengeluaran (hari & jam tersibuk)
    DB-->>Server: Return { busiest_day: Jumat, busiest_hour: 12.00 }
    Server->>DB: Query 5: Progres tabungan bulan ini
    DB-->>Server: Return { saved_this_month: 300000, total_pct: 18.75 }

    Server->>AI: Generate narasi rekap (UC-20 context)
    AI-->>Server: Return ringkasan teks motivasi personal

    Server->>DB: INSERT INTO monthly_recap (semua data bulan ini)
    DB-->>Server: Return recap.id

    Server-->>UI: 200 OK { top_category, saved_amount, txn_stats, habits, saving_progress, ai_summary }
    UI-->>User: Slide 1 — Ringkasan bulan & total transaksi
    UI-->>User: Slide 2 — Kategori pengeluaran terbesar (donut chart)
    UI-->>User: Slide 3 — Kamu berhasil hemat Rp 350.000!
    UI-->>User: Slide 4 — Kebiasaan: paling boros hari Jumat jam 12
    UI-->>User: Slide 5 — Progress tabungan bulan ini (animasi bar)
    UI-->>User: Slide 6 — Motivasi & saran AI personal`
  },
  {
    id: 'uc22', uc: 'UC-22', title: 'Kalkulasi Skor Kesehatan Keuangan',
    actors: ["Frontend","Backend","Database"],
    relation: '<<extend>> dari UC-18',
    note: 'Menghitung skor kesehatan 0–100 berdasarkan 5 faktor. Grade: 0–20 Buruk | 21–40 Kurang Stabil | 41–60 Cukup | 61–80 Agak Baik | 81–100 Sangat Baik. Disimpan di cache untuk efisiensi.',
    code: `
sequenceDiagram
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over UI, DB: Kalkulasi Skor Kesehatan 5 Faktor (0-100)

    UI->>Server: GET /api/financial-health-score?month=current
    Server->>DB: Cek Cache Skor (health_score_cache)
    DB-->>Server: NULL (perlu kalkulasi ulang)

    Server->>DB: Faktor 1: Konsistensi pencatatan (hari aktif input transaksi)
    DB-->>Server: Return { recording_days: 22, total_days: 31 }
    Server->>DB: Faktor 2: Tingkat pengeluaran konsumtif (% hiburan vs alokasi)
    DB-->>Server: Return { hiburan_spent: 650000, hiburan_limit: 600000 }
    Server->>DB: Faktor 3: Kestabilan Dana Darurat (% sisa vs initial)
    DB-->>Server: Return { balance: 140000, initial: 200000 }
    Server->>DB: Faktor 4: Keberhasilan target tabungan (actual vs expected deposit)
    DB-->>Server: Return { actual_saving: 300000, expected: 300000 }
    Server->>DB: Faktor 5: Kepatuhan alokasi (jumlah kali overspend per kategori)
    DB-->>Server: Return { overspend_count: 1 }

    Server->>Server: Kalkulasi skor total 0-100 dari 5 faktor
    Server->>Server: Normalisasi berdasarkan hari berjalan bulan ini

    Note over Server: Grade System 5 Level:
    Note over Server: 0-20 = Buruk | 21-40 = Kurang Stabil | 41-60 = Cukup
    Note over Server: 61-80 = Agak Baik | 81-100 = Sangat Baik

    Server->>Server: Tentukan grade & warna berdasarkan skor
    Server->>DB: INSERT INTO health_score_cache (score, grade, breakdown, expires_at)
    DB-->>Server: OK

    Server-->>UI: 200 OK { score: 72, grade: "Agak Baik", color: "#d29922", breakdown: {...} }
    UI-->>UI: Render gauge/circle progress (72/100)
    UI-->>UI: Render label grade dengan warna sesuai level
    UI-->>UI: Render breakdown 5 faktor (detail per komponen)`
  },
  {
    id: 'uc23', uc: 'UC-23', title: 'Profil Keuangan & Export PDF',
    actors: ["User","Frontend","Backend","Database"],
    relation: '<<extend>> UC-21',
    note: 'Menampilkan biodata user dan statistik keuangan bulanan. Menyediakan fitur Export PDF yang berisi histori pengeluaran selama satu bulan sebagai laporan keuangan pribadi.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Profil Keuangan & Export PDF Bulanan

    User->>UI: Klik "Profil Keuangan"
    UI->>Server: GET /api/profile/financial
    Server->>DB: Query 1: Ambil Biodata User (nama, email, tanggal daftar)
    DB-->>Server: Return user_record
    Server->>DB: Query 2: Statistik bulan ini (income, expense, saving_mode, health_score)
    DB-->>Server: Return monthly_stats
    Server->>DB: Query 3: Histori pengeluaran bulan ini (LEFT JOIN receipt)
    DB-->>Server: Return expense_history (semua transaksi bulan berjalan)
    Server-->>UI: 200 OK { user, monthly_stats, expense_history }
    UI-->>User: Render Biodata + Statistik Bulanan
    UI-->>User: Render Tabel Histori Pengeluaran Bulan Ini

    opt User mengunduh Laporan PDF
        User->>UI: Klik "Export PDF Bulan Ini"
        UI->>Server: GET /api/reports/export?format=pdf&period=monthly&month=5&year=2025
        Server->>DB: Ambil seluruh histori pengeluaran bulan ini
        DB-->>Server: Return expense_history lengkap
        Server->>Server: Generate PDF (layout: biodata + summary + tabel histori)
        Server-->>UI: Return Binary File PDF (Content-Disposition: attachment)
        UI-->>User: Browser trigger download otomatis (Laporan_Mei_2025.pdf)
    end`
  },
  {
    id: 'uc24', uc: 'UC-24', title: 'Toggle Mode Tabungan (ON/OFF)',
    actors: ["User","Frontend","Backend","Database"],
    relation: '<<extend>> UC-11',
    note: 'User dapat mengaktifkan atau menonaktifkan fitur tabungan kapan saja. Sistem langsung menyesuaikan skema alokasi: ON = 50/30/15/5, OFF = 60/30/10. Saldo tabungan yang ada tetap tersimpan.',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Toggle Mode Tabungan Kapan Saja
    User->>UI: Tekan toggle "Mode Tabungan" (Dashboard/Pengaturan)
    UI->>UI: Tampilkan konfirmasi perubahan mode
    User->>UI: Konfirmasi (OK)

    UI->>Server: PATCH /api/user-settings { saving_mode: OFF/ON }
    Server->>Server: Verifikasi JWT
    Server->>DB: UPDATE user_settings SET saving_mode = ?
    DB-->>Server: OK

    Note over Server, DB: Recalculate sisa anggaran & alokasi kategori
    Server->>DB: SELECT budget_summary & pemasukan_aktif
    DB-->>Server: Data Anggaran
    
    Server->>DB: UPDATE budget_remaining (recalculate 50/30/20 vs 60/30/10)
    DB-->>Server: OK

    Server-->>UI: 200 OK { new_saving_mode, new_allocations }
    UI-->>User: Update toggle visual + refresh progress bar alokasi`
  },
  {
    id: 'uc25', uc: 'UC-25', title: 'Setup Awal & Catat Pemasukan Pertama',
    actors: ["User","Frontend","Backend","Database"],
    relation: '<<extend>> UC-01, UC-02',
    note: 'Onboarding muncul sekali setelah registrasi. User mengisi pemasukan bulanan, memilih aktif/nonaktif tabungan, dan jika aktif: input nama target, nominal, dan deadline (minimal 10 bulan). Setelah konfirmasi, pemasukan pertama langsung dicatat dan sistem membagi saldo ke 4 kategori alokasi secara otomatis (seperti UC-05).',
    code: `
sequenceDiagram
    participant User as User (Browser)
    participant UI as Frontend (Web App)
    participant Server as Backend (REST API)
    participant DB as Database (SQL)

    Note over User, DB: Setup Awal Onboarding + Catat Pemasukan Pertama
    User->>UI: Redirect ke halaman Onboarding
    User->>UI: Isi nominal pemasukan mingguan/bulanan
    UI->>UI: Preview realtime estimasi alokasi
    User->>UI: Pilih ON/OFF fitur tabungan

    Note over User, UI: Jika ON: Setup Target (Nama, Nominal, Deadline)
    User->>UI: Input Target Tabungan & Deadline
    UI->>UI: Validasi & Kalkulasi Target (Min. 10 bulan)

    User->>UI: Klik "Mulai Gunakan FAST"
    UI->>Server: POST /api/onboarding { income, mode, goal? }
    Server->>Server: Verifikasi JWT

    Server->>DB: UPDATE settings & INSERT saving_goals (if ON)
    DB-->>Server: OK

    Note over Server, DB: Catat Pemasukan Pertama & Auto-Alokasi (UC-07)
    Server->>DB: INSERT transactions (type=income)
    DB-->>Server: OK
    
    Server->>DB: UPDATE budget_remaining & saving_goals (split saldo)
    DB-->>Server: OK

    Server->>DB: INSERT budget_allocations (log awal)
    DB-->>Server: OK
    
    Server-->>UI: 201 Created { onboarding_complete: true }
    UI-->>User: Redirect ke Dashboard (Saldo & Kategori terisi!)`
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

  const escapedCode = d.code ? d.code.replace(/`/g, '\`') : '';
  panel.innerHTML = `
    <div class="panel-header">
      <div class="panel-uc">${d.uc}</div>
      <div class="panel-title">${d.title}</div>
      <div class="panel-meta">${actorTags}${relTag}</div>
    </div>
    <div class="diagram-body">
      <div class="diagram-box" id="dbox-${d.id}">
        <img src="svgs/${d.id}.svg" class="svg-diagram" style="max-width:100%;height:auto;" alt="Diagram ${d.uc}"
          onerror="renderMermaidFallback('${d.id}', this)" />
        <div id="mermaid-${d.id}" class="mermaid" style="display:none;text-align:left;">${d.code ? d.code.trim() : ''}</div>
      </div>
      <div class="relation-note"><strong>Keterangan:</strong> ${d.note}</div>
      ${d.scenario ? `<div class="relation-note" style="border-left-color: var(--yellow); background: rgba(210,153,34,0.03); margin-top: 1rem;"><strong>Skenario:</strong> ${d.scenario}</div>` : ''}
    </div>`;
  mainEl.appendChild(panel);
});


function renderMermaidFallback(id, imgEl) {
  imgEl.style.display = 'none';
  const container = document.getElementById('mermaid-' + id);
  if (!container) return;
  container.style.display = 'block';
  if (typeof mermaid !== 'undefined') {
    try {
      mermaid.run({ nodes: [container] });
    } catch(e) {
      try { mermaid.init(undefined, container); } catch(e2) { console.warn('Mermaid render failed:', e2); }
    }
  }
}

function showPanel(id) {
  document.querySelectorAll('.diagram-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  
  const panel = document.getElementById('panel-' + id);
  if (panel) panel.classList.add('active');
  
  const navEl = document.getElementById('nav-' + id);
  if (navEl) { 
    navEl.classList.add('active'); 
    navEl.scrollIntoView({ block: 'nearest' }); 
  }
  
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Handle Mermaid diagrams in hidden panels
  if (typeof mermaid !== 'undefined') {
    setTimeout(() => {
      // Class diagram
      if (id === 'classdiagram') {
        try {
          mermaid.run({ querySelector: '#panel-classdiagram .mermaid' });
        } catch (e) {
          mermaid.init(undefined, document.querySelectorAll('#panel-classdiagram .mermaid'));
        }
      }
      // Fallback mermaid div for UCs without pre-generated SVG
      const fallbackEl = document.getElementById('mermaid-' + id);
      if (fallbackEl && fallbackEl.style.display !== 'none' && !fallbackEl.dataset.rendered) {
        fallbackEl.dataset.rendered = 'true';
        try {
          mermaid.run({ nodes: [fallbackEl] });
        } catch(e) {
          try { mermaid.init(undefined, fallbackEl); } catch(e2) {}
        }
      }
    }, 100);
  }
}

// Scroll to top button
window.addEventListener('scroll', () => {
  document.getElementById('scrollTop').classList.toggle('show', window.scrollY > 300);
});

