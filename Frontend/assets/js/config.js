/**
 * @file config.js
 * @description Pusat Konfigurasi Global Frontend
 * Menyimpan URL Server Backend & Endpoint API untuk digunakan di seluruh skrip frontend.
 */

const CONFIG = {
  // Base URL Server API Backend (Node.js/Express)
  BASE_URL: 'http://localhost:5000/api',

  // Daftar Endpoint Spesifik
  ENDPOINTS: {
    // Endpoint Kamar
    GET_ALL_ROOMS: '/rooms',                  // GET /api/rooms
    GET_ROOM_BY_ID: (id) => `/rooms/${id}`,   // GET /api/rooms/:id
    UPDATE_ROOM_STATUS: (id) => `/rooms/${id}`, // PATCH /api/rooms/:id/status

    // Endpoint Kontak & Pesan
    SEND_CONTACT: '/contact',                 // POST /api/contact
  },

  // Nomor WhatsApp Admin Kost (Format Internasional tanpa tanda +)
  ADMIN_WA_NUMBER: '6281234567890',
};

// Mencegah perubahan tidak sengaja pada objek CONFIG di runtime frontend
Object.freeze(CONFIG);