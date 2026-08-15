import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="home-container">

      {/* SIDEBAR */}
      <div className="sidebar">

        <div className="logo">
          POS SYSTEM
        </div>

        <button onClick={() => navigate("/dashboard")}>📊 Dashboard</button>
        <button onClick={() => navigate("/sales")}>🧾 Sales</button>
        <button onClick={() => navigate("/products")}>📦 Products</button>
        <button onClick={() => navigate("/customers")}>👤 Customers</button>
        <button onClick={() => navigate("/reports")}>📈 Reports</button>

        <button className="logout" onClick={logout}>
          🚪 Logout
        </button>

      </div>

      {/* MAIN */}
      <div className="main">

        {/* TOP BAR */}
        <div className="topbar">

          <div>
            <h2>Welcome back 👋</h2>
            <p>{user?.user?.name} • {user?.user?.email}</p>
          </div>

          <div className="user-badge">
            {user?.user?.name?.charAt(0)}
          </div>

        </div>

        {/* KPI CARDS */}
        <div className="card-grid">

          <div className="card">
            <h4>Today Sales</h4>
            <h2>Rs. 25,000</h2>
            <p>↗ +12% from yesterday</p>
          </div>

          <div className="card">
            <h4>Total Orders</h4>
            <h2>120</h2>
            <p>Active transactions</p>
          </div>

          <div className="card">
            <h4>Products</h4>
            <h2>58</h2>
            <p>In inventory</p>
          </div>

          <div className="card">
            <h4>Customers</h4>
            <h2>340</h2>
            <p>Registered users</p>
          </div>

        </div>

        {/* QUICK ACTIONS */}
        <div className="section-title">
          Quick Actions
        </div>

        <div className="action-grid">

          <div className="action-card" onClick={() => navigate("/sales")}>
            🧾 New Sale
          </div>

          <div className="action-card" onClick={() => navigate("/products")}>
            📦 Add Product
          </div>

          <div className="action-card" onClick={() => navigate("/customers")}>
            👤 Add Customer
          </div>

          <div className="action-card" onClick={() => navigate("/reports")}>
            📊 View Reports
          </div>

        </div>

      </div>

    </div>
  );
}