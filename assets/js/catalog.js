import { updateCartCount } from "./cart-utils.js";
document.addEventListener("DOMContentLoaded", () => {
  // ===== Вставка хедера =====
  fetch("components/header-default.html")
    .then((res) => res.text())
    .then((html) => {
      document.querySelector("body").insertAdjacentHTML("afterbegin", html);
      updateCartCount();
    });

  // ===== Вставка футера =====
  fetch("components/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.querySelector("body").insertAdjacentHTML("beforeend", html);
    });

  // ===== Вставка категорій =====
  fetch("components/category-grid.html")
    .then((res) => res.text())
    .then((html) => {
      const categoryContainer = document.querySelector(".category-grid");
      if (categoryContainer) {
        categoryContainer.innerHTML = html;
      }
    });

  // ===== Завантаження товарів =====
  const urlParams = new URLSearchParams(window.location.search);
  const selectedCategory = urlParams.get("category");
  const title = document.querySelector(".active-category-title");
  const grid = document.querySelector(".catalog-grid");
  const showAllBtn = document.getElementById("show-all");

  fetch("data/products.json")
    .then((res) => res.json())
    .then((products) => {
      if (!grid) return;

      const filtered =
        selectedCategory && selectedCategory !== "all"
          ? products.filter((p) => p.category === selectedCategory)
          : products;

      renderProducts(filtered);

      // Заголовок категорії
      if (selectedCategory && selectedCategory !== "all") {
        title.textContent = getCategoryName(selectedCategory);
        showAllBtn.style.display = "inline-block";
      } else {
        title.textContent = "Всі товари";
      }

      // Кнопка “Показати всі”
      showAllBtn.addEventListener("click", () => {
        renderProducts(products);
        title.textContent = "Всі товари";
        showAllBtn.style.display = "none";
        history.replaceState(null, "", "catalog.html?category=all");
      });
    });

  // ===== Рендер карток товарів =====
  function renderProducts(list) {
    grid.innerHTML = "";
    list.forEach((product) => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <div class="price">${product.price} грн</div>
        <a href="product.html?id=${product.id}" class="more-btn">Дізнатися більше</a>
      `;
      grid.appendChild(card);
    });
  }

  // ===== Назви категорій для заголовка =====
  function getCategoryName(key) {
    const map = {
      strawberry: "Полуниця",
      grapes: "Виноград",
      raspberry: "Малина",
      currant: "Смородина",
      blackberry: "Ожина",
    };
    return map[key] || "Товари";
  }
});
