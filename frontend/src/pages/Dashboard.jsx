import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Dashboard.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [dailySales, setDailySales] = useState([]);
  const [monthlyProfit, setMonthlyProfit] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setDailySales(res.data.dailySales || []);
      setMonthlyProfit(res.data.monthlyProfit || []);
      setTopProducts(res.data.topProducts || []);
    } catch (err) {
      console.log(err);
    }
  };

  const COLORS = ["#4f46e5", "#06b6d4", "#22c55e", "#f59e0b", "#ef4444"];

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <h1>📊 Smart POS Dashboard</h1>
        <p>Real-time business analytics overview</p>
      </div>

      {/* KPI CARDS */}
      <div className="kpi-grid">

        <div className="kpi-card">
          <h3>📈 Sales</h3>
          <p>Live Tracking</p>
        </div>

        <div className="kpi-card">
          <h3>💰 Profit</h3>
          <p>Auto Calculated</p>
        </div>

        <div className="kpi-card">
          <h3>📦 Products</h3>
          <p>Inventory Status</p>
        </div>

        <div className="kpi-card">
          <h3>🏆 Top Items</h3>
          <p>Best Sellers</p>
        </div>

      </div>

      {/* CHART GRID */}
      <div className="chart-grid">

        {/* LINE */}
        <div className="chart-card">
          <h3>📈 Daily Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* BAR */}
        <div className="chart-card">
          <h3>💰 Monthly Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyProfit}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#22c55e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="chart-card full">
          <h3>🏆 Top Products</h3>

          <div className="pie-wrap">
            <PieChart width={400} height={300}>
              <Pie
                data={topProducts}
                dataKey="total_sold"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {topProducts.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </div>

        </div>

      </div>
    </div>
  );
}
// ================= STYLES =================
const cardStyle = {
  background: "#111827",
  padding: "20px",
  borderRadius: "12px",
  textAlign: "center",
  border: "1px solid #1f2937"
};

const chartBox = {
  background: "#111827",
  padding: "15px",
  borderRadius: "12px",
  border: "1px solid #1f2937"
};
