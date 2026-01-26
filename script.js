const API = "https://cardapio-backend-cytu.onrender.com";
const ADMIN_KEY = new URLSearchParams(window.location.search).get("admin");

// ELEMENTOS DO ADMIN
const cat = document.getElementById("cat");
const nameInput = document.getElementById("name");
const descInput = document.getElementById("desc");
const priceInput = document.getElementById("price");
const categorySelect = document.getElementById("category");

async function loadMenu() {
  const res = await fetch(`${API}/menu`);
  if (!res.ok) {
    console.error("Erro ao carregar menu");
    return;
  }
  const data = await res.json();
  render(data);
}

function render(data) {
  const menu = document.getElementById("menu");
  if (menu) {
    menu.innerHTML = "";

    data.categories.forEach(c => {
      const div = document.createElement("div");
      div.className = "category";
      div.innerHTML = `<h2>${c.name}</h2>`;

      data.products
        .filter(p => p.category_id === c.id)
        .forEach(p => {
          div.innerHTML += `
            <div class="product">
              <b>${p.name}</b><br>
              ${p.description || ""}<br>
              R$ ${Number(p.price).toFixed(2)}
            </div>
          `;
        });

      menu.appendChild(div);
    });
  }

  // SELECT DO ADMIN
  if (categorySelect) {
    categorySelect.innerHTML = `
      <option value="">Selecione uma categoria</option>
      ${data.categories
        .map(c => `<option value="${c.id}">${c.name}</option>`)
        .join("")}
    `;
  }
}

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

async function addProduct() {
  if (
    !nameInput.value.trim() ||
    !priceInput.value ||
    !categorySelect.value
  ) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  await fetch(`${API}/product?admin=${ADMIN_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: nameInput.value,
      description: descInput.value,
      price: Number(priceInput.value),
      category_id: Number(categorySelect.value)
    })
  });

  nameInput.value = "";
  descInput.value = "";
  priceInput.value = "";
  categorySelect.value = "";

  loadMenu();
}

loadMenu();
