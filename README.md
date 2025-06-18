# GenieSnap 🚀

## 📦 Cara Menjalankan (How to Run)

### 🔁 1. Clone Repository

```bash
git clone https://github.com/ishal24/GenieSnap
cd GenieSnap
```

### 📁 2. Buat Folder `sd_models` dan Masukkan Model

Buat folder `sd_models` di dalam direktori project, lalu pindah ke folder tersebut untuk mendownload dan menyimpan model.

```bash
mkdir sd_models
cd sd_models
```
### ⬇️ 3. Download Model Checkpoint

Unduh model `revAnimated_v2Rebirth.safetensors` melalui link berikut:

🔗 [Download Model (SafeTensor - FP32)](http://10.4.90.23:8000/revAnimated_v2Rebirth.safetensors)

```bash
wget http://10.4.90.23:8000/revAnimated_v2Rebirth.safetensors
```

Pastikan model tersimpan di folder `sd_models`

### 🛠️ 4. Jalankan Docker

Pindah ke folder utama terlebih dahulu, lalu jalankan docker

```bash
cd ..
docker compose up --build
```

Tunggu hingga semua container selesai dibangun dan dijalankan.

### 🌐 5. Akses Stable Diffusion Web UI

Jika docker container telah selesai di build dan kemudian stuck pada bagian ini,
```
stable-diffusion-1  |   warnings.warn(
```

Buka browser dan akses:

```
http://localhost:7860
```

* Pastikan **Model Checkpoint** yang terpilih adalah:
  `revAnimated_v2Rebirth.safetensors`
![Reload UI](https://github.com/ishal24/GenieSnap/blob/main/img/image2.png)

* Klik tombol **Reload UI**, lalu tunggu beberapa saat hingga proses reload selesai
![Reload UI](https://github.com/ishal24/GenieSnap/blob/main/img/image.png)

### 🎨 6. Akses GenieSnap Frontend

Buka tab baru dan akses:

```
http://localhost:3000
```

### 📸 7. Snap Your Pic!

Mulailah gunakan AI Photobooth kamu dan nikmati hasilnya 🎉
