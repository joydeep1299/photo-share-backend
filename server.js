import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();
￼

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

// List images with thumbnails
app.get('/images', async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 50;

  try {
    const result = await cloudinary.api.resources({
      max_results: 500,
      type: 'upload',
      prefix: '', // folder prefix if used
    });

    const start = page * limit;
    const end = start + limit;
    const images = result.resources.slice(start, end).map(img => ({
      thumbnail: cloudinary.url(img.public_id, { width: 150, height: 150, crop: 'fill' }),
      original: img.secure_url
    }));

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
