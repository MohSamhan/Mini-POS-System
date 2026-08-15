import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Reports.css";

export default function Reports() {
  const [dailySales, setDailySales] = useState(0);
  const [weeklySales, setWeeklySales] = useState(0);
  const [monthlySales, setMonthlySales] = useState(0);
  const [yearlySales, setYearlySales] = useState(0);

  const [profit, setProfit] = useState(0);
  const [fastProducts, setFastProducts] = useState([]);
  const [slowProducts, setSlowProducts] = useState([]);

  useEffect(() => {
    loadReports();
    loadAdvancedReports();
  }, []);

  const loadReports = async () => {
    const res = await api.get("/reports");

    setDailySales(res.data.dailySales || 0);
    setWeeklySales(res.data.weeklySales || 0);
    setMonthlySales(res.data.monthlySales || 0);
    setYearlySales(res.data.yearlySales || 0);
  };

  const loadAdvancedReports = async () => {
    try {
      const res = await api.get("/reports/advanced");

      setProfit(res.data.profit || 0);
      setFastProducts(res.data.fastMoving || []);
      setSlowProducts(res.data.nonMoving || []);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="reports-container">

      {/* HEADER */}
      <div className="reports-header">
        <h1>📊 Analytics Reports</h1>
        <p>Business performance overview</p>
      </div>

      {/* KPI GRID */}
      <div className="kpi-grid">

        <div className="kpi-card blue">
          <h4>Daily Sales</h4>
          <h2>Rs. {dailySales}</h2>
        </div>

        <div className="kpi-card purple">
          <h4>Weekly Sales</h4>
          <h2>Rs. {weeklySales}</h2>
        </div>

        <div className="kpi-card green">
          <h4>Monthly Sales</h4>
          <h2>Rs. {monthlySales}</h2>
        </div>

        <div className="kpi-card orange">
          <h4>Yearly Sales</h4>
          <h2>Rs. {yearlySales}</h2>
        </div>

        <div className="kpi-card profit">
          <h4>Profit</h4>
          <h2>Rs. {profit}</h2>
        </div>

      </div>

      {/* REPORT GRID */}
      <div className="report-grid">

        {/* FAST MOVING */}
        <div className="report-card">
          <h3>🔥 Fast Moving Products</h3>

          {fastProducts.length === 0 ? (
            <p className="empty">No data available</p>
          ) : (
            fastProducts.map((p, i) => (
              <div className="product-row" key={i}>
                <span>{p.name}</span>
                <span className="badge">{p.total_sold}</span>
              </div>
            ))
          )}
        </div>

        {/* SLOW MOVING */}
        <div className="report-card">
          <h3>🐌 Slow Moving Products</h3>

          {slowProducts.length === 0 ? (
            <p className="empty">No data available</p>
          ) : (
            slowProducts.map((p, i) => (
              <div className="product-row" key={i}>
                <span>{p.name}</span>
              </div>
            ))
          )}
        </div>

      </div>

    </div>
  );
}