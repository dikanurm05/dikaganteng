// File: api/index.js

const express = require('express');
const cors = a('cors');
const { Pool } = require('pg'); // Atau client database lain yang Anda gunakan

const app = express();

// --- KONFIGURASI CORS (SANGAT PENTING) ---
const whitelist = ['https://nama-situs-netlify-anda.netlify.app']; // Ganti dengan URL Netlify Anda nanti
const corsOptions = {
  origin: function (origin, callback) {
    // Izinkan request jika origin ada di whitelist atau jika tidak ada origin (seperti dari Postman)
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(express.json());

// Konfigurasi koneksi database (ambil dari Environment Variables)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Endpoint API Anda
app.post('/api/calculate', async (req, res) => {
    // ... Logika kalkulasi dan query database Anda ...
    // Contoh:
    try {
        const { name, gender, age } = req.body;
        // ... (logika BMR, TDEE) ...
        const bmr = 1800; // Ganti dengan hasil kalkulasi

        const sql = 'INSERT INTO calculations (name, bmr) VALUES ($1, $2)';
        await pool.query(sql, [name, bmr]);
        
        res.status(200).json({ message: "Data saved!", bmr: bmr });
    } catch (error) {
        console.error("Server error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Ekspor aplikasi Express agar Vercel bisa menggunakannya
module.exports = app;