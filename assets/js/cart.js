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

  // ===== Вивід товарів у кошику =====
  const container = document.querySelector(".cart-items");
  const totalEl = document.getElementById("cart-total");

  function renderCart() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    container.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
      total += item.price * item.quantity;

      const card = document.createElement("div");
      card.className = "cart-item";
      card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" />
        <div class="cart-info">
          <h4>${item.name}</h4>
          <p>Кількість: ${item.quantity}</p>
          <p>Ціна: ${item.price} грн</p>
          <p>Сума: ${item.price * item.quantity} грн</p>
          <button class="remove-btn" data-index="${index}">🗑️ Видалити</button>
        </div>
      `;
      container.appendChild(card);
    });

    totalEl.textContent = `${total} грн`;

    // ===== Обробка кнопок “Видалити” =====
    document.querySelectorAll(".remove-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const index = parseInt(btn.dataset.index, 10);
        cart.splice(index, 1);
        localStorage.setItem("cart", JSON.stringify(cart));
        updateCartCount();
        renderCart();
        renderSummary();
      });
    });
  }

  // ===== Підсумковий блок “Ваше замовлення” =====
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

  renderCart();
  renderSummary();

  // ===== Відкриття форми замовлення =====
  document.getElementById("checkout-btn").addEventListener("click", () => {
    document.querySelector(".checkout-form").classList.remove("hidden");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  });

  // ===== Форма замовлення =====
  const form = document.getElementById("order-form");

  const deliveryData = {
    "nova-poshta": {
      regions: {
        Київська: ["Боярка", "Вишневе"],
        Львівська: ["Львів", "Дрогобич"],
      },
      offices: {
        Боярка: ["Відділення №1", "Відділення №2"],
        Вишневе: ["Відділення №1"],
        Львів: ["Відділення №1", "Поштомат №3"],
        Дрогобич: ["Відділення №1"],
      },
    },
    "ukr-poshta": {
      regions: {
        Київська: ["Боярка", "Фастів"],
        Львівська: ["Львів", "Самбір"],
      },
      offices: {
        Боярка: ["Відділення 101", "Поштомат 102"],
        Фастів: ["Відділення 103"],
        Львів: ["Відділення 104"],
        Самбір: ["Відділення 105"],
      },
    },
  };

  form.delivery.addEventListener("change", () => {
    const method = form.delivery.value;
    const regions = Object.keys(deliveryData[method].regions);

    form.region.innerHTML = `<option value="">Оберіть область</option>`;
    regions.forEach((region) => {
      const opt = document.createElement("option");
      opt.value = region;
      opt.textContent = region;
      form.region.appendChild(opt);
    });

    form.city.innerHTML = `<option value="">Оберіть населений пункт</option>`;
    form.office.innerHTML = `<option value="">Оберіть відділення</option>`;
  });

  form.region.addEventListener("change", () => {
    const method = form.delivery.value;
    const cities = deliveryData[method].regions[form.region.value];

    form.city.innerHTML = `<option value="">Оберіть населений пункт</option>`;
    cities.forEach((city) => {
      const opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      form.city.appendChild(opt);
    });

    form.office.innerHTML = `<option value="">Оберіть відділення</option>`;
  });

  form.city.addEventListener("change", () => {
    const method = form.delivery.value;
    const offices = deliveryData[method].offices[form.city.value];

    form.office.innerHTML = `<option value="">Оберіть відділення</option>`;
    offices.forEach((office) => {
      const opt = document.createElement("option");
      opt.value = office;
      opt.textContent = office;
      form.office.appendChild(opt);
    });
  });

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
    window.location.href = "index.html";
  });
});
