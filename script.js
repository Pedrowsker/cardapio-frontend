const API = "https://cardapio-backend-cytu.onrender.com";
const ADMIN_KEY = new URLSearchParams(window.location.search).get("admin");

// ELEMENTOS DO ADMIN
const catInput = document.getElementById("cat");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("desc");
const priceInput = document.getElementById("price");
const categorySelect = document.getElementById("category");

// ---------- AUTO-REFRESH (A cada 30 segundos) ----------
// Só ativa o refresh automático se NÃO houver uma chave admin (página do cliente)
if (!ADMIN_KEY) {
  setInterval(loadMenu, 30000);
}

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
    console.error("Falha ao carregar o menu:", error);
  }
}

// ---------- RENDERIZAR INTERFACE ----------
function render(data) {
  const menu = document.getElementById("menu");

  if (menu) {
    menu.innerHTML = "";

    data.categories.forEach(c => {
      const section = document.createElement("section");
      section.className = "category-section";
      
      // Se for admin, mostra botão de deletar categoria
      const deleteCatBtn = ADMIN_KEY 
        ? `<button class="delete-btn cat-del" onclick="deleteCategory(${c.id})">Excluir Categoria</button>` 
        : "";

      section.innerHTML = `
        <div class="category-header">
          <h2 class="category-title">${c.name}</h2>
          ${deleteCatBtn}
        </div>
      `;

      const grid = document.createElement("div");
      grid.className = "products-grid";

      data.products
        .filter(p => p.category_id === c.id)
        .forEach(p => {
          const priceFormatted = Number(p.price).toFixed(2).replace(".", ",");
          
          // Se for admin, mostra botão de deletar produto
          const deleteProdBtn = ADMIN_KEY 
            ? `<button class="delete-prod-btn" onclick="deleteProduct(${p.id})">✕</button>` 
            : "";

          grid.innerHTML += `
            <div class="product-card">
              ${deleteProdBtn}
              <div class="product-header">
                <h3 class="product-name">${p.name}</h3>
                <span class="product-price">R$ ${priceFormatted}</span>
              </div>
              <p class="product-desc">${p.description || "Sem descrição."}</p>
            </div>
          `;
        });

      section.appendChild(grid);
      menu.appendChild(section);
    });
  }

  // SELECT DO ADMIN (Atualiza apenas se estiver na página admin e não estiver focado)
  if (categorySelect && document.activeElement !== categorySelect) {
    const currentSelection = categorySelect.value;
    categorySelect.innerHTML = `
      <option value="">Selecione uma categoria...</option>
      ${data.categories
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join("")}
    `;
    categorySelect.value = currentSelection;
  }
}

// ---------- FUNÇÕES DE EXCLUSÃO ----------

async function deleteProduct(id) {
  if (!confirm("Deseja realmente excluir este produto?")) return;
  
  try {
    const res = await fetch(`${API}/product/${id}?admin=${ADMIN_KEY}`, { 
      method: "DELETE" 
    });
    if (res.ok) {
        loadMenu();
    } else {
        alert("Erro ao excluir produto. Verifique sua chave de admin.");
    }
  } catch (error) {
    console.error("Erro na requisição de exclusão:", error);
  }
}

async function deleteCategory(id) {
  if (!confirm("Isso excluirá a categoria e TODOS os produtos dela. Confirmar?")) return;
  
  try {
    const res = await fetch(`${API}/category/${id}?admin=${ADMIN_KEY}`, { 
      method: "DELETE" 
    });
    if (res.ok) {
        loadMenu();
    } else {
        alert("Erro ao excluir categoria. Verifique se a rota existe no seu server.js.");
    }
  } catch (error) {
    console.error("Erro na requisição de exclusão:", error);
  }
}

// ---------- ADICIONAR CATEGORIA ----------
async function addCategory() {
  if (!catInput.value.trim()) {
    alert("Digite o nome da categoria");
    return;
  }

  try {
    const res = await fetch(`${API}/category?admin=${ADMIN_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: catInput.value })
    });

    if (res.ok) {
      catInput.value = "";
      loadMenu();
    }
  } catch (error) {
    console.error("Erro ao adicionar categoria:", error);
  }
}

// ---------- ADICIONAR PRODUTO ----------
async function addProduct() {
  if (!nameInput.value.trim() || !priceInput.value || !categorySelect.value) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  const formattedPrice = Number(priceInput.value.replace(",", "."));

  try {
    const res = await fetch(`${API}/product?admin=${ADMIN_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value,
        description: descInput.value,
        price: formattedPrice,
        category_id: Number(categorySelect.value)
      })
    });

    if (res.ok) {
      nameInput.value = "";
      descInput.value = "";
      priceInput.value = "";
      categorySelect.value = "";
      loadMenu();
    }
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
  }
}

// ---------- INICIALIZAÇÃO ----------
loadMenu();