// ===== Ініціалізація =====
const addBtn = document.getElementById("add-product-btn");
const editBtn = document.getElementById("edit-product-btn");
const deleteBtn = document.getElementById("delete-product-btn");

const addFormSection = document.getElementById("add-product-form");
const editSection = document.getElementById("edit-products");
const deleteSection = document.getElementById("delete-products");

let productList = [];

// ===== Завантаження product.json =====
fetch("data/products.json")
  .then((res) => res.json())
  .then((data) => {
    productList = data;
    localStorage.setItem("products", JSON.stringify(productList));
  });

// ===== Перемикач режимів =====
addBtn.addEventListener("click", () => {
  hideAll();
  addFormSection.classList.remove("hidden");
});

editBtn.addEventListener("click", () => {
  hideAll();
  editSection.classList.remove("hidden");
  renderEditableList();
});

deleteBtn.addEventListener("click", () => {
  hideAll();
  deleteSection.classList.remove("hidden");
  renderDeletableList();
});

function hideAll() {
  addFormSection.classList.add("hidden");
  editSection.classList.add("hidden");
  deleteSection.classList.add("hidden");
}

// ===== Додавання товару =====
document.getElementById("product-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const file = form.image.files[0];

  if (!file) return alert("❗ Завантажте фото товару");

  const reader = new FileReader();
  reader.onload = () => {
    const imageData = reader.result;

    const data = Object.fromEntries(new FormData(form).entries());
    data.id = Date.now().toString();
    data.image = imageData;
    data.images = [imageData]; // одна картинка як масив
    data.isPopular = false;

    productList.push(data);
    localStorage.setItem("products", JSON.stringify(productList));
    alert("✅ Товар додано!");
    form.reset();
    renderEditableList();
  };

  reader.readAsDataURL(file);
});

// ===== Редагування товарів =====
function renderEditableList() {
  const container = editSection.querySelector(".product-list");
  container.innerHTML = "";

  productList.forEach((product) => {
    const block = document.createElement("div");
    block.className = "product-card";
    block.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <input type="text" value="${product.name}" />
      <textarea>${product.description || ""}</textarea>
      <input type="number" value="${product.price}" />
      <select>
        <option value="strawberry" ${
          product.category === "strawberry" ? "selected" : ""
        }>Полуниця</option>
        <option value="grapes" ${
          product.category === "grapes" ? "selected" : ""
        }>Виноград</option>
        <option value="raspberry" ${
          product.category === "raspberry" ? "selected" : ""
        }>Малина</option>
        <option value="currant" ${
          product.category === "currant" ? "selected" : ""
        }>Смородина</option>
        <option value="blackberry" ${
          product.category === "blackberry" ? "selected" : ""
        }>Ожина</option>
      </select>
      <label><input type="checkbox" ${
        product.isPopular ? "checked" : ""
      } /> Популярний</label>
      <button class="save-btn">💾 Зберегти</button>
    `;
    container.appendChild(block);

    block.querySelector(".save-btn").addEventListener("click", () => {
      product.name = block.querySelector("input[type=text]").value;
      product.description = block.querySelector("textarea").value;
      product.price = parseFloat(
        block.querySelector("input[type=number]").value
      );
      product.category = block.querySelector("select").value;
      product.isPopular = block.querySelector("input[type=checkbox]").checked;
      localStorage.setItem("products", JSON.stringify(productList));
      alert("✅ Збережено!");
    });
  });
}

// ===== Видалення товарів =====
function renderDeletableList() {
  const container = deleteSection.querySelector(".product-list");
  container.innerHTML = "";

  productList.forEach((product, index) => {
    const block = document.createElement("div");
    block.className = "product-card";
    block.innerHTML = `
      <img src="${product.image}" alt="${product.name}" />
      <h4>${product.name}</h4>
      <button class="delete-btn">🗑️ Видалити</button>
    `;
    container.appendChild(block);

    block.querySelector(".delete-btn").addEventListener("click", () => {
      productList.splice(index, 1);
      localStorage.setItem("products", JSON.stringify(productList));
      renderDeletableList();
    });
  });
}

// ===== Експорт JSON-файлу =====
function downloadJSON(data, filename = "products.json") {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
window.downloadJSON = downloadJSON;
