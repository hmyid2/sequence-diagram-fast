with open('c:/Users/hamid/Documents/projects/antigravity/sequence-diagram-fast/script.js', 'r', encoding='utf-8') as f:
    text = f.read()

# Update template to show scenario
old_template = '''      <div class="relation-note"><strong>Keterangan:</strong> ${d.note}</div>
    </div>'''

new_template = '''      <div class="relation-note"><strong>Keterangan:</strong> ${d.note}</div>
      ${d.scenario ? `<div class="relation-note" style="border-left-color: var(--yellow); background: rgba(210,153,34,0.03); margin-top: 1rem;"><strong>Skenario:</strong> ${d.scenario}</div>` : ''}
    </div>'''

text = text.replace(old_template, new_template)

# Add some sample scenarios
# UC-01
text = text.replace("id: 'uc01', uc: 'UC-01', title: 'Registrasi via Email',", 
                    "id: 'uc01', uc: 'UC-01', title: 'Registrasi via Email', scenario: 'User mengakses halaman registrasi, memasukkan kredensial, dan sistem memproses pembuatan akun serta pengiriman email verifikasi secara asinkron.',")

# UC-05 (Setup Alokasi)
text = text.replace("id: 'uc05', uc: 'UC-05', title: 'Setup Alokasi Anggaran 50/30/20',",
                    "id: 'uc05', uc: 'UC-05', title: 'Setup Alokasi Anggaran 50/30/20', scenario: 'User mengatur persentase pembagian saldo otomatis (misal: 50% Pokok, 30% Hiburan, 20% Tabungan). Sistem menyimpan konfigurasi ini untuk diterapkan pada setiap saldo yang masuk.',")

# UC-06 (Catat Pengeluaran)
text = text.replace("id: 'uc06', uc: 'UC-06', title: 'Catatan Pengeluaran',", 
                    "id: 'uc06', uc: 'UC-06', title: 'Catatan Pengeluaran', scenario: 'User memasukkan detail transaksi secara manual. Sistem melakukan validasi, menghitung kategori melalui AI, dan memperbarui sisa anggaran serta memberikan peringatan jika perlu.',")

# UC-13 (OCR)
text = text.replace("id: 'uc13', uc: 'UC-13', title: 'Upload Gambar Struk',",
                    "id: 'uc13', uc: 'UC-13', title: 'Upload Gambar Struk', scenario: 'User mengunggah foto struk belanja. Sistem mengirimkan gambar ke server untuk diolah oleh layanan OCR guna mengekstraksi teks dan nominal secara otomatis.',")

with open('c:/Users/hamid/Documents/projects/antigravity/sequence-diagram-fast/script.js', 'w', encoding='utf-8') as f:
    f.write(text)
