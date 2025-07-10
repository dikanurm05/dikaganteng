// Impor package yang dibutuhkan
require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

// Inisialisasi aplikasi Express
const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Membuat koneksi pool ke MySQL
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
}).promise();

// === API ENDPOINT UNTUK KALKULASI ===
app.post('/api/calculate', async (req, res) => {
    try {
        // 1. Ambil data dari body request (TERMASUK NAMA)
        const { name, gender, age, weight, height, activity: activityFactor } = req.body;

        // 2. Validasi sederhana di server
        if (!name || !gender || !age || !weight || !height || !activityFactor) {
            return res.status(400).json({ message: 'Semua field harus diisi.' });
        }

        // 3. Logika kalkulasi (tidak berubah)
        let bmr = 0;
        let idealWeight = 0;

        if (gender === 'male') {
            bmr = 66 + (13.7 * weight) + (5 * height) - (6.8 * age);
            idealWeight = (height - 100) * 0.9;
        } else {
            bmr = 655 + (9.6 * weight) + (1.8 * height) - (4.7 * age);
            idealWeight = (height - 100) * 0.85;
        }

        const tdee = bmr * activityFactor;

        // 4. Simpan hasil ke database MySQL (DENGAN NAMA)
        const sql = `
            INSERT INTO calculations (name, gender, age, weight, height, activity_factor, bmr, tdee, ideal_weight)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [name, gender, age, weight, height, activityFactor, bmr, tdee, idealWeight];

        await db.query(sql, values);
        console.log(`Data untuk '${name}' berhasil disimpan ke database.`);

        // 5. Kirim hasil kembali ke frontend (tidak berubah)
        res.status(200).json({
            bmr: Math.round(bmr),
            tdee: Math.round(tdee),
            idealWeight: idealWeight.toFixed(1)
        });

    } catch (error) {
        console.error('Terjadi kesalahan di server:', error);
        res.status(500).json({ message: 'Terjadi kesalahan di server.' });
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});