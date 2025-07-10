// Impor paket yang dibutuhkan
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); // Ganti dari mysql2 ke pg
const cors = require('cors');
const serverless = require('serverless-http'); // Impor serverless-http

// Inisialisasi aplikasi Express
const app = express();
const router = express.Router(); // Gunakan Express Router

// Konfigurasi middleware
router.use(cors());
router.use(express.json());

// Membuat koneksi pool ke Neon DB (PostgreSQL)
// Ambil connection string dari environment variable
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// === API ENDPOINT UNTUK KALKULASI ===
// Gunakan router.post bukan app.post
router.post('/calculate', async (req, res) => {
    try {
        const { name, gender, age, weight, height, activity: activityFactor } = req.body;
        if (!name || !gender || !age || !weight || !height || !activityFactor) {
            return res.status(400).json({ message: 'Semua field harus diisi.' });
        }

        // Logika kalkulasi (tidak ada perubahan)
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

        // Simpan hasil ke database PostgreSQL
        // Ganti sintaks SQL: '?' menjadi '$1, $2, ...'
        const sql = `
            INSERT INTO calculations (name, gender, age, weight, height, activity_factor, bmr, tdee, ideal_weight)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `;
        const values = [name, gender, age, weight, height, activityFactor, bmr, tdee, idealWeight];
        
        await pool.query(sql, values);
        console.log(`Data untuk '${name}' berhasil disimpan ke database.`);

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

// Mount router ke path utama aplikasi
app.use('/api', router);

// Ekspor handler untuk Netlify Functions
module.exports.handler = serverless(app);