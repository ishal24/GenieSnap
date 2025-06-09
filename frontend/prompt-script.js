const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const customPromptInput = document.getElementById("customPrompt"); //

const countdownDisplay = document.getElementById("countdown"); //

const mainLoadingOverlay = document.querySelector('.loading-overlay.full-screen'); //
const mainLoadingGif = mainLoadingOverlay.querySelector('.loading-gif'); //
const mainLoadingText = mainLoadingOverlay.querySelector('p'); //

const genderButtons = document.querySelectorAll(".gender-btn"); //
let selectedGender = "man"; // Inisialisasi default

const loadingGifs = [ //
  "filters/load.gif" //
];

const negativePrompt = "blurry, lowres, worst quality, bad anatomy, bad hands, distorted face, watermark, nudity, nsfw, extra limbs, cropped head, mutated, deformed, jpeg artifacts"; //


// Start webcam
navigator.mediaDevices.getUserMedia({ video: true }) //
  .then(stream => { //
    video.srcObject = stream; //
    const previewText = document.querySelector('.preview-text'); //
    if (previewText) previewText.style.display = 'none'; //

    video.addEventListener('loadedmetadata', () => { //
      // Tidak perlu mengatur video.width/height di sini karena CSS object-fit: cover akan menanganinya.
      // drawImage akan menggunakan dimensi intrinsik video.videoWidth/video.videoHeight.
    });
  })
  .catch(err => { //
    console.error("Camera access denied or not available:", err); //
    const previewText = document.querySelector('.preview-text'); //
    if (previewText) previewText.textContent = "Camera access denied or not available."; //
    if (previewText) preview.style.display = 'block'; //
  });

document.addEventListener('DOMContentLoaded', () => { //
    const defaultGenderButton = document.getElementById("gender-male"); //
    if (defaultGenderButton) { //
        defaultGenderButton.classList.add("selected-gender"); //
        selectedGender = defaultGenderButton.dataset.gender; //
    }
});

// Event listener untuk pilihan gender (tombol)
genderButtons.forEach(button => { //
  button.addEventListener("click", () => { //
    genderButtons.forEach(btn => btn.classList.remove("selected-gender")); //
    button.classList.add("selected-gender"); //
    selectedGender = button.dataset.gender; //
    console.log("Selected Gender:", selectedGender); //
  });
});

// Countdown and capture flow
async function countdownAndCapture(seconds) { //
  countdownDisplay.style.display = "block"; //

  for (let i = seconds; i > 0; i--) { //
    countdownDisplay.textContent = i; //
    await new Promise(r => setTimeout(r, 1000)); //
  }

  countdownDisplay.style.display = "none"; //
  capturePhoto(); //
}

// Capture photo and call backend API
async function capturePhoto() { //
  const targetWidth = 512; // Lebar target untuk canvas
  const targetHeight = 512; // Tinggi target untuk canvas
  canvas.width = targetWidth; //
  canvas.height = targetHeight; //
  const ctx = canvas.getContext("2d"); //

  if (video.videoWidth === 0 || video.videoHeight === 0) { //
    console.error("Video stream not ready yet."); //
    mainLoadingText.textContent = "Camera not ready. Please wait a moment and try again."; //
    mainLoadingOverlay.classList.add("active"); // Tampilkan overlay
    setTimeout(() => { //
        mainLoadingOverlay.classList.remove("active"); // Sembunyikan overlay
    }, 3000); //
    return; //
  }

  // Logika cropping untuk mempertahankan rasio aspek video dan mengisi kanvas
  const videoRatio = video.videoWidth / video.videoHeight; //
  const canvasRatio = targetWidth / targetHeight; //

  let sx, sy, sWidth, sHeight; // Sumber (video)
  let dx = 0, dy = 0, dWidth = targetWidth, dHeight = targetHeight; // Tujuan (canvas)

  if (videoRatio > canvasRatio) { //
    // Video lebih lebar dari kanvas, pangkas lebar video
    sHeight = video.videoHeight; //
    sWidth = sHeight * canvasRatio; //
    sx = (video.videoWidth - sWidth) / 2; //
    sy = 0; //
  } else { //
    // Video lebih tinggi dari kanvas, pangkas tinggi video
    sWidth = video.videoWidth; //
    sHeight = sWidth / canvasRatio; //
    sy = (video.videoHeight - sHeight) / 2; //
    sx = 0; //
  }

  // Transformasi untuk membalik gambar secara horizontal
  ctx.translate(targetWidth, 0); //
  ctx.scale(-1, 1); //
  // Gambar video ke kanvas
  ctx.drawImage(video, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight); //
  // Reset transformasi agar teks atau gambar lain tidak terbalik
  ctx.setTransform(1, 0, 0, 1, 0, 0); //

  const imageData = canvas.toDataURL("image/jpeg"); //

  // Prompt logic for custom prompt page:
  let currentPrompt = customPromptInput.value.trim(); //
  if (!currentPrompt) { //
      customPromptInput.style.borderColor = 'red'; // Tambah border merah
      customPromptInput.focus(); // Fokus ke input
      mainLoadingText.textContent = "Please enter a prompt!"; //
      mainLoadingOverlay.classList.add("active"); // Tampilkan overlay
      setTimeout(() => { //
          mainLoadingOverlay.classList.remove("active"); // Sembunyikan overlay
          customPromptInput.style.borderColor = '#555'; // Kembalikan border
      }, 3000); //
      return; //
  } else {
      customPromptInput.style.borderColor = '#555'; // Pastikan border normal jika ada input
  }

  // Gabungkan gender dengan prompt
  if (selectedGender) { //
    currentPrompt = `${selectedGender}, ${currentPrompt}`; //
  }


  // Tampilkan overlay loading
  mainLoadingText.textContent = "Generating your Genie Snap..."; //
  mainLoadingGif.src = loadingGifs[Math.floor(Math.random() * loadingGifs.length)]; //
  mainLoadingOverlay.classList.add("active"); // Tampilkan overlay

  try { //
    const res = await fetch("/generate", { //
      method: "POST", //
      headers: { "Content-Type": "application/json" }, //
      body: JSON.stringify({ //
        image: imageData, //
        prompt: currentPrompt, //
        negative_prompt: negativePrompt //
      })
    });

    if (!res.ok) { //
        const errorData = await res.json(); //
        throw new Error(`Network response was not ok: ${errorData.error || res.statusText}`); //
    }

    const data = await res.json(); //

    if (data.generated_image_url) { // UBAH INI DARI generated_image
      // Simpan gambar dan "filterId" (di sini bisa jadi "custom-prompt") di sessionStorage
      sessionStorage.setItem('generatedImageUrl', data.generated_image_url); // UBAH INI DARI generatedImageData
      sessionStorage.setItem('selectedFilterId', 'custom-prompt'); //

      sessionStorage.setItem('resultMode', 'prompt'); // <--- TAMBAH BARIS INI
      sessionStorage.setItem('previousPage', window.location.href); //

      mainLoadingOverlay.classList.remove("active"); // Sembunyikan overlay
      window.location.href = `/result.html`; //
    } else {
      throw new Error("No generated image URL received."); // Ubah pesan error
    }

  } catch (err) { //
    console.error("Image generation error:", err); //
    mainLoadingText.textContent = `Error generating image! ${err.message}. Try again.`; //
    mainLoadingGif.src = ""; //
  }
}

// Event listeners
captureBtn.addEventListener("click", () => { //
  countdownAndCapture(3); //
});