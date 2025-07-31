// --- КОНФИГУРАЦИЯ ---
// Убедитесь, что здесь указан URL вашего бэкенда (Web Service) на Render
// Он должен выглядеть примерно так: https://НАЗВАНИЕ-БЭКЕНДА.onrender.com
const API_BASE_URL = "https://inspiration-gallery.onrender.com"; // <-- ЗАМЕНИТЕ НА СВОЙ URL БЭКЕНДА

// --- ЭЛЕМЕНТЫ DOM ---
const galleryElem = document.getElementById('gallery' );
const filtersElem = document.getElementById('tagFilters');
const searchInput = document.getElementById('search');
const addImageBtn = document.getElementById('addImageBtn');
const modalElem = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const addImageForm = document.getElementById('addImageForm');
const imageUrlInput = document.getElementById('imageUrl');
const imageTagsInput = document.getElementById('imageTags');

// --- СОСТОЯНИЕ ПРИЛОЖЕНИЯ ---
let allImages = []; // Все изображения, загруженные с сервера
let activeTag = "Все";
let searchQuery = "";

// --- ФУНКЦИИ ОТОБРАЖЕНИЯ (UI) ---
function showLoading(msg = "Загрузка...") {
  galleryElem.innerHTML = `<div class="loading">${msg}</div>`;
}

function showError(msg) {
  galleryElem.innerHTML = `<div class="error" style="color:crimson;text-align:center;">${msg}</div>`;
}

// --- ОСНОВНЫЕ ФУНКЦИИ ---

// Получение данных с сервера с использованием async/await
async function fetchImages() {
  showLoading("Загружаем галерею...");
  try {
    const response = await fetch(`${API_BASE_URL}/api/images`);
    
    // Проверяем, что ответ от сервера успешный (статус 200-299)
    if (!response.ok) {
      // Если сервер "спит", он может вернуть 502/503 ошибку
      if (response.status === 502 || response.status === 503) {
          throw new Error("Сервер просыпается... Пожалуйста, подождите 30 секунд и обновите страницу.");
      }
      throw new Error(`Ошибка сервера: ${response.statusText}`);
    }
    
    const data = await response.json();
    allImages = Array.isArray(data) ? data : [];
    renderApp();
  } catch (error) {
    // error.message теперь содержит более осмысленное сообщение
    showError(`Не удалось загрузить изображения.  
${error.message}`);
  }
}

function renderFilters() {
  const tags = [...new Set(allImages.flatMap(img => img.tags))].sort();
  filtersElem.innerHTML = '';
  
  // Функция для создания кнопок, чтобы избежать дублирования кода
  const createButton = (tag) => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.classList.toggle('active', activeTag === tag);
    btn.onclick = () => {
      activeTag = tag;
      renderApp(); // Одна функция для перерисовки всего
    };
    filtersElem.appendChild(btn);
  };

  createButton("Все");
  tags.forEach(createButton);
}

function renderGallery() {
  let filteredImages = allImages;

  // Фильтрация по активному тегу
  if (activeTag !== "Все") {
    filteredImages = filteredImages.filter(img => img.tags.includes(activeTag));
  }

  // Фильтрация по поисковому запросу
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredImages = filteredImages.filter(img => 
      img.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  if (!filteredImages.length) {
    galleryElem.innerHTML = `<div style="text-align:center;color:#777;padding:32px 0;">Нет изображений по выбранным условиям</div>`;
    return;
  }

  galleryElem.innerHTML = filteredImages.map(img => `
    <div class="item">
      <img 
        src="${img.src}" 
        alt="Теги: ${img.tags.join(', ')}" 
        loading="lazy" 
        onerror="this.parentElement.style.display='none'"
      >
      <div class="tags">
        ${img.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// Функция, которая перерисовывает все приложение целиком
function renderApp() {
    renderFilters();
    renderGallery();
}

// --- ОБРАБОТЧИКИ СОБЫТИЙ ---

// Модальное окно
addImageBtn.onclick = () => modalElem.classList.remove('hidden');
closeModalBtn.onclick = () => modalElem.classList.add('hidden');
modalElem.onclick = (e) => {
  if (e.target === modalElem) modalElem.classList.add('hidden');
};

// Форма добавления (тоже с async/await для чистоты кода)
addImageForm.onsubmit = async function (e) {
  e.preventDefault();
  const src = imageUrlInput.value.trim();
  const tags = imageTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
  
  if (!src || !tags.length) {
      alert("Пожалуйста, укажите ссылку на картинку и хотя бы один тег.");
      return;
  }

  const submitButton = addImageForm.querySelector('button[type=submit]');
  submitButton.disabled = true;
  submitButton.textContent = "Добавляем...";

  try {
    const response = await fetch(`${API_BASE_URL}/api/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ src, tags })
    });

    if (!response.ok) {
      throw new Error('Ошибка ответа сервера при добавлении.');
    }

    const newImage = await response.json();
    allImages.unshift(newImage); // Добавляем новую картинку в начало массива
    renderApp(); // Перерисовываем всё
    modalElem.classList.add('hidden');
    addImageForm.reset();
  } catch (error) {
    alert("Ошибка добавления изображения! Проверьте консоль (F12).");
    console.error(error);
  } finally {
    // Возвращаем кнопку в исходное состояние в любом случае
    submitButton.disabled = false;
    submitButton.textContent = "Добавить";
  }
};

// Поиск
searchInput.oninput = function () {
  searchQuery = this.value;
  renderGallery();
};

// --- ЗАПУСК ПРИЛОЖЕНИЯ ---
// Когда HTML-документ полностью загружен, начинаем загрузку изображений
window.onload = fetchImages;
