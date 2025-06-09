const video = document.getElementById("webcam");
const canvas = document.getElementById("canvas");
const captureBtn = document.getElementById("capture");
const carousel = document.getElementById("carousel");
const generateAllFiltersBtn = document.getElementById("generate-all-filters"); // Ini tetap ada tapi disembunyikan di HTML

const countdownDisplay = document.getElementById("countdown"); //

const mainLoadingOverlay = document.querySelector('.loading-overlay.full-screen'); //
const mainLoadingGif = mainLoadingOverlay.querySelector('.loading-gif'); //
const mainLoadingText = mainLoadingOverlay.querySelector('p'); //


const genderButtons = document.querySelectorAll(".gender-btn"); //
let selectedGender = "man"; // Inisialisasi default ke "man" karena itu yang akan terpilih secara default

const filters = [ //
  { id: "anime", name: "Anime", src: "filters/anime.jpeg" }, //
  { id: "dball", name: "Dragon Ball", src: "filters/dragon.jpeg" }, //
  { id: "retro", name: "Retro Game", src: "filters/game.jpeg" }, //
  { id: "captain", name: "Captain America", src: "filters/capt.jpeg" }, //
  { id: "strange", name: "Dr. Strange", src: "filters/strange.jpeg" }, //
  { id: "lego", name: "Lego", src: "filters/letsgo.jpeg" }, //
  { id: "gta", name: "GTA V", src: "filters/gta5.jpeg" }, //
];

const loadingGifs = [ //
  "filters/load.gif" //
];

const prompts = { //
  anime: "anime style, best quality, sharp focus, vibrant colors, dynamic pose, expressive eyes, clean lineart, fantasy background, youthful character, detailed hair, anime illustration", //
  dball: "transform the style of the image to 100% resemble the Dragon Ball anime graphic, with spiky hair like Goku, energetic aura, bold and sharp lines, high-shadow and high-contrast colors", //
  retro: "masterpiece, best quality, highly detailed, sharp focus, stunning, transform into a 8-bit pixel art character, pixelated textures, vibrant primary colors, retro video game, blocky shapes, maintain recognizable facial features, game sprite", //
  captain: "Transform me into Captain America, wearing the iconic costume and mask with impeccable attention to detail. featuring highly intricate and detailed textures in the Captain America outfit, including the iconic shield, tactical gear, and the classic star emblem on the chest. The image is rendered in stunning photorealistic style, with ultra-sharp focus. The overall mood exudes strength, heroism, and determination, perfectly capturing the essence of Captain America in a truly lifelike and cinematic manner", //
  strange: "masterpiece, best quality, highly detailed, intricate, sharp focus, stunning, photorealistic, Transform me into Doctor Strange from Marvel. Keep my facial features intact. Outfit includes the red Cloak of Levitation, Eye of Agamotto. Background should be mystical or resemble the Sanctum Sanc", //
  lego: "best quality, sharp focus, Transform the photo into a LEGO-inspired style, blocky textures, and playful cartoon. Keep the recognizable facial features and real-world proportions, while giving the image the fun, toy-like appearance of LEGO minifigures.", //
  gta:"masterpiece, best quality, highly detailed, sharp focus, stunning, photorealistic, transform into a Grand Theft Auto (GTA) illustration, dramatic pose, las vegas background, maintaining recognizable facial features, video game art.", //
};

const negativePrompt = "blurry, lowres, worst quality, nudity, nsfw, bad hands, distorted face, watermark, cropped head, mutated, deformed, jpeg artifacts"; //

let selectedFilter = filters[0].id; //

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
    if (previewText) previewText.style.display = 'block'; //
  });

// Build filter grid
filters.forEach((filter, index) => { //
  const div = document.createElement("div"); //
  div.classList.add("filter-option"); //
  if (index === 0) div.classList.add("selected"); //
  div.dataset.filter = filter.id; //
  div.innerHTML = `<img src="${filter.src}" alt="${filter.name}"><span>${filter.name}</span>`; //
  carousel.appendChild(div); //
});

// Event listener untuk pilihan filter
carousel.addEventListener("click", e => { //
  const option = e.target.closest(".filter-option"); //
  if (!option) return; //
  document.querySelectorAll(".filter-option").forEach(el => el.classList.remove("selected")); //
  option.classList.add("selected"); //
  selectedFilter = option.dataset.filter; //
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
  await captureAndGeneratePhoto(selectedFilter); //
}

// Function to capture photo and initiate generation
async function captureAndGeneratePhoto(filterToApply) { //
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
    sHeight = video.videoHeight; //
    sWidth = sHeight * canvasRatio; //
    sx = (video.videoWidth - sWidth) / 2; //
    sy = 0; //
  } else { //
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

  const originalImageData = canvas.toDataURL("image/jpeg"); // Ini gambar asli dari webcam

  // Gabungkan gender dengan prompt
  let currentPrompt = prompts[filterToApply]; //
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
        image: originalImageData, // Gunakan gambar asli di sini
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
      sessionStorage.setItem('generatedImageUrl', data.generated_image_url); // UBAH INI DARI generatedImageData
      sessionStorage.setItem('selectedFilterId', filterToApply); //
      sessionStorage.setItem('originalCapturedImageData', originalImageData); // Simpan gambar asli
      sessionStorage.setItem('selectedGender', selectedGender); // Simpan gender terpilih
      // Simpan juga filters dan prompts agar bisa diakses di result-script.js
      sessionStorage.setItem('availableFilters', JSON.stringify(filters)); //
      sessionStorage.setItem('availablePrompts', JSON.stringify(prompts)); //
      sessionStorage.setItem('negativePrompt', negativePrompt); //

      sessionStorage.setItem('resultMode', 'filter'); // <--- TAMBAH BARIS INI
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

// Event listeners (hanya yang relevan dengan halaman ini)
captureBtn.addEventListener("click", () => { //
  countdownAndCapture(3); //
});

// Sembunyikan event listener untuk tombol "Generate All Filters" karena tidak digunakan di workflow ini
if (generateAllFiltersBtn) { //
  generateAllFiltersBtn.style.display = 'none'; //
}