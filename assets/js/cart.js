import { updateCartCount } from "./cart-utils.js";

document.addEventListener("DOMContentLoaded", () => {
  // ===== Вставка хедера з окремого HTML-файлу =====
  fetch("components/header-default.html")
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("afterbegin", html);
      updateCartCount(); // Оновлення лічильника товарів у хедері
    });

  // ===== Вставка футера =====
  fetch("components/footer.html")
    .then((res) => res.text())
    .then((html) => {
      document.body.insertAdjacentHTML("beforeend", html);
    });

  // ===== DOM-елементи =====
  const container = document.querySelector(".cart-items");
  const totalEl = document.getElementById("cart-total");

  // ===== Рендер кошика =====
  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    container.innerHTML = "";
    let total = 0;

    // Створення карток товарів
    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const card = document.createElement("div");
      card.className = "cart-item";
      card.setAttribute("data-index", index);
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>${item.description || ""}</p>
          <div class="quantity-control">
            <button class="decrease" data-index="${index}">–</button>
            <span>${item.quantity}</span>
            <button class="increase" data-index="${index}">+</button>
          </div>
          <p>Ціна: ${item.price} грн</p>
          <p>Сума: ${item.price * item.quantity} грн</p>
        </div>
        <button class="remove-btn" data-index="${index}">&times;</button>
      `;
      container.appendChild(card);
    });

    totalEl.textContent = `${total} грн`;
    updateCartCount();
    renderSummary(); // Оновлення блоку “Ваше замовлення”

    // ===== Видалення товару з анімацією =====
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        const itemEl = btn.closest(".cart-item");
        itemEl.classList.add("fade-out"); // Анімація зникнення
        setTimeout(() => {
          cart.splice(index, 1);
          localStorage.setItem("cart", JSON.stringify(cart));
          renderCart(); // Повторний рендер після видалення
        }, 300);
      });
    });

    // ===== Збільшення кількості товару =====
    document.querySelectorAll(".increase").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        cart[index].quantity += 1;
        localStorage.setItem("cart", JSON.stringify(cart));
        renderCart();
      });
    });

    // ===== Зменшення кількості товару =====
    document.querySelectorAll(".decrease").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        if (cart[index].quantity > 1) {
          cart[index].quantity -= 1;
          localStorage.setItem("cart", JSON.stringify(cart));
          renderCart();
        }
      });
    });
  }

  // ===== Рендер блоку “Ваше замовлення” (aside) =====
  function renderSummary() {
    const summaryContainer = document.querySelector(".summary-items");
    const summaryTotal = document.getElementById("summary-total");
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    summaryContainer.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      total += item.price * item.quantity;

      const block = document.createElement("div");
      block.className = "item";
      block.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="item-info">
          <div>${item.name}</div>
          <small>${item.quantity} × ${item.price} грн</small>
        </div>
      `;
      summaryContainer.appendChild(block);
    });

    summaryTotal.textContent = `${total} грн`;
  }

  // ===== Ініціалізація кошика при завантаженні =====
  renderCart();

  // ===== Відкриття форми оформлення замовлення =====
  document.getElementById("checkout-btn").addEventListener("click", () => {
    document.querySelector(".checkout-form").classList.remove("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // ===== Динамічне заповнення форми доставки =====

  // const deliveryData = {
  //   "nova-poshta": {
  //     regions: {
  //       Київська: ["Боярка", "Вишневе"],
  //       Львівська: ["Львів", "Дрогобич"],
  //     },
  //     offices: {
  //       Боярка: ["Відділення №1", "Відділення №2"],
  //       Вишневе: ["Відділення №1"],
  //       Львів: ["Відділення №1", "Поштомат №3"],
  //       Дрогобич: ["Відділення №1"],
  //     },
  //   },
  //   "ukr-poshta": {
  //     regions: {
  //       Київська: ["Боярка", "Фастів"],
  //       Львівська: ["Львів", "Самбір"],
  //     },
  //     offices: {
  //       Боярка: ["Відділення 101", "Поштомат 102"],
  //       Фастів: ["Відділення 103"],
  //       Львів: ["Відділення 104"],
  //       Самбір: ["Відділення 105"],
  //     },
  //   },
  // };
  const NP_API_KEY = "ab9b947cee41978ddd4facd307160b07";
  const form = document.getElementById("order-form");

  async function fetchRegions() {
    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiLey: NP_API_KEY,
        modelName: "Address",
        calledMethod: "getAreas",
      }),
    });
    const data = await res.json();
    return data.data.map((area) => area.Description);
  }
  async function fetchCities(areaName) {
    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: NP_API_KEY,
        modelName: "Address",
        calledMethod: "getCities",
      }),
    });
    const data = await res.json();
    return data.data
      .filter((city) => city.AreaDescription === areaName)
      .map((city) => city.Description);
  }
  async function fetchWarehouses(cityName) {
    const res = await fetch("https://api.novaposhta.ua/v2.0/json/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apiKey: NP_API_KEY,
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: { CityName: cityName },
      }),
    });
    const data = await res.json();
    return data.data.map((w) => w.Description);
  }

  // ===== Заповнення областей при виборі служби доставки =====
  form.delivery.addEventListener("change", async () => {
    if (form.delivery.value === "nova-poshta") {
      const regions = await fetchRegions();
      form.region.innerHTML = `<option value="">Оберіть область</option>`;
      regions.forEach((region) => {
        const opt = document.createElement("option");
        opt.value = region;
        opt.textContent = region;
        form.region.appendChild(opt);
      });
      form.city.innerHTML = `<option value="">Оберіть населений пункт</option>`;
      form.office.innerHTML = `<option value="">Оберіть відділення</option>`;
    }
  });

  // ===== Заповнення міст при виборі області =====
  form.region.addEventListener("change", async () => {
    const cities = await fetchCities(form.region.value);
    form.city.innerHTML = `<option value="">Оберіть населений пункт</option>`;
    cities.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      form.city.appendChild(opt);
    });

    form.office.innerHTML = `<option value="">Оберіть відділення</option>`;
  });

  // ===== Заповнення відділень при виборі міста =====
  form.city.addEventListener("change", async () => {
    const offices = await fetchWarehouses(form.city.value);
    form.office.innerHTML = `<option value="">Оберіть відділення</option>`;
    offices.forEach((office) => {
      const opt = document.createElement("option");
      opt.value = office;
      opt.textContent = office;
      form.office.appendChild(opt);
    });
  });

  // ===== Обробка форми замовлення =====
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    console.log("Замовлення:", { ...data, cart });

    alert("✅ Замовлення оформлено!");
    localStorage.removeItem("cart");
    updateCartCount();
    renderCart();
    renderSummary();
    window.location.href = "index.html"; // Повернення на головну
  });
});
