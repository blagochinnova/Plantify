import { updateCartCount } from "./cart-utils.js";
document.addEventListener("DOMContentLoaded", () => {
  // ===== Вставка хедера =====
  fetch("components/header-default.html")
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("afterbegin", html);
      updateCartCount();
    });

  // ===== Вставка футера =====
  fetch("components/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
    });

  // ===== Отримання ID товару з URL =====
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  if (!productId) return;

  // ===== Завантаження товару =====
  fetch("data/products.json")
    .then((res) => res.json())
    .then((products) => {
      const product = products.find((p) => p.id === productId);
      if (!product) return;

      // ===== Вставка основної інформації =====
      document.getElementById("product-title").textContent = product.name;
      document.getElementById("product-state").textContent =
        product.description;
      document.getElementById(
        "product-price"
      ).textContent = `${product.price} грн`;
      document.getElementById("product-description").textContent =
        product.description;
      document.getElementById("product-image").src = product.image;
      document.getElementById("product-image").alt = product.name;

      // ===== Карусель зображень =====
      let currentIndex = 0;

      function updateMainImage(images) {
        document.getElementById("product-image").src = images[currentIndex];
      }

      function renderCarousel(images) {
        const thumbsContainer = document.querySelector(".carousel-thumbs");
        thumbsContainer.innerHTML = "";

        images.forEach((src, i) => {
          const thumb = document.createElement("img");
          thumb.src = src;
          thumb.className = "carousel-thumb";
          if (i === currentIndex) thumb.classList.add("active");
          thumb.addEventListener("click", () => {
            currentIndex = i;
            updateMainImage(images);
            renderCarousel(images);
          });
          thumbsContainer.appendChild(thumb);
        });

        document.querySelector(".carousel-prev").onclick = () => {
          currentIndex = (currentIndex - 1 + images.length) % images.length;
          updateMainImage(images);
          renderCarousel(images);
        };

        document.querySelector(".carousel-next").onclick = () => {
          currentIndex = (currentIndex + 1) % images.length;
          updateMainImage(images);
          renderCarousel(images);
        };
      }

      updateMainImage(product.images);
      renderCarousel(product.images);

      // ===== Кількість товару =====
      let quantity = 1;
      const quantityDisplay = document.getElementById("quantity");

      document.getElementById("increase").addEventListener("click", () => {
        quantity++;
        quantityDisplay.textContent = quantity;
      });

      document.getElementById("decrease").addEventListener("click", () => {
        if (quantity > 1) {
          quantity--;
          quantityDisplay.textContent = quantity;
        }
      });

      // ===== Додавання в кошик =====
      document.getElementById("add-to-cart").addEventListener("click", () => {
        quantity = parseInt(quantity, 10);
        const cart = JSON.parse(localStorage.getItem("cart")) || [];

        const existing = cart.find((item) => item.id === product.id);
        if (existing) {
          existing.quantity += quantity;
        } else {
          cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: quantity,
          });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        document.getElementById("cart-modal").classList.remove("hidden");
      });

      // ===== Модальні кнопки =====
      document.getElementById("go-catalog").addEventListener("click", () => {
        window.location.href = "catalog.html";
      });

      document.getElementById("go-checkout").addEventListener("click", () => {
        window.location.href = "cart.html";
      });
    });
});
