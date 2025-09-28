export function updateCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const total = cart.reduce((sum, item) => {
    const qty = parseInt(item.quantity, 10);
    return sum + (isNaN(qty) ? 0 : qty);
  }, 0);

  const countEl = document.getElementById("cart-count");
  if (countEl) countEl.textContent = total;
}
