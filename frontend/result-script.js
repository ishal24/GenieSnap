document.addEventListener('DOMContentLoaded', () => {
    const generatedImageDisplay = document.getElementById('generated-image-display');
    const downloadBtnResult = document.getElementById('download-btn-result');
    const retryBtnResult = document.getElementById('retry-btn-result');
    const loadingOverlay = document.querySelector('.loading-overlay.full-screen');
    const filterSelectionButtonsContainer = document.getElementById('filter-selection-buttons-container');

    const qrModalOverlay = document.getElementById('qr-modal-overlay');
    const qrModalContent = document.querySelector('#qr-modal-overlay .qr-modal-content');
    const qrModalCloseBtn = qrModalContent.querySelector('.close-btn');
    const modalQrcodeContainer = document.getElementById('modal-qrcode');
    const directDownloadLink = document.getElementById('direct-download-link');

    const imageUrl = sessionStorage.getItem('generatedImageUrl');
    const filterId = sessionStorage.getItem('selectedFilterId');
    const resultMode = sessionStorage.getItem('resultMode');

    const originalCapturedImageData = sessionStorage.getItem('originalCapturedImageData');
    const selectedGender = sessionStorage.getItem('selectedGender');
    const availableFilters = JSON.parse(sessionStorage.getItem('availableFilters'));
    const availablePrompts = JSON.parse(sessionStorage.getItem('availablePrompts'));
    const negativePrompt = sessionStorage.getItem('negativePrompt');

    const generatedImagesCache = {};

    function generateQrCodeInModal(url) {
        if (!url) {
            console.error("URL for QR code is empty.");
            return;
        }
        modalQrcodeContainer.innerHTML = '';
        new QRCode(modalQrcodeContainer, {
            text: url,
            width: 200,
            height: 200,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        });
    }

    generatedImageDisplay.addEventListener('load', () => {
        loadingOverlay.classList.remove('active'); // Sembunyikan overlay saat gambar berhasil dimuat
    });

    if (resultMode === 'filter' && imageUrl && originalCapturedImageData && availableFilters && availablePrompts) {
        filterSelectionButtonsContainer.style.display = 'flex';

        generatedImageDisplay.src = imageUrl;
        generatedImageDisplay.dataset.currentFilterId = filterId;
        generatedImagesCache[filterId] = imageUrl;

        availableFilters.forEach(f => {
            // UBAH CARA MEMBUAT ELEMEN BUTTON MENJADI STRUKTUR DIV FILTER-OPTION
            const div = document.createElement("div");
            div.classList.add("filter-option-result"); // KITA PAKAI CLASS BARU UNTUK RESULT
            if (f.id === filterId) {
                div.classList.add("selected"); // GANTI active-filter JADI selected
            }
            div.dataset.filterId = f.id;

            const img = document.createElement("img");
            img.src = f.src;
            img.alt = f.name;
            div.appendChild(img);

            const span = document.createElement("span");
            span.textContent = f.name;
            div.appendChild(span);

            div.addEventListener('click', async () => {
                // UBAH QUERY SELECTOR UNTUK MENGHAPUS KELAS 'selected'
                document.querySelectorAll('.filter-option-result').forEach(el => el.classList.remove('selected'));
                div.classList.add('selected');

                const currentFilterId = f.id;

                if (generatedImagesCache[currentFilterId]) {
                    generatedImageDisplay.src = generatedImagesCache[currentFilterId];
                    generatedImageDisplay.dataset.currentFilterId = currentFilterId;
                    sessionStorage.setItem('generatedImageUrl', generatedImagesCache[currentFilterId]);
                    sessionStorage.setItem('selectedFilterId', currentFilterId);
                    return;
                }

                loadingOverlay.classList.add('active'); // Tampilkan overlay
                loadingOverlay.querySelector('p').textContent = `Generating ${f.name} Genie Snap...`;

                try {
                    const res = await fetch("/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            image: originalCapturedImageData,
                            prompt: `${selectedGender}, ${availablePrompts[f.id]}`,
                            negative_prompt: negativePrompt
                        })
                    });

                    if (!res.ok) {
                        const errorData = await res.json();
                        throw new Error(`Network response was not ok: ${errorData.error || res.statusText}`);
                    }

                    const data = await res.json();

                    if (data.generated_image_url) {
                        generatedImageDisplay.src = data.generated_image_url;
                        generatedImageDisplay.dataset.currentFilterId = currentFilterId;
                        generatedImagesCache[currentFilterId] = data.generated_image_url;
                        sessionStorage.setItem('generatedImageUrl', data.generated_image_url);
                        sessionStorage.setItem('selectedFilterId', currentFilterId);

                    } else {
                        throw new Error("No generated image URL received from Imgur.");
                    }

                } catch (err) {
                    console.error(`Error generating image for ${f.name}:`, err);
                    loadingOverlay.querySelector('p').textContent = `Error generating image for ${f.name}! ${err.message}.`;
                    generatedImageDisplay.alt = `Error: ${f.name} failed to generate.`;
                } finally {
                    // Overlay akan disembunyikan oleh event listener generatedImageDisplay 'load'
                    // Jika ada error dan gambar tidak dimuat, sembunyikan secara manual
                    if (!data?.generated_image_url) {
                         loadingOverlay.classList.remove('active');
                    }
                }
            });
            filterSelectionButtonsContainer.appendChild(div); // Tambahkan div ke container
        });

    } else if (resultMode === 'prompt' && imageUrl) {
        filterSelectionButtonsContainer.style.display = 'none';
        generatedImageDisplay.src = imageUrl;
        generatedImageDisplay.dataset.currentFilterId = filterId;

    } else {
        generatedImageDisplay.alt = "Error loading image. Redirecting...";
        loadingOverlay.classList.add('active'); // Tampilkan overlay
        loadingOverlay.querySelector('p').textContent = "Error loading image. Redirecting to home...";
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
        return;
    }

    downloadBtnResult.addEventListener('click', () => {
        const currentImageUrl = generatedImageDisplay.src;
        const currentFilterId = generatedImageDisplay.dataset.currentFilterId || 'generated';

        if (currentImageUrl) {
            qrModalOverlay.classList.add('active'); // Tampilkan QR modal
            generateQrCodeInModal(currentImageUrl);

            directDownloadLink.href = currentImageUrl;
            directDownloadLink.download = `ai_photobooth_${currentFilterId}.jpeg`;

        } else {
            alert("No image available to generate QR code or download.");
        }
    });

    qrModalCloseBtn.addEventListener('click', () => {
        qrModalOverlay.classList.remove('active'); // Sembunyikan QR modal
    });

    qrModalOverlay.addEventListener('click', (e) => {
        if (e.target === qrModalOverlay) {
            qrModalOverlay.classList.remove('active'); // Sembunyikan QR modal jika klik di luar
        }
    });

    retryBtnResult.addEventListener('click', () => {
        const previousPage = sessionStorage.getItem('previousPage');
        if (previousPage) {
            window.location.href = previousPage;
        } else {
            window.location.href = '/';
        }
    });
});