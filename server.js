
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;
const archiver = require('archiver');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});
app.get('/', (req, res) => {
  res.send('Photo Share Backend is running. Use /images and /download API endpoints.');
});

app.get('/images', async (req, res) => {
  try {
    const result = await cloudinary.api.resources({ type: 'upload' });
    res.json(result.resources.map(r => r.secure_url));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/download', async (req, res) => {
  const { files } = req.body;
  if (!files || !files.length) return res.status(400).send('No files selected');
  res.attachment('photos.zip');
  const archive = archiver('zip');
  archive.pipe(res);

  for (let url of files) {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    archive.append(response.data, { name: url.split('/').pop() });
  }
  archive.finalize();
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
