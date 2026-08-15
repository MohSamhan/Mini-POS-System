import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Products.css";

export default function Products() {
  const [products, setProducts] = useState([]);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // ================= LOAD PRODUCTS =================
  const loadProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.log("Error loading products", err);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // ================= ADD PRODUCT =================
  const addProduct = async (e) => {
    e.preventDefault();

    if (!name || !price || !stock) {
      alert("Fill all fields");
      return;
    }

    try {
      await api.post("/products", {
        name,
        price,
        stock,
      });

      setName("");
      setPrice("");
      setStock("");

      loadProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= EDIT PRODUCT =================
  const editProduct = (p) => {
    setEditId(p.id);
    setName(p.name);
    setPrice(p.price);
    setStock(p.stock);
  };

  // ================= UPDATE PRODUCT =================
  const updateProduct = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/products/${editId}`, {
        name,
        price,
        stock,
      });

      setEditId(null);
      setName("");
      setPrice("");
      setStock("");

      loadProducts();
    } catch (err) {
      console.log(err);
    }
  };

  // ================= FILTER =================
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="products-container">

      <h1>📦 Products</h1>

      {/* ================= SEARCH ================= */}
      <input
        type="text"
        placeholder="Search product..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= FORM ================= */}
      <form
        className="products-form"
        onSubmit={editId ? updateProduct : addProduct}
      >
        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />

        <button type="submit">
          {editId ? "Update Product" : "Add Product"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setName("");
              setPrice("");
              setStock("");
            }}
          >
            Cancel
          </button>
        )}
      </form>

      {/* ================= TABLE ================= */}
      <table className="products-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Code</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Total</th>
            <th>Date & Time</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>

              <td>GN{String(p.id).padStart(5, "0")}</td>

              <td>{p.name}</td>

              <td>Rs. {Number(p.price).toFixed(2)}</td>

              <td>{p.stock}</td>

              <td>Rs. {(p.price * p.stock).toFixed(2)}</td>

              <td>
                {p.created_at
                  ? new Date(p.created_at).toLocaleString()
                  : "-"}
              </td>

              <td>
                <button onClick={() => editProduct(p)}>✏️ Edit</button>
                <button onClick={() => deleteProduct(p.id)}>❌ Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );
}