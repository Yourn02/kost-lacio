/**
 * @file main.js
 * @description Logika Frontend Landing Page Kost Lacio dengan Mode Admin (SPA), 
 * Pop-Up Form Tambah Kamar, Rendering Harga/Status, & Feature Image Zoom Modal.
 */

// Global Variables
let slideIndex = 0;
let slideInterval;
let currentRoomsData = []; // Menyimpan data kamar aktif
let deletedRoomIds = [];


/* ==========================================================================
   1. UTILITY & NOTIFIKASI POP-UP CUSTOM
   ========================================================================== */

function showCustomAlert(title, message) {
    const modal = document.getElementById('customAlertModal');
    const titleEl = document.getElementById('customModalTitle');
    const msgEl = document.getElementById('customModalMessage');

    if (modal && titleEl && msgEl) {
        titleEl.textContent = title;
        msgEl.textContent = message;
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    } else {
        alert(`${title}: ${message}`);
    }
}

function closeCustomAlert() {
    const modal = document.getElementById('customAlertModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

function formatRupiah(angka) {
    if (!angka || isNaN(angka)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(angka);
}


/* ==========================================================================
   2. INITIALIZATION (DOM CONTENT LOADED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    checkAdminMode();
    loadRoomAvailability();
    loadHargaKamar();

    // Inisialisasi Tautan WhatsApp Admin
    const btnWaContact = document.getElementById('btn-wa-contact');
    if (btnWaContact) {
        const waNumber = (typeof CONFIG !== 'undefined' && CONFIG.ADMIN_WA_NUMBER) ? CONFIG.ADMIN_WA_NUMBER : '6281234567890';
        const message = encodeURIComponent('Halo Admin Kost Lacio, saya ingin bertanya mengenai ketersediaan kamar.');
        btnWaContact.href = `https://wa.me/${waNumber}?text=${message}`;
    }

    initHeroSlider();
    initImageZoomEvents();

    // Logika Submit Form Login Admin
    const formLogin = document.getElementById('formLogin') || document.getElementById('formLoginAdmin');
    if (formLogin) {
        formLogin.addEventListener('submit', (e) => {
            e.preventDefault();

            const usernameInput = formLogin.querySelector('input[type="text"]')?.value || document.getElementById('loginUsername')?.value;
            const passwordInput = formLogin.querySelector('input[type="password"]')?.value || document.getElementById('loginPassword')?.value;

            if (usernameInput === 'admin' && passwordInput === '123') {
                localStorage.setItem('isAdminLoggedIn', 'true');

                const modal = document.getElementById('loginModal') || document.getElementById('LoginModal');
                if (modal) {
                    modal.classList.add('hidden');
                    modal.style.setProperty('display', 'none', 'important');
                }

                checkAdminMode();
                formLogin.reset();
                showCustomAlert('Login Berhasil', 'Mode Admin telah berhasil diaktifkan!');
            } else {
                showCustomAlert('Login Gagal', 'Username atau Password yang Anda masukkan salah!');
            }
        });
    }
});


/* ==========================================================================
   3. FUNGSI LOAD HARGA KAMAR
   ========================================================================== */

async function loadHargaKamar() {
    try {
        const url = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL)
            ? `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.GET_ALL_ROOMS}`
            : 'http://localhost:5000/api/rooms';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengambil data dari server');

        const result = await response.json();
        const dataRooms = Array.isArray(result) ? result : (result.data || []);

        const regRoom = dataRooms.find(r => (r.tipe_Kmr || r.type || '').toLowerCase() === 'reguler');
        const vipRoom = dataRooms.find(r => (r.tipe_Kmr || r.type || '').toLowerCase() === 'vip');

        if (regRoom) {
            const h1 = regRoom.harga_1_org || regRoom.harga_1_orang;
            const h2 = regRoom.harga_2_org || regRoom.harga_2_orang;

            const cardH1 = document.getElementById('harga-reguler-1');
            const cardH2 = document.getElementById('harga-reguler-2');
            if (cardH1) cardH1.textContent = formatRupiah(h1);
            if (cardH2) cardH2.textContent = formatRupiah(h2);

            const detailH1 = document.getElementById('detail-harga-reguler-1');
            const detailH2 = document.getElementById('detail-harga-reguler-2');
            if (detailH1) detailH1.textContent = formatRupiah(h1);
            if (detailH2) detailH2.textContent = formatRupiah(h2);
        }

        if (vipRoom) {
            const h1 = vipRoom.harga_1_org || vipRoom.harga_1_orang;
            const h2 = vipRoom.harga_2_org || vipRoom.harga_2_orang;

            const cardH1 = document.getElementById('harga-vip-1');
            const cardH2 = document.getElementById('harga-vip-2');
            if (cardH1) cardH1.textContent = formatRupiah(h1);
            if (cardH2) cardH2.textContent = formatRupiah(h2);

            const detailH1 = document.getElementById('detail-harga-vip-1');
            const detailH2 = document.getElementById('detail-harga-vip-2');
            if (detailH1) detailH1.textContent = formatRupiah(h1);
            if (detailH2) detailH2.textContent = formatRupiah(h2);
        }

    } catch (err) {
        console.error('Gagal memuat data harga kamar:', err);
    }
}


/* ==========================================================================
   4. LOGIKA MODE ADMIN (SINGLE PAGE APPLICATION)
   ========================================================================== */

function checkAdminMode() {
    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';
    const adminElements = document.querySelectorAll('.admin-only');
    const btnOpenLogin = document.getElementById('btnOpenLogin');

    if (isAdmin) {
        adminElements.forEach(el => {
            el.classList.remove('hidden');
            el.style.setProperty('display', 'inline-block', 'important');
        });
        if (btnOpenLogin) btnOpenLogin.style.setProperty('display', 'none', 'important');
        loadRoomAvailability();
    } else {
        adminElements.forEach(el => {
            el.classList.add('hidden');
            el.style.setProperty('display', 'none', 'important');
        });
        if (btnOpenLogin) btnOpenLogin.style.setProperty('display', 'inline-block', 'important');
    }
}

function logoutAdmin() {
    localStorage.removeItem('isAdminLoggedIn');
    checkAdminMode();
    loadRoomAvailability();
    showCustomAlert('Berhasil Keluar', 'Anda telah keluar dari Mode Admin.');
}


/* ==========================================================================
   5. LOGIKA KETERSEDIAAN & DETAIL KAMAR (DATABASE INTEGRATION)
   ========================================================================== */

const defaultRooms = [
    { id: 1, no_Kmr: '01', tipe_Kmr: 'Reguler', Keterangan: 'Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 2, no_Kmr: '02', tipe_Kmr: 'Reguler', Keterangan: 'tidak Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 3, no_Kmr: '03', tipe_Kmr: 'Reguler', Keterangan: 'Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 4, no_Kmr: '04', tipe_Kmr: 'Reguler', Keterangan: 'Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 5, no_Kmr: '05', tipe_Kmr: 'Reguler', Keterangan: 'tidak Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 6, no_Kmr: '06', tipe_Kmr: 'Reguler', Keterangan: 'Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 7, no_Kmr: '07', tipe_Kmr: 'Reguler', Keterangan: 'Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 8, no_Kmr: '08', tipe_Kmr: 'Reguler', Keterangan: 'tidak Tersedia', harga_1_org: 6500000, harga_2_org: 7500000 },
    { id: 9, no_Kmr: '01', tipe_Kmr: 'VIP', Keterangan: 'Tersedia', harga_1_org: 9000000, harga_2_org: 10000000 },
    { id: 10, no_Kmr: '02', tipe_Kmr: 'VIP', Keterangan: 'tidak Tersedia', harga_1_org: 9000000, harga_2_org: 10000000 },
    { id: 11, no_Kmr: '03', tipe_Kmr: 'VIP', Keterangan: 'Tersedia', harga_1_org: 9000000, harga_2_org: 10000000 },
    { id: 12, no_Kmr: '04', tipe_Kmr: 'VIP', Keterangan: 'Tersedia', harga_1_org: 9000000, harga_2_org: 10000000 },
    { id: 13, no_Kmr: '05', tipe_Kmr: 'VIP', Keterangan: 'tidak Tersedia', harga_1_org: 9000000, harga_2_org: 10000000 },
];

async function loadRoomAvailability() {
    try {
        const url = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL)
            ? `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.GET_ALL_ROOMS}`
            : 'http://localhost:5000/api/rooms';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal mengambil data dari server');

        const result = await response.json();

        let fetchedRooms = [];
        if (Array.isArray(result)) {
            fetchedRooms = result;
        } else if (result && Array.isArray(result.data)) {
            fetchedRooms = result.data;
        }

        if (fetchedRooms.length > 0) {
            currentRoomsData = fetchedRooms;
        } else {
            currentRoomsData = defaultRooms;
        }

    } catch (error) {
        console.warn('Gagal terhubung ke server backend, menggunakan data fallback:', error);
        currentRoomsData = defaultRooms;
    }

    renderRoomGrid();
    renderRoomCardsData();
}

function renderRoomGrid() {
    const gridReguler = document.getElementById('grid-reguler');
    const gridVip = document.getElementById('grid-vip');

    if (gridReguler) gridReguler.innerHTML = '';
    if (gridVip) gridVip.innerHTML = '';

    const isAdmin = localStorage.getItem('isAdminLoggedIn') === 'true';

    // Sisipkan Tombol Tambah Kamar untuk Admin
    if (isAdmin) {
        if (gridReguler) {
            const btnAddReg = document.createElement('div');
            btnAddReg.className = 'door-card add-room-card';
            btnAddReg.innerHTML = `<div style="font-size:24px; font-weight:bold;">+</div><div>Tambah Reguler</div>`;
            btnAddReg.onclick = () => tambahKamar('Reguler');
            gridReguler.appendChild(btnAddReg);
        }
        if (gridVip) {
            const btnAddVip = document.createElement('div');
            btnAddVip.className = 'door-card add-room-card';
            btnAddVip.innerHTML = `<div style="font-size:24px; font-weight:bold;">+</div><div>Tambah VIP</div>`;
            btnAddVip.onclick = () => tambahKamar('VIP');
            gridVip.appendChild(btnAddVip);
        }
    }

    currentRoomsData.forEach((room, index) => {
        const isAvailable = room.Keterangan && room.Keterangan.toLowerCase() === 'tersedia';
        const statusClass = isAvailable ? 'kosong available' : 'terisi occupied';
        const statusText = isAvailable ? 'Tersedia' : 'Terisi';
        let displayNum = String(room.no_Kmr).padStart(2, '0');

        const doorCard = document.createElement('div');
        doorCard.className = `door-card ${statusClass} ${isAdmin ? 'admin-editable' : ''}`;

        doorCard.innerHTML = `
            <div class="room-number">Kamar ${displayNum}</div>
            <div class="room-status">${statusText}</div>
            ${isAdmin ? `
                <div class="admin-actions" style="margin-top: 8px; display: flex; gap: 8px; justify-content: center;">
                    <button class="btn-action-edit" title="Ubah Status Ketersediaan" onclick="toggleStatusKamar(${index})">✏️</button>
                    <button class="btn-action-delete" title="Hapus Kamar" onclick="hapusKamar(${index})">🗑️</button>
                </div>
            ` : ''}
        `;

        const tipeKamar = (room.tipe_Kmr || room.type || '').toLowerCase();

        if (tipeKamar === 'vip' && gridVip) {
            gridVip.appendChild(doorCard);
        } else if (gridReguler) {
            gridReguler.appendChild(doorCard);
        }
    });
}

function renderRoomCardsData() {
    currentRoomsData.forEach(room => {
        const roomId = room.id || room._id || room.no_Kmr;
        const card = document.querySelector(`[data-room-id="${roomId}"]`);

        if (card) {
            const h1 = room.harga_1_org || room.harga_1_orang;
            const h2 = room.harga_2_org || room.harga_2_orang;

            const price1El = card.querySelector('.price-1');
            if (price1El && h1) {
                price1El.textContent = `${formatRupiah(h1)} / bln (1 Orang)`;
            }

            const price2El = card.querySelector('.price-2');
            if (price2El && h2) {
                price2El.textContent = `${formatRupiah(h2)} / bln (2 Orang)`;
            }

            const statusEl = card.querySelector('.room-status');
            if (statusEl) {
                const statusStr = room.Keterangan || room.status || 'Tersedia';
                const isAvailable = statusStr.toLowerCase() === 'tersedia';
                statusEl.textContent = isAvailable ? 'Tersedia' : 'Terisi';
                statusEl.className = `room-status ${isAvailable ? 'available' : 'occupied'}`;
            }
        }
    });
}

/* ==========================================================================
   MODAL FORM PEMBUATAN KAMAR BARU (MENGGANTIKAN PROMPT)
   ========================================================================== */

/**
 * Membuka Modal Form Tambah Kamar & Mengisi Otomatis Data Default
 */
function tambahKamar(tipe) {
    const modal = document.getElementById('modalTambahKamar');
    const inputTipe = document.getElementById('inputTipeKmr');
    const inputHarga1 = document.getElementById('inputHarga1');
    const inputHarga2 = document.getElementById('inputHarga2');

    if (!modal) {
        showCustomAlert('Error', 'Elemen modalTambahKamar belum terpasang di HTML!');
        return;
    }

    // Isian Otomatis
    if (inputTipe) inputTipe.value = tipe;

    if (tipe.toLowerCase() === 'vip') {
        if (inputHarga1) inputHarga1.value = 9000000;
        if (inputHarga2) inputHarga2.value = 10000000;
    } else {
        if (inputHarga1) inputHarga1.value = 6500000;
        if (inputHarga2) inputHarga2.value = 7500000;
    }

    // Reset input manual
    const inputNo = document.getElementById('inputNoKmr');
    const inputKet = document.getElementById('inputKeterangan');
    if (inputNo) inputNo.value = '';
    if (inputKet) inputKet.value = 'Tersedia';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

/**
 * Menutup Modal Form Tambah Kamar
 */
function closeModalTambah() {
    const modal = document.getElementById('modalTambahKamar');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

/**
 * Memproses Data Form Tambah Kamar & Menambahkannya ke Antrean Tampilan Lokal (Tanpa Reload)
 */
function submitModalKamarBaru(event) {
    event.preventDefault(); // Mencegah reload/refresh halaman browser

    const noKmr = document.getElementById('inputNoKmr')?.value.trim();
    const tipeKmr = document.getElementById('inputTipeKmr')?.value;
    const keterangan = document.getElementById('inputKeterangan')?.value;
    const harga1 = parseFloat(document.getElementById('inputHarga1')?.value || 0);
    const harga2 = parseFloat(document.getElementById('inputHarga2')?.value || 0);

    if (!noKmr) {
        showCustomAlert('Peringatan', 'Nomor kamar wajib diisi!');
        return;
    }

    // Buat objek kamar baru bertanda 'isNew'
    const newRoom = {
        isNew: true, // Marker bahwa data ini berada di antrean lokal (belum ada di DB)
        no_Kmr: noKmr,
        tipe_Kmr: tipeKmr,
        Keterangan: keterangan,
        harga_1_org: harga1,
        harga_2_org: harga2
    };

    // 1. Masukkan ke array data lokal
    currentRoomsData.push(newRoom);

    // 2. Render ulang denah ketersediaan di layar
    renderRoomGrid();
    renderRoomCardsData();

    // 3. Tutup modal form
    closeModalTambah();

    // 4. Berikan notifikasi petunjuk
    showCustomAlert(
        'Ditambahkan ke Tampilan',
        `Kamar ${noKmr} (${tipeKmr}) berhasil muncul di layar. Klik tombol "Simpan Perubahan ke Database" di bawah untuk menyimpannya secara permanen.`
    );
}

/* ==========================================================================
   SAVING & EDITING LOGIC
   ========================================================================== */

async function saveRoomChanges() {
    if (typeof CONFIG === 'undefined' || !CONFIG.BASE_URL) {
        showCustomAlert('Error', 'CONFIG.BASE_URL belum diset!');
        return;
    }

    try {
        let totalSuccess = 0;

        // 1. PROSES HAPUS KAMAR
        for (const roomId of deletedRoomIds) {
            const deleteUrl = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.GET_ROOM_BY_ID(roomId)}`;
            const res = await fetch(deleteUrl, { method: 'DELETE' });
            if (res.ok) totalSuccess++;
        }
        deletedRoomIds = [];

        // 2. PROSES TAMBAH / UPDATE KAMAR
        for (const room of currentRoomsData) {
            const roomId = room.id || room._id;

            if (room.isNew || !roomId) {
                const createUrl = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.GET_ALL_ROOMS}`;
                const res = await fetch(createUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        no_Kmr: room.no_Kmr,
                        tipe_Kmr: room.tipe_Kmr,
                        Keterangan: room.Keterangan,
                        harga_1_org: room.harga_1_org,
                        harga_2_org: room.harga_2_org
                    })
                });
                if (res.ok) totalSuccess++;
            } else {
                const updateUrl = `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.UPDATE_ROOM_STATUS(roomId)}`;
                const res = await fetch(updateUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        no_Kmr: room.no_Kmr,
                        tipe_Kmr: room.tipe_Kmr,
                        Keterangan: room.Keterangan,
                        harga_1_org: room.harga_1_org,
                        harga_2_org: room.harga_2_org
                    })
                });
                if (res.ok) totalSuccess++;
            }
        }

        showCustomAlert('Berhasil!', 'Proses simpan ke Database selesai.');
        await loadRoomAvailability();

    } catch (error) {
        console.error('Error saat simpan ke DB:', error);
        showCustomAlert('Gagal', 'Terjadi kesalahan koneksi saat menyimpan.');
    }
}

