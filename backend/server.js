import dotenv from "dotenv";
dotenv.config();


import express from "express";
import cors from "cors";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

/* ---------- MIDDLEWARE ---------- */

app.use(cors({ origin: "*" }));
app.use(express.json());

/* ---------- BANCO ---------- */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  family: 4 // 🔴 FORÇA IPv4
});

/* ---------- ADMIN ---------- */

const ADMIN_KEY = "admin123";

function adminCheck(req, res, next) {
  if (req.query.admin !== ADMIN_KEY) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  next();
}

/* ---------- ROTAS ---------- */

// raiz (teste)
app.get("/", (req, res) => {
  res.send("Backend do cardápio online");
});

// público
app.get("/menu", async (req, res) => {
  try {
    const categories = await pool.query(
      "SELECT * FROM categories ORDER BY id"
    );
    const products = await pool.query(
      "SELECT * FROM products ORDER BY id"
    );

    res.json({
      categories: categories.rows,
      products: products.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao carregar menu" });
  }
});

// admin – categoria
app.post("/category", adminCheck, async (req, res) => {
  try {
    await pool.query(
      "INSERT INTO categories (name) VALUES ($1)",
      [req.body.name]
    );
    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
});

// admin – produto
app.post("/product", adminCheck, async (req, res) => {
  try {
    const { name, description, price, category_id } = req.body;

    await pool.query(
      "INSERT INTO products (name, description, price, category_id) VALUES ($1,$2,$3,$4)",
      [name, description, price, category_id]
    );

    res.sendStatus(201);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar produto" });
  }
});

// admin – deletar produto
app.delete("/product/:id", adminCheck, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM products WHERE id = $1",
      [req.params.id]
    );
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
});

/* ---------- SERVER ---------- */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Backend online na porta", PORT);
});
