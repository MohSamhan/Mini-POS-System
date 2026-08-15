import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Sales.css";

export default function Sales() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState("");

  const [cash, setCash] = useState("");
  const [customerId, setCustomerId] = useState("");

  // ================= LOAD DATA =================
  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await api.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // ================= CART =================
  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((i) => i.product_id === product.id);

      if (exist) {
        return prev.map((i) =>
          i.product_id === product.id
            ? { ...i, qty: i.qty + 1 }
            : i
        );
      }

      return [
        ...prev,
        {
          product_id: product.id,
          code: product.code,
          name: product.name,
          price: Number(product.price),
          qty: 1,
        },
      ];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === id ? { ...i, qty: i.qty + 1 } : i
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product_id === id ? { ...i, qty: i.qty - 1 } : i
        )
        .filter((i) => i.qty > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((i) => i.product_id !== id));
  };

  // ================= TOTAL =================
  const total = cart.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );

  const balance = (Number(cash) || 0) - total;

  // ================= PRINT BILL (CLEAN MODERN VERSION) =================
  // ================= PRINT BILL =================
const printBill = (invoiceNo) => {
  const customer =
    customers.find((c) => c.id === Number(customerId))?.name ||
    "Walk-in Customer";

  const win = window.open("", "", "width=350,height=700");

  win.document.write(`
<!DOCTYPE html>
<html>
<head>
<title>Receipt</title>

<style>
*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,Helvetica,sans-serif;
}

body{
width:80mm;
padding:10px;
color:#000;
background:#fff;
font-size:13px;
}

.center{
text-align:center;
}

.shop{
font-size:22px;
font-weight:bold;
letter-spacing:1px;
}

.line{
border-top:1px dashed #000;
margin:8px 0;
}

table{
width:100%;
border-collapse:collapse;
}

th{
border-bottom:1px dashed #000;
padding:4px;
font-size:12px;
}

td{
padding:4px;
font-size:12px;
}

.right{
text-align:right;
}

.total{
font-size:16px;
font-weight:bold;
}

.footer{
text-align:center;
margin-top:10px;
font-size:12px;
}

.barcode{
margin-top:12px;
text-align:center;
font-size:18px;
letter-spacing:2px;
}

</style>

</head>

<body>

<div class="center">

<div class="shop">
YOUR SHOP NAME
</div>

Computer Sales & Repair<br>

No 100, Main Road<br>

Colombo<br>

Tel : 0771234567

</div>

<div class="line"></div>

Invoice : ${invoiceNo}<br>
Date : ${new Date().toLocaleDateString()}<br>
Time : ${new Date().toLocaleTimeString()}<br>
Customer : ${customer}

<div class="line"></div>

<table>

<tr>

<th>Item</th>
<th>Qty</th>
<th>Price</th>
<th>Total</th>

</tr>

${cart
  .map(
    (i) => `
<tr>

<td>${i.name}</td>

<td>${i.qty}</td>

<td class="right">${i.price.toFixed(2)}</td>

<td class="right">${(i.price * i.qty).toFixed(2)}</td>

</tr>
`
  )
  .join("")}

</table>

<div class="line"></div>

<table>

<tr>

<td>Total</td>

<td class="right total">
Rs. ${total.toFixed(2)}
</td>

</tr>

<tr>

<td>Cash</td>

<td class="right">
Rs. ${Number(cash).toFixed(2)}
</td>

</tr>

<tr>

<td>Balance</td>

<td class="right">
Rs. ${balance.toFixed(2)}
</td>

</tr>

</table>

<div class="line"></div>

<div class="footer">

**************<br>

THANK YOU<br>

PLEASE COME AGAIN<br>

**************

</div>

<div class="barcode">

|||||||||||||||||||||||||||||

</div>

<div class="center">

${invoiceNo}

</div>

<script>
window.onload=function(){
window.print();
window.onafterprint=function(){
window.close();
}
}
</script>

</body>
</html>
`);

  win.document.close();
};

  // ================= CHECKOUT =================
  const checkout = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    if (!cash) return alert("Enter cash");

    const finalCustomerId =
      customerId === "" ? null : Number(customerId);

    try {
      const res = await api.post("/sales", {
        customer_id: finalCustomerId,
        items: cart,
        cash: Number(cash),
        balance,
      });

      printBill(res.data.invoiceNo);

      setCart([]);
      setCash("");
      setCustomerId("");

      loadProducts();

      alert("Sale Completed!");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Sale Failed");
    }
  };

  // ================= SEARCH =================
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.code?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sales-container">

      {/* ================= PRODUCTS ================= */}
      <div className="box">
        <h2>📦 Products</h2>

        <input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p) => (
              <tr key={p.id}>
                <td>{p.code}</td>
                <td>{p.name}</td>
                <td>Rs. {p.price}</td>
                <td>{p.stock}</td>
                <td>
                  <button onClick={() => addToCart(p)}>
                    ➕ Add
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CART ================= */}
      <div className="box">
        <h2>🛒 Cart</h2>

        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
        >
          <option value="">Walk-in Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {cart.map((i) => (
          <div className="cart-item" key={i.product_id}>
            <div>
              <b>{i.name}</b>

              <div className="qty-box">
                <button onClick={() => decreaseQty(i.product_id)}>➖</button>
                <span>{i.qty}</span>
                <button onClick={() => increaseQty(i.product_id)}>➕</button>
              </div>
            </div>

            <div>
              <b>Rs. {(i.price * i.qty).toFixed(2)}</b>
              <button onClick={() => removeItem(i.product_id)}>❌</button>
            </div>
          </div>
        ))}

        <input
          type="number"
          placeholder="Cash"
          value={cash}
          onChange={(e) => setCash(e.target.value)}
        />

        <h3>Total: Rs. {total.toFixed(2)}</h3>
        <h3>Balance: Rs. {balance.toFixed(2)}</h3>

        <button onClick={checkout}>
          ✅ Complete Sale
        </button>
      </div>

    </div>
  );
}