function toggleStatusKamar(index) {
    const isAvailable = currentRoomsData[index].Keterangan?.toLowerCase() === 'tersedia';
    currentRoomsData[index].Keterangan = isAvailable ? 'tidak Tersedia' : 'Tersedia';

    renderRoomGrid();
    renderRoomCardsData();
}

function hapusKamar(index) {
    const room = currentRoomsData[index];
    const roomId = room.id || room._id;

    if (!confirm(`Hapus Kamar ${room.no_Kmr} (${room.tipe_Kmr})? Perubahan akan diterapkan ke Database saat tombol Simpan diklik.`)) {
        return;
    }

    if (roomId && !room.isNew) {
        deletedRoomIds.push(roomId);
    }

    currentRoomsData.splice(index, 1);
    renderRoomGrid();
    renderRoomCardsData();
}


/* ==========================================================================
   6. LOGIKA HERO IMAGE SLIDER
   ========================================================================== */

function initHeroSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length > 0) {
        showSlide(slideIndex);
        startAutoSlide();
    }
}

function showSlide(index) {
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.dot');

    if (slides.length === 0) return;

    if (index >= slides.length) slideIndex = 0;
    if (index < 0) slideIndex = slides.length - 1;

    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[slideIndex].classList.add('active');
    if (dots[slideIndex]) dots[slideIndex].classList.add('active');
}

