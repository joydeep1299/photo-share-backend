require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Configure Cloudinary ---
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// --- Health check route ---
app.get('/', (req, res) => {
  res.send('Photo Share backend is running.');
});

// --- Upload route (optional if uploading directly to Cloudinary from frontend) ---
app.post('/upload', async (req, res) => {
  // If frontend uploads directly to Cloudinary, you may not need this
  res.status(200).json({ message: 'Frontend uploads directly to Cloudinary' });
});

// --- Fetch images with pagination ---
app.get('/images', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 50;

    // Fetch all uploaded resources (max 500 at once)
    const result = await cloudinary.api.resources({ type: 'upload', max_results: 500 });
    
    // Slice based on pagination
    const start = page * limit;
    const paginated = result.resources
      .slice(start, start + limit)
      .map(r => r.secure_url);

    res.json(paginated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// --- Optional route if you ever want server-side ZIP download ---
app.post('/download', async (req, res) => {
  // Not needed for direct frontend downloads
  res.status(200).json({ message: 'Frontend handles direct download' });
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
