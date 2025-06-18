# GenieSnap 🚀

## 📦 Cara Menjalankan (How to Run)

### 1. Clone Repository

```bash
git clone https://github.com/ishal24/GenieSnap
cd GenieSnap
```

### 2. Buat Folder `sd_models` dan Masukkan Model

Buat folder `sd_models` di dalam direktori project, lalu pindah ke folder tersebut untuk mendownload dan menyimpan model.

```bash
mkdir sd_models
cd sd_models
```

### 3. Download Model Checkpoint

Unduh model `revAnimated_v2Rebirth.safetensors` melalui link berikut:

🔗 [Download Model (SafeTensor - FP32)](https://civitai.com/api/download/models/425083)

### 4. Jalankan Docker

```bash
docker compose up --build
```

Tunggu hingga semua container selesai dibangun dan dijalankan.

### 5. Akses Stable Diffusion Web UI

Buka browser dan akses:

```
http://localhost:7860
```

* Klik tombol **Reload UI**
* Pastikan **Model Checkpoint** yang terpilih adalah:
  `revAnimated_v2Rebirth.safetensors`

### 6. Akses GenieSnap Frontend

Buka tab baru dan akses:

```
http://localhost:3000
```

### 7. Snap Your Pic! 📸

Mulailah gunakan AI Photobooth kamu dan nikmati hasilnya 🎉

---

Jika kamu ingin menambahkan bagian **FAQ**, **Troubleshooting**, atau **Fitur**, tinggal kabari saja dan saya bantu tambahkan.
