const API_BASE_URL = "https://your-backend-on-render.com"; // ← укажите свой URL после деплоя!

const galleryElem = document.getElementById('gallery');
const filtersElem = document.getElementById('tagFilters');
const searchElem = document.getElementById('search');
const addImageBtn = document.getElementById('addImageBtn');
const modalElem = document.getElementById('modal');
const closeModalBtn = document.getElementById('closeModal');
const addImageForm = document.getElementById('addImageForm');
const imageUrlInput = document.getElementById('imageUrl');
const imageTagsInput = document.getElementById('imageTags');

let images = [];
let activeTag = "Все";
let searchQuery = "";

function showLoading(msg = "Загрузка...") {
  galleryElem.innerHTML = `<div class="loading">${msg}</div>`;
}

function showError(msg) {
  galleryElem.innerHTML = `<div class="error" style="color:crimson;text-align:center;">${msg}</div>`;
}

function fetchImages() {
  showLoading();
  fetch(`${API_BASE_URL}/api/images`)
    .then(r => r.json())
    .then(data => {
      images = Array.isArray(data) ? data : [];
      renderFilters();
      renderGallery();
    })
    .catch(() => {
      showError("Не удалось загрузить изображения.<br>Возможно, сервер \"спит\" или недоступен.");
    });
}

function renderFilters() {
  const tags = [...new Set(images.flatMap(img => img.tags))].sort();
  filtersElem.innerHTML = '';
  const allBtn = document.createElement('button');
  allBtn.textContent = "Все";
  allBtn.classList.toggle('active', activeTag === "Все");
  allBtn.onclick = () => { activeTag = "Все"; renderGallery(); renderFilters(); };
  filtersElem.appendChild(allBtn);

  tags.forEach(tag => {
    const btn = document.createElement('button');
    btn.textContent = tag;
    btn.classList.toggle('active', activeTag === tag);
    btn.onclick = () => { activeTag = tag; renderGallery(); renderFilters(); };
    filtersElem.appendChild(btn);
  });
}

function renderGallery() {
  let filtered = images;
  if (activeTag !== "Все") {
    filtered = filtered.filter(img => img.tags.includes(activeTag));
  }
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filtered = filtered.filter(img => img.tags.some(tag => tag.toLowerCase().includes(q)));
  }

  if (!filtered.length) {
    galleryElem.innerHTML = `<div style="text-align:center;color:#777;padding:32px 0;">Нет изображений по выбранным условиям</div>`;
    return;
  }
  galleryElem.innerHTML = filtered.map(img => `
    <div class="item">
      <img src="${img.src}" alt="img" loading="lazy" onerror="this.src='https://via.placeholder.com/200?text=No+Image';">
      <div class="tags">
        ${img.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

// Модальное окно
addImageBtn.onclick = () => { modalElem.classList.remove('hidden'); };
closeModalBtn.onclick = () => { modalElem.classList.add('hidden'); };
modalElem.onclick = (e) => {
  if (e.target === modalElem) modalElem.classList.add('hidden');
};

// Форма добавления
addImageForm.onsubmit = function (e) {
  e.preventDefault();
  const src = imageUrlInput.value.trim();
  const tags = imageTagsInput.value.split(',').map(t => t.trim()).filter(Boolean);
  if (!src || !tags.length) return;

  addImageForm.querySelector('button[type=submit]').disabled = true;
  fetch(`${API_BASE_URL}/api/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ src, tags })
  })
    .then(r => r.json())
    .then(data => {
      images.unshift(data);
      renderFilters();
      renderGallery();
      modalElem.classList.add('hidden');
      addImageForm.reset();
    })
    .catch(() => alert("Ошибка добавления изображения!"))
    .finally(() => {
      addImageForm.querySelector('button[type=submit]').disabled = false;
    });
};

searchElem.oninput = function () {
  searchQuery = this.value;
  renderGallery();
};

window.onload = fetchImages;