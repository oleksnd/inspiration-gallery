const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Получить все изображения
app.get('/api/images', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err && err.code !== 'ENOENT') {
      return res.status(500).json({ error: 'Ошибка чтения данных' });
    }
    let images = [];
    if (data) {
      try {
        images = JSON.parse(data);
      } catch (e) {
        return res.status(500).json({ error: 'Ошибка парсинга данных' });
      }
    }
    res.status(200).json(images);
  });
});

// Добавить новое изображение
app.post('/api/images', (req, res) => {
  const { src, tags } = req.body;
  if (!src || !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Некорректные данные' });
  }

  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    let images = [];
    if (!err && data) {
      try {
        images = JSON.parse(data);
      } catch (e) {
        return res.status(500).json({ error: 'Ошибка парсинга данных' });
      }
    }
    const newImage = {
      id: Date.now(),
      src,
      tags
    };
    images.unshift(newImage);
    fs.writeFile(DATA_FILE, JSON.stringify(images, null, 2), (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка записи данных' });
      }
      res.status(201).json(newImage);
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});