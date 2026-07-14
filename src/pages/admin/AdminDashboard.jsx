import React, { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShoppingBag, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  TrendingDown,
  Box,
  FolderTree
} from "lucide-react";
import { fetchDashboardStats } from "../../services/adminService";
import { toast } from "react-toastify";
import "./AdminDashboard.css";

const formatPrice = (value) => {
  const price = parseFloat(value || 0);
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartFilter, setChartFilter] = useState("daily"); // "daily" | "weekly" | "monthly" | "yearly" | "custom"
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadDashboardStats = async () => {
    setLoading(true);
    try {
      const params = { chart_filter: chartFilter };
      if (chartFilter === "custom") {
        if (startDate && endDate) {
          params.start_date = startDate;
          params.end_date = endDate;
        } else {
          setLoading(false);
          return;
        }
      }
      const res = await fetchDashboardStats(params);
      setStats(res.data);
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
      toast.error("Failed to load dashboard metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chartFilter !== "custom") {
      loadDashboardStats();
    }
  }, [chartFilter]);

  if (loading && !stats) {
    return (
      <div className="admin-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <div style={{ color: "var(--admin-text-dimmed)", fontSize: "16px", fontFamily: "var(--font-inter)" }}>
          Loading dashboard metrics registry...
        </div>
      </div>
    );
  }

  // SVG Chart variables
  const chartData = stats?.chart_data || [];
  const paddingX = 60;
  const paddingY = 40;
  const svgWidth = 800;
  const svgHeight = 250;
  
  const salesValues = chartData.map(d => d.sales);
  const maxSalesVal = Math.max(...salesValues, 100);
  
  const points = chartData.map((d, index) => {
    const x = paddingX + (index * (svgWidth - 2 * paddingX)) / Math.max(chartData.length - 1, 1);
    const y = svgHeight - paddingY - (d.sales * (svgHeight - 2 * paddingY)) / maxSalesVal;
    return { x, y, ...d };
  });

  let pathD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
  }

  let areaD = "";
  if (points.length > 0) {
    areaD = `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`;
  }

  return (
    <div className="admin-container">
      {/* HEADER SECTION */}
      <div className="workspace-header-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 className="workspace-title font-plus-jakarta">Dashboard</h1>
          <p style={{ color: "var(--admin-text-dimmed)", fontSize: "14px", margin: "4px 0 0 0" }}>
            Real-time business intelligence and sales analytics console.
          </p>
        </div>
      </div>

      {/* TOP ROW: REVENUE STATS GRID */}
      {stats && (
        <div className="stats-grid">
          {/* Card 1: Total Revenue */}
          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper total-icon-bg">
                <TrendingUp size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Total Revenue</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(stats.revenue.total_revenue)}</span>
          </div>

          {/* Card 2: Monthly Revenue */}
          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper gold-icon-bg">
                <Calendar size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Monthly Revenue</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(stats.revenue.monthly_revenue)}</span>
          </div>

          {/* Card 3: Weekly Revenue */}
          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper active-icon-bg">
                <Clock size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Weekly Revenue</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(stats.revenue.weekly_revenue)}</span>
          </div>

          {/* Card 4: Average Order Value */}
          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper unverified-icon-bg">
                <CreditCard size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Avg Order Value</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(stats.revenue.aov)}</span>
          </div>
        </div>
      )}

      {/* MIDDLE ROW: SALES CHART */}
      <div className="table-card-frame" style={{ padding: "24px", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#FFF", fontWeight: 700 }} className="font-plus-jakarta">
              Sales Performance
            </h3>
            <span style={{ fontSize: "12px", color: "var(--admin-text-dimmed)" }}>
              Revenue history timeline
            </span>
          </div>

          {/* Chart Filter Toggles */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {chartFilter === "custom" && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }} className="font-inter">
                <input 
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#050811",
                    border: "1px solid var(--admin-border-gray)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
                <span style={{ color: "var(--admin-text-dimmed)", fontSize: "12px" }}>to</span>
                <input 
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    padding: "6px 10px",
                    backgroundColor: "#050811",
                    border: "1px solid var(--admin-border-gray)",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "12px",
                    outline: "none"
                  }}
                />
                <button
                  onClick={loadDashboardStats}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "var(--figma-standard-blue)",
                    border: "none",
                    borderRadius: "6px",
                    color: "#fff",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Apply
                </button>
              </div>
            )}

            <div className="chart-filter-toggles" style={{ display: "flex", gap: "8px", backgroundColor: "#050811", padding: "4px", borderRadius: "8px", border: "1px solid var(--admin-border-gray)" }}>
              {["daily", "weekly", "monthly", "yearly", "custom"].map((f) => (
                <button
                  key={f}
                  onClick={() => setChartFilter(f)}
                  style={{
                    padding: "6px 12px",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    cursor: "pointer",
                    backgroundColor: chartFilter === f ? "var(--figma-standard-blue)" : "transparent",
                    color: chartFilter === f ? "#FFF" : "var(--admin-text-dimmed)",
                    transition: "all 0.2s ease"
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pure SVG Line Chart */}
        {chartData.length === 0 ? (
          <div style={{ height: "250px", display: "flex", justifyContent: "center", alignItems: "center", color: "var(--admin-text-dimmed)" }}>
            No sales chart data available in this time range.
          </div>
        ) : (
          <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" height="300" style={{ display: "block" }}>
              <defs>
                <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Gridlines */}
              {[0, 1, 2, 3, 4].map((i) => {
                const y = paddingY + (i * (svgHeight - 2 * paddingY)) / 4;
                const valueText = formatPrice(maxSalesVal - (i * maxSalesVal) / 4);
                return (
                  <g key={i}>
                    <line 
                      x1={paddingX} 
                      y1={y} 
                      x2={svgWidth - paddingX} 
                      y2={y} 
                      stroke="rgba(42, 59, 86, 0.3)" 
                      strokeDasharray="4 4" 
                    />
                    <text 
                      x={paddingX - 10} 
                      y={y + 4} 
                      fill="var(--admin-text-dimmed)" 
                      fontSize="9" 
                      textAnchor="end"
                      fontFamily="Inter"
                    >
                      {valueText.split(".")[0]}
                    </text>
                  </g>
                );
              })}

              {/* Area Under Curve Fill */}
              {areaD && <path d={areaD} fill="url(#chartGlow)" />}

              {/* Sales Curve Line */}
              {pathD && (
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke="var(--figma-standard-blue)" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              )}

              {/* X Axis Labels */}
              {points.map((p, idx) => {
                // Show subset of labels to prevent crowding
                const skipFactor = Math.ceil(points.length / 8);
                if (idx % skipFactor !== 0 && idx !== points.length - 1) return null;
                return (
                  <text
                    key={idx}
                    x={p.x}
                    y={svgHeight - paddingY + 16}
                    fill="var(--admin-text-dimmed)"
                    fontSize="9"
                    textAnchor="middle"
                    fontFamily="Inter"
                  >
                    {p.label}
                  </text>
                );
              })}

              {/* Interactive Circles & Hover Hotspots */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#FFFFFF"
                    stroke="var(--figma-standard-blue)"
                    strokeWidth="2.5"
                    style={{ cursor: "pointer", transition: "r 0.1s ease" }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Larger transparent hit region for easier hover */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="15"
                    fill="transparent"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              ))}
            </svg>

            {/* Floating Tooltip */}
            {hoveredPoint && (
              <div 
                style={{
                  position: "absolute",
                  left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                  top: `${(hoveredPoint.y / svgHeight) * 100 - 50}%`,
                  transform: "translateX(-50%)",
                  backgroundColor: "#0A0F1D",
                  border: "1px solid var(--admin-border-gray)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  zIndex: 10,
                  pointerEvents: "none",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                  fontFamily: "Inter"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>
                  {hoveredPoint.label}
                </div>
                <div style={{ fontSize: "12px", color: "var(--figma-standard-blue)", fontWeight: 600 }}>
                  Sales: {formatPrice(hoveredPoint.sales)}
                </div>
                <div style={{ fontSize: "11px", color: "var(--admin-text-dimmed)" }}>
                  Orders: {hoveredPoint.orders}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* THREE & FOURTH ROW: TOP PRODUCTS & TOP CATEGORIES */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(450px, 1fr))", gap: "24px", marginTop: "24px" }}>
          {/* Top Selling Products */}
          <div className="table-card-frame" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#FFF", display: "flex", alignItems: "center", gap: "8px" }} className="font-plus-jakarta">
              <Box size={18} style={{ color: "var(--figma-standard-blue)" }} />
              <span>Top 5 Selling Products</span>
            </h3>
            <table className="figma-dark-table font-inter">
              <thead>
                <tr>
                  <th className="uppercase" style={{ padding: "12px 16px" }}>Rank</th>
                  <th className="uppercase" style={{ padding: "12px 16px" }}>Product Name</th>
                  <th className="uppercase text-center" style={{ padding: "12px 16px" }}>Units Sold</th>
                  <th className="uppercase text-right" style={{ padding: "12px 16px" }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_products.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center" style={{ padding: "20px" }}>
                      No product sales registry found.
                    </td>
                  </tr>
                ) : (
                  stats.top_products.map((p, idx) => (
                    <tr key={p.id}>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>#{idx + 1}</td>
                      <td style={{ padding: "12px 16px", color: "#FFF" }}>{p.name}</td>
                      <td className="text-center" style={{ padding: "12px 16px" }}>{p.units_sold}</td>
                      <td className="text-right" style={{ padding: "12px 16px", fontWeight: 600 }}>{formatPrice(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Top Selling Categories */}
          <div className="table-card-frame" style={{ padding: "20px" }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#FFF", display: "flex", alignItems: "center", gap: "8px" }} className="font-plus-jakarta">
              <FolderTree size={18} style={{ color: "var(--figma-gold-elite)" }} />
              <span>Top 5 Selling Categories</span>
            </h3>
            <table className="figma-dark-table font-inter">
              <thead>
                <tr>
                  <th className="uppercase" style={{ padding: "12px 16px" }}>Rank</th>
                  <th className="uppercase" style={{ padding: "12px 16px" }}>Category Name</th>
                  <th className="uppercase text-center" style={{ padding: "12px 16px" }}>Units Sold</th>
                  <th className="uppercase text-right" style={{ padding: "12px 16px" }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.top_categories.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center" style={{ padding: "20px" }}>
                      No category sales registry found.
                    </td>
                  </tr>
                ) : (
                  stats.top_categories.map((c, idx) => (
                    <tr key={c.id}>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>#{idx + 1}</td>
                      <td style={{ padding: "12px 16px", color: "#FFF" }}>{c.name}</td>
                      <td className="text-center" style={{ padding: "12px 16px" }}>{c.units_sold}</td>
                      <td className="text-right" style={{ padding: "12px 16px", fontWeight: 600 }}>{formatPrice(c.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BOTTOM ROW: RETURNS / ORDERS STATS */}
      {stats && (
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "16px", color: "#FFF", display: "flex", alignItems: "center", gap: "8px" }} className="font-plus-jakarta">
            <ShoppingBag size={18} style={{ color: "#10B981" }} />
            <span>Order Fulfillment & Return Rate Analysis</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
            <div className="table-card-frame" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)", textTransform: "uppercase", letterSpacing: "0.5px" }} className="font-inter">Total Orders</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#FFF" }} className="font-plus-jakarta">{stats.order_stats.total_orders}</span>
            </div>

            <div className="table-card-frame" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)", textTransform: "uppercase", letterSpacing: "0.5px" }} className="font-inter">Processing</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#3B82F6" }} className="font-plus-jakarta">{stats.order_stats.processing}</span>
            </div>

            <div className="table-card-frame" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)", textTransform: "uppercase", letterSpacing: "0.5px" }} className="font-inter">Shipped</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#8B5CF6" }} className="font-plus-jakarta">{stats.order_stats.shipped}</span>
            </div>

            <div className="table-card-frame" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)", textTransform: "uppercase", letterSpacing: "0.5px" }} className="font-inter">Delivered</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#10B981" }} className="font-plus-jakarta">{stats.order_stats.delivered}</span>
            </div>

            <div className="table-card-frame" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)", textTransform: "uppercase", letterSpacing: "0.5px" }} className="font-inter">Cancelled</span>
              <span style={{ fontSize: "20px", fontWeight: 700, color: "#EF4444" }} className="font-plus-jakarta">{stats.order_stats.cancelled}</span>
            </div>

            <div className="table-card-frame" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)", textTransform: "uppercase", letterSpacing: "0.5px" }} className="font-inter">Returns Rate</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
                <span style={{ fontSize: "20px", fontWeight: 700, color: "#FF8F4F" }} className="font-plus-jakarta">{stats.order_stats.return_rate}%</span>
                <span style={{ fontSize: "11px", color: "var(--admin-text-dimmed)" }}>({stats.order_stats.returned} orders)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER COOLDOWN BRAND ANCHOR */}
      <footer className="admin-footer-branding font-inter">
        <span>© 2026 TravelKart. All Rights Reserved.</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;
