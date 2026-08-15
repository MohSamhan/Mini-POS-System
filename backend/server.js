require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key";

// ======================================================
// AUTH
// ======================================================

// REGISTER
app.post("/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  db.query(
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
    [name, email, hashedPassword],
    (err) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ message: "Email already exists" });
        }
        return res.status(500).json({ message: "Database error" });
      }

      res.json({ message: "User registered successfully" });
    }
  );
});

// LOGIN
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (result.length === 0) {
        return res.status(401).json({ message: "Invalid email" });
      }

      const user = result[0];

      const isMatch = bcrypt.compareSync(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.id, name: user.name, email: user.email },
        SECRET_KEY,
        { expiresIn: "1h" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    }
  );
});

// ======================================================
// PRODUCTS
// ======================================================

// GET PRODUCTS
app.get("/products", (req, res) => {
  const sql = `
    SELECT 
      id,
      CONCAT('GN', LPAD(id, 5, '0')) AS code,
      name,
      price,
      cost,
      stock,
      (price * stock) AS total,
      created_at
    FROM products
    ORDER BY id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
});

// ADD PRODUCT
app.post("/products", (req, res) => {
  const { name, price, cost = 0, stock } = req.body;

  db.query(
    "INSERT INTO products (name, price, cost, stock) VALUES (?, ?, ?, ?)",
    [name, price, cost, stock],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ message: "Product added" });
    }
  );
});

// UPDATE PRODUCT
app.put("/products/:id", (req, res) => {
  const { name, price, cost = 0, stock } = req.body;

  db.query(
    `UPDATE products 
     SET name=?, price=?, cost=?, stock=? 
     WHERE id=?`,
    [name, price, cost, stock, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ message: "Product updated" });
    }
  );
});

// DELETE PRODUCT
app.delete("/products/:id", (req, res) => {
  db.query(
    "DELETE FROM products WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ message: "Product deleted" });
    }
  );
});

// ======================================================
// SALES
// ======================================================

app.post("/sales", (req, res) => {
  const { customer_id = null, items, cash = 0, balance = 0 } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const total = items.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.qty),
    0
  );

  const invoiceNo = "INV-" + Date.now();

  db.query(
    `INSERT INTO sales (invoice_no, customer_id, total_amount, cash, balance)
     VALUES (?, ?, ?, ?, ?)`,
    [invoiceNo, customer_id, total, cash, balance],
    (err, result) => {
      if (err) return res.status(500).json({ message: "Sale error" });

      const saleId = result.insertId;

      const values = items.map(item => [
        saleId,
        item.product_id,
        item.qty,
        item.price,
        item.cost || 0
      ]);

      db.query(
        `INSERT INTO sales_items 
         (sale_id, product_id, quantity, price, cost)
         VALUES ?`,
        [values],
        (err2) => {
          if (err2) return res.status(500).json({ message: "Item error" });

          // update stock
          items.forEach(item => {
            db.query(
              "UPDATE products SET stock = stock - ? WHERE id = ?",
              [item.qty, item.product_id]
            );
          });

          res.json({
            success: true,
            saleId,
            invoiceNo,
            total
          });
        }
      );
    }
  );
});

// ======================================================
// DASHBOARD
// ======================================================

app.get("/dashboard", (req, res) => {
  const dailySales = `
    SELECT DATE(created_at) AS day,
    SUM(total_amount) AS total
    FROM sales
    GROUP BY DATE(created_at)
    ORDER BY day DESC
    LIMIT 7
  `;

  const monthlyProfit = `
    SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
    SUM(total_amount) AS sales
    FROM sales
    GROUP BY DATE_FORMAT(created_at, '%Y-%m')
    ORDER BY month DESC
    LIMIT 6
  `;

  const topProducts = `
    SELECT p.name, SUM(si.quantity) AS total_sold
    FROM sales_items si
    JOIN products p ON p.id = si.product_id
    GROUP BY si.product_id, p.name
    ORDER BY total_sold DESC
    LIMIT 5
  `;

  db.query(dailySales, (err1, daily) => {
    if (err1) return res.status(500).json({ message: "Daily error" });

    db.query(monthlyProfit, (err2, monthly) => {
      if (err2) return res.status(500).json({ message: "Monthly error" });

      db.query(topProducts, (err3, top) => {
        if (err3) return res.status(500).json({ message: "Top product error" });

        res.json({
          dailySales: daily,
          monthlyProfit: monthly,
          topProducts: top
        });
      });
    });
  });
});

// ======================================================
// CUSTOMERS
// ======================================================

app.get("/customers", (req, res) => {
  db.query("SELECT * FROM customers ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result);
  });
});

app.post("/customers", (req, res) => {
  const { name, phone } = req.body;

  db.query(
    "INSERT INTO customers (name, phone) VALUES (?, ?)",
    [name, phone],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ message: "Customer added" });
    }
  );
});

app.put("/customers/:id", (req, res) => {
  const { name, phone } = req.body;

  db.query(
    "UPDATE customers SET name=?, phone=? WHERE id=?",
    [name, phone, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ message: "Customer updated" });
    }
  );
});

app.delete("/customers/:id", (req, res) => {
  db.query(
    "DELETE FROM customers WHERE id=?",
    [req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({ message: "Customer deleted" });
    }
  );
});

// ======================================================
// REPORTS
// ======================================================
app.get("/reports/advanced", (req, res) => {

app.get("/reports", (req, res) => {
  const sql = `
    SELECT
      COALESCE(SUM(CASE WHEN DATE(created_at)=CURDATE() THEN total_amount END),0) AS dailySales,
      COALESCE(SUM(CASE WHEN YEARWEEK(created_at,1)=YEARWEEK(CURDATE(),1) THEN total_amount END),0) AS weeklySales,
      COALESCE(SUM(CASE WHEN MONTH(created_at)=MONTH(CURDATE()) AND YEAR(created_at)=YEAR(CURDATE()) THEN total_amount END),0) AS monthlySales,
      COALESCE(SUM(CASE WHEN YEAR(created_at)=YEAR(CURDATE()) THEN total_amount END),0) AS yearlySales,
      COALESCE(SUM(total_amount),0) AS totalSales
    FROM sales;
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json(result[0]);
  });
});

  const profitQuery = `
    SELECT 
      COALESCE(SUM(s.total_amount - COALESCE(p.cost * si.quantity, 0)), 0) AS profit
    FROM sales s
    JOIN sales_items si ON s.id = si.sale_id
    JOIN products p ON p.id = si.product_id;
  `;

  const fastMovingQuery = `
    SELECT 
      p.name,
      SUM(si.quantity) AS total_sold
    FROM sales_items si
    JOIN products p ON p.id = si.product_id
    GROUP BY si.product_id, p.name
    ORDER BY total_sold DESC
    LIMIT 5;
  `;

  const slowMovingQuery = `
    SELECT 
      p.name,
      COALESCE(SUM(si.quantity), 0) AS total_sold
    FROM products p
    LEFT JOIN sales_items si ON p.id = si.product_id
    GROUP BY p.id, p.name
    ORDER BY total_sold ASC
    LIMIT 5;
  `;

  db.query(profitQuery, (err1, profitResult) => {
    if (err1) return res.status(500).json({ error: err1 });

    db.query(fastMovingQuery, (err2, fastResult) => {
      if (err2) return res.status(500).json({ error: err2 });

      db.query(slowMovingQuery, (err3, slowResult) => {
        if (err3) return res.status(500).json({ error: err3 });

        res.json({
          profit: profitResult[0]?.profit || 0,
          fastMoving: fastResult,
          nonMoving: slowResult
        });
      });
    });
  });
});


// ======================================================
// START SERVER
// ======================================================

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});