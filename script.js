const API = "https://cardapio-backend-cytu.onrender.com";
const ADMIN_KEY = new URLSearchParams(window.location.search).get("admin");

async function loadMenu() {
  const res = await fetch(`${API}/menu`);
  const data = await res.json();
  render(data);
}

function render(data) {
  const menu = document.getElementById("menu");
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
            R$ ${p.price}
          </div>
        `;
      });

    menu.appendChild(div);
  });

  const select = document.getElementById("category");
  if (select) {
    select.innerHTML = data.categories
      .map(c => `<option value="${c.id}">${c.name}</option>`)
      .join("");
  }
}

async function addCategory() {
  await fetch(`${API}/category?admin=${ADMIN_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: cat.value })
  });
  loadMenu();
}

async function addProduct() {
  await fetch(`${API}/product?admin=${ADMIN_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name.value,
      description: desc.value,
      price: price.value,
      category_id: category.value
    })
  });
  loadMenu();
}

loadMenu();
