import { updateCartCount } from "./cart-utils.js";
document.addEventListener("DOMContentLoaded", () => {
  const isHomePage =
    location.pathname.endsWith("index.html") || location.pathname === "/";
  const headerPath = isHomePage
    ? "components/header-home.html"
    : "components/header-default.html";

  // ===== Вставка хедера =====
  fetch(headerPath)
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("afterbegin", html);
      updateCartCount();

      const burger = document.querySelector(".burger");
      const nav = document.querySelector(".header-nav");
      const overlay = document.createElement("div");
      overlay.className = "overlay";
      document.body.prepend(overlay);

      burger.addEventListener("click", () => {
        nav.classList.toggle("open");
        overlay.classList.toggle("active");
        burger.classList.toggle("open");
      });

      overlay.addEventListener("click", () => {
        nav.classList.remove("open");
        overlay.classList.remove("active");
        burger.classList.remove("open");
      });
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

  // ===== Вставка популярних товарів =====
  fetch("data/products.json")
    .then((res) => res.json())
    .then((products) => {
      const popular = products.filter((p) => p.isPopular);
      const container = document.querySelector(".catalog-grid");
      if (!container) return;

      popular.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${product.image}" alt="${product.name}" />
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="price">${product.price} грн</div>
        `;
        container.appendChild(card);
      });
      startAutoScroll(container);
      // ===== Плавний автоскрол =====
      function startAutoScroll(target, speed = 1) {
        let scrollPos = target.scrollLeft;

        function step() {
          scrollPos += speed;
          target.scrollLeft = scrollPos;

          if (scrollPos >= target.scrollWidth - target.clientWidth) {
            scrollPos = 0;
          }

          requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
      }

      startAutoScroll(container);
    });

  // ===== Вставка футера =====
  fetch("components/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.querySelector(".site-footer").outerHTML = html;
    });
});
