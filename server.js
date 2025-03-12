/* ---------------------
   Backend (Express + PostgreSQL)
   --------------------- */

// Install dependencies: express, pg, cors, body-parser
// npm install express pg cors body-parser dotenv

const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// Allow requests from your frontend URL
app.use(cors({
  origin: "https://blog-frontend1-gm2g.onrender.com",  // Replace with your actual frontend URL
  methods: "GET,POST",  // Allow specific methods
  allowedHeaders: "Content-Type"  // Allow specific headers
}));

app.use(bodyParser.json());

// PostgreSQL Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes("render.com") ? { rejectUnauthorized: false } : false,
});

// Create Table (Run this once in psql or a DB client)
// CREATE TABLE posts (id SERIAL PRIMARY KEY, title VARCHAR(255), content TEXT);

// API Routes
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM posts ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/posts', async (req, res) => {
  try {
    const { title, content } = req.body;
    const result = await pool.query(
      'INSERT INTO posts (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});