function moveSlide(step) {
    slideIndex += step;
    showSlide(slideIndex);
    resetAutoSlide();
}

function currentSlide(index) {
    slideIndex = index;
    showSlide(slideIndex);
    resetAutoSlide();
}

function startAutoSlide() {
    slideInterval = setInterval(() => {
        slideIndex++;
        showSlide(slideIndex);
    }, 3500);
}

function resetAutoSlide() {
    clearInterval(slideInterval);
    startAutoSlide();
}


/* ==========================================================================
   7. LOGIKA HALAMAN DETAIL
   ========================================================================== */

async function loadHargaDetail(tipeKamar) {
    try {
        const url = (typeof CONFIG !== 'undefined' && CONFIG.BASE_URL)
            ? `${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.GET_ALL_ROOMS}`
            : 'http://localhost:5000/api/rooms';

        const response = await fetch(url);
        if (!response.ok) throw new Error('Gagal fetch data');

        const result = await response.json();
        const dataRooms = Array.isArray(result) ? result : (result.data || []);

        const room = dataRooms.find(r =>
            (r.tipe_Kmr || r.type || '').toLowerCase() === tipeKamar.toLowerCase()
        );

        if (room) {
            const h1 = room.harga_1_org || room.harga_1_orang;
            const h2 = room.harga_2_org || room.harga_2_orang;

            const elH1 = document.getElementById('detail-harga-1') ||
                document.getElementById(`detail-harga-${tipeKamar.toLowerCase()}-1`);
            const elH2 = document.getElementById('detail-harga-2') ||
                document.getElementById(`detail-harga-${tipeKamar.toLowerCase()}-2`);

            if (elH1) elH1.textContent = formatRupiah(h1);
            if (elH2) elH2.textContent = formatRupiah(h2);
        }
    } catch (err) {
        console.error('Gagal memuat harga di halaman detail:', err);
    }
}


/* ==========================================================================
   8. LOGIKA IMAGE ZOOM / LIGHTBOX MODAL
   ========================================================================== */

function initImageZoomEvents() {
    const allImages = document.querySelectorAll(
        '.detail-image img, .room-card img, .hero-slide img, .gallery img, img.zoomable'
    );

    allImages.forEach(img => {
        img.title = "Klik untuk memperbesar gambar";
        img.addEventListener('click', (e) => {
            openImageZoom(e.target.src);
        });
    });
}

function openImageZoom(imageSrc) {
    const modal = document.getElementById('imageZoomModal');
    const zoomedImg = document.getElementById('zoomedImage');

    if (modal && zoomedImg) {
        zoomedImg.src = imageSrc;
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    }
}

function closeImageZoom() {
    const modal = document.getElementById('imageZoomModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}