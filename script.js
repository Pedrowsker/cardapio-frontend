const API = "https://cardapio-backend-cytu.onrender.com";
const ADMIN_KEY = new URLSearchParams(window.location.search).get("admin");

// ELEMENTOS
const cat = document.getElementById("cat");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("desc");
const priceInput = document.getElementById("price");
const categorySelect = document.getElementById("category");
const menuDiv = document.getElementById("menu");

/* ---------- FORMATAÇÃO DO PREÇO ---------- */
if (priceInput) {
  priceInput.addEventListener("input", () => {
    let value = priceInput.value.replace(/\D/g, "");
    if (!value) return (priceInput.value = "");
    value = (Number(value) / 100).toFixed(2);
    priceInput.value = value.replace(".", ",");
  });
}

/* ---------- CARREGAR MENU ---------- */
async function loadMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    render(data);
  } catch {
    console.error("Erro ao carregar menu");
  }
}

/* ---------- RENDER ---------- */
function render(data) {
  const menu = document.getElementById("menu");
  if (!menu) return;

  menu.innerHTML = "";

  const categories = data.categories || [];
  const products = data.products || [];

  categories.forEach(c => {
    const card = document.createElement("div");
    card.className = "category-card";

    const header = document.createElement("div");
    header.className = "category-header";
    header.textContent = c.name;

    const productsDiv = document.createElement("div");
    productsDiv.className = "products";

    const relatedProducts = products.filter(p => Number(p.category_id) === Number(c.id));

    if (relatedProducts.length === 0) {
      productsDiv.innerHTML = `<div class="product">Nenhum produto</div>`;
    } else {
      relatedProducts.forEach(p => {
        const prod = document.createElement("div");
        prod.className = "product";
        prod.innerHTML = `
          <b>${p.name}</b><br>
          ${p.description || ""}<br>
          R$ ${Number(p.price).toFixed(2).replace(".", ",")}
        `;
        productsDiv.appendChild(prod);
      });
    }

    header.addEventListener("click", () => {
      const open = card.classList.contains("open");
      document.querySelectorAll(".products").forEach(el => el.style.height = "0px");
      document.querySelectorAll(".category-card").forEach(el => el.classList.remove("open"));

      if (!open) {
        card.classList.add("open");
        productsDiv.style.height = productsDiv.scrollHeight + "px";
      }
    });

    card.appendChild(header);
    card.appendChild(productsDiv);
    menu.appendChild(card);
  });

  if (categorySelect) {
    categorySelect.innerHTML = `
      <option value="">Selecione uma categoria</option>
      ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("")}
    `;
  }
}




/* ---------- ADICIONAR CATEGORIA ---------- */
async function addCategory() {
  if (!cat.value.trim()) return alert("Digite o nome da categoria");

  await fetch(`${API}/category?admin=${ADMIN_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: cat.value })
  });

  cat.value = "";
  loadMenu();
}

/* ---------- ADICIONAR PRODUTO ---------- */
async function addProduct() {
  if (!nameInput.value || !priceInput.value || !categorySelect.value)
    return alert("Preencha os campos obrigatórios");

  const formattedPrice = Number(priceInput.value.replace(",", "."));

  await fetch(`${API}/product?admin=${ADMIN_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput.value,
      description: descInput.value,
      price: formattedPrice,
      category_id: Number(categorySelect.value)
    })
  });

  nameInput.value = "";
  descInput.value = "";
  priceInput.value = "";
  categorySelect.value = "";

  loadMenu();
}

/* ---------- EXCLUIR PRODUTO ---------- */
async function deleteProduct(id) {
  if (!confirm("Excluir este produto?")) return;

  await fetch(`${API}/product/${id}?admin=${ADMIN_KEY}`, {
    method: "DELETE"
  });

  loadMenu();
}

/* ---------- EXCLUIR CATEGORIA ---------- */
async function deleteCategory(id) {
  if (!confirm("Excluir esta categoria e seus produtos?")) return;

  await fetch(`${API}/category/${id}?admin=${ADMIN_KEY}`, {
    method: "DELETE"
  });

  loadMenu();
}

/* ---------- INIT ---------- */
loadMenu();

// atualiza o cardápio automaticamente a cada 5 segundos
setInterval(loadMenu, 5000);
