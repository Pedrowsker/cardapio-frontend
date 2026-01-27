const API = "https://cardapio-backend-cytu.onrender.com";
const ADMIN_KEY = new URLSearchParams(window.location.search).get("admin");

// ELEMENTOS DO ADMIN
const cat = document.getElementById("cat");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("desc");
const priceInput = document.getElementById("price");
const categorySelect = document.getElementById("category");

// ---------- FORMATAÇÃO DO PREÇO ----------
if (priceInput) {
  priceInput.addEventListener("input", () => {
    let value = priceInput.value.replace(/\D/g, "");
    if (!value) {
      priceInput.value = "";
      return;
    }
    value = (Number(value) / 100).toFixed(2);
    priceInput.value = value.replace(".", ",");
  });
}

// ---------- CARREGAR MENU ----------
async function loadMenu() {
  try {
    const res = await fetch(`${API}/menu`);
    if (!res.ok) throw new Error("Erro ao carregar");
    const data = await res.json();
    render(data);
  } catch (error) {
    console.error(error);
  }
}

// ---------- RENDER (VISUAL NOVO) ----------
function render(data) {
  const menu = document.getElementById("menu");

  if (menu) {
    menu.innerHTML = "";

    data.categories.forEach(c => {
      // Cria a seção da categoria
      const section = document.createElement("section");
      section.className = "category-section";
      
      // Título da Categoria
      section.innerHTML = `<h2 class="category-title">${c.name}</h2>`;

      // Grid para os produtos
      const grid = document.createElement("div");
      grid.className = "products-grid";

      data.products
        .filter(p => p.category_id === c.id)
        .forEach(p => {
          // Card do Produto
          const priceFormatted = Number(p.price).toFixed(2).replace(".", ",");
          
          grid.innerHTML += `
            <div class="product-card">
              <div>
                <div class="product-header">
                  <h3 class="product-name">${p.name}</h3>
                  <span class="product-price">R$ ${priceFormatted}</span>
                </div>
                <p class="product-desc">${p.description || "Sem descrição."}</p>
              </div>
            </div>
          `;
        });

      section.appendChild(grid);
      menu.appendChild(section);
    });
  }

  // SELECT DO ADMIN
  if (categorySelect) {
    categorySelect.innerHTML = `
      <option value="">Selecione uma categoria...</option>
      ${data.categories
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join("")}
    `;
  }
}

// ---------- ADICIONAR CATEGORIA ----------
async function addCategory() {
  if (!cat.value.trim()) {
    alert("Digite o nome da categoria");
    return;
  }

  await fetch(`${API}/category?admin=${ADMIN_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: cat.value })
  });

  cat.value = "";
  loadMenu();
}

// ---------- ADICIONAR PRODUTO ----------
async function addProduct() {
  if (!nameInput.value.trim() || !priceInput.value || !categorySelect.value) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

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

// ---------- INIT ----------
loadMenu();