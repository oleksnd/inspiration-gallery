# Галерея Инспирации

Веб-приложение для создания и управления персональной галереей изображений.

## Структура

- `/backend/` — Node.js/Express-сервис, хранит изображения в `data.json`
- `/frontend/` — SPA на чистом JS, HTML, CSS

## Развертывание на Render.com

**Backend:**
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `node server.js`
- Plan: Free

**Frontend:**
- Root Directory: `frontend`
- Build Command: (пусто)
- Plan: Free

## API

- `GET /api/images` — получить список изображений
- `POST /api/images` — добавить изображение (`{src, tags: [...]}`)