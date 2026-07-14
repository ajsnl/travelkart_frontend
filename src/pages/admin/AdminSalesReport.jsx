import React, { useEffect, useState } from "react";
import { 
  ShoppingBag, 
  TrendingUp, 
  CreditCard, 
  FileSpreadsheet, 
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { fetchSalesReport } from "../../services/adminService";
import { toast } from "react-toastify";
import "./AdminSalesReport.css";

const formatPrice = (value) => {
  const price = parseFloat(value || 0);
  return `₹${price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
};

const AdminSalesReport = () => {
  const [reportType, setReportType] = useState("daily"); 
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const getTodayStr = () => {
    return new Date().toISOString().split("T")[0];
  };

  const loadSalesReport = async () => {
    setLoading(true);
    try {
      const params = { report_type: reportType, page: page };
      if (reportType === "custom") {
        if (!startDate || !endDate) {
          toast.error("Please select start and end dates for custom range.");
          setLoading(false);
          return;
        }
        params.start_date = startDate;
        params.end_date = endDate;
      }
      const res = await fetchSalesReport(params);
      
      // Paginated view has results in res.data.results
      setReportData({
        summary: res.data.summary,
        orders: res.data.results || []
      });
      setCount(res.data.count || 0);
    } catch (err) {
      console.error("Error loading sales report registry:", err);
      toast.error("Failed to load sales report metrics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [reportType, startDate, endDate]);

  // Fetch report triggered by type selection or pagination changes
  useEffect(() => {
    if (reportType !== "custom") {
      loadSalesReport();
    }
  }, [reportType, page]);

  const handleGenerateCustomReport = () => {
    setPage(1);
    loadSalesReport();
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Compiling full dataset for export...");
      const params = { report_type: reportType, export: true };
      if (reportType === "custom") {
        if (!startDate || !endDate) {
          toast.error("Start and end dates are required to export custom report.");
          return;
        }
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const res = await fetchSalesReport(params);
      const exportOrders = res.data.orders || [];

      if (exportOrders.length === 0) {
        toast.warning("No data available to export.");
        return;
      }

      const headers = [
        "Order ID", 
        "Tracking ID", 
        "Customer Name", 
        "Customer Email", 
        "Date", 
        "Coupon Used", 
        "Discount Amount", 
        "Gross Amount", 
        "Net Amount", 
        "Payment Status", 
        "Order Status"
      ];

      const rows = exportOrders.map(o => [
        o.id,
        o.tracking_id,
        o.customer_name,
        o.customer_email,
        new Date(o.created_at).toLocaleDateString(),
        o.coupon_code,
        o.discount,
        o.gross_price,
        o.total_price,
        o.payment_status,
        o.status
      ]);

      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sales_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report downloaded successfully.");
    } catch (err) {
      console.error("Export failure:", err);
      toast.error("Failed to compile CSV spreadsheet.");
    }
  };

  // Helper calculations for ranges
  const startItemRange = (page - 1) * 10 + 1;
  const endItemRange = Math.min(page * 10, count);

  return (
    <div className="admin-container font-inter">
      {/* HEADER ROW */}
      <div className="reports-header-row">
        <div>
          <h2 className="reports-page-title font-plus-jakarta">Sales Reports</h2>
          <p className="reports-page-subtitle">Generate and export transaction performance summaries</p>
        </div>

        {reportData && count > 0 && (
          <div style={{ display: "flex", gap: "12px" }}>
            <button className="btn-export-excel" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} />
              <span>Export Excel/CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* FILTERS PANEL CARD */}
      <div className="reports-filter-card">
        <div className="reports-filter-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label className="filter-input-label">Report Period</label>
            <select 
              value={reportType} 
              onChange={(e) => setReportType(e.target.value)} 
              className="reports-select"
            >
              <option value="daily">Daily Report (Today)</option>
              <option value="weekly">Weekly Report (Last 7 Days)</option>
              <option value="monthly">Monthly Report (Current Calendar Month)</option>
              <option value="yearly">Yearly Report (Current Calendar Year)</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {reportType === "custom" && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="filter-input-label">Start Date</label>
                <input 
                  type="date" 
                  value={startDate} 
                  max={getTodayStr()} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="reports-date-input"
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label className="filter-input-label">End Date</label>
                <input 
                  type="date" 
                  value={endDate} 
                  max={getTodayStr()} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="reports-date-input"
                />
              </div>

              <button className="btn-fetch-report" onClick={handleGenerateCustomReport}>
                Generate Report
              </button>
            </>
          )}
        </div>
      </div>

      {/* SUMMARY SCOREBOARDS */}
      {reportData && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper active-icon-bg">
                <ShoppingBag size={18} />
              </div>
            </div>
            <span className="stat-label uppercase">Sales Volume</span>
            <span className="stat-value font-plus-jakarta">{reportData.summary.sales_count.toLocaleString()}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper gold-icon-bg">
                <TrendingUp size={18} />
              </div>
            </div>
            <span className="stat-label uppercase">Gross Amount</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(reportData.summary.gross_amount)}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper unverified-icon-bg">
                <CreditCard size={18} />
              </div>
            </div>
            <span className="stat-label uppercase">Total Discount</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(reportData.summary.discount_amount)}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper total-icon-bg">
                <TrendingUp size={18} />
              </div>
            </div>
            <span className="stat-label uppercase">Net Revenue</span>
            <span className="stat-value font-plus-jakarta">{formatPrice(reportData.summary.net_amount)}</span>
          </div>
        </div>
      )}

      {/* DATA TABLE SHEET */}
      <div className="table-card-frame" style={{ marginTop: "24px" }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--admin-text-dimmed)" }}>
            Compiling sales transactions...
          </div>
        ) : !reportData || reportData.orders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--admin-text-dimmed)" }}>
            <AlertCircle size={32} style={{ display: "block", margin: "0 auto 12px auto", color: "var(--admin-text-dimmed)" }} />
            No transaction records match the specified reporting constraints.
          </div>
        ) : (
          <>
            <table className="figma-dark-table">
              <thead>
                <tr>
                  <th className="uppercase">Date</th>
                  <th className="uppercase">Order ID</th>
                  <th className="uppercase">Customer Details</th>
                  <th className="uppercase">Coupon Used</th>
                  <th className="uppercase text-right">Discount</th>
                  <th className="uppercase text-right">Gross Amt</th>
                  <th className="uppercase text-right">Net Amt</th>
                  <th className="uppercase text-center">Fulfillment</th>
                </tr>
              </thead>
              <tbody>
                {reportData.orders.map((o) => (
                  <tr key={o.id}>
                    <td className="table-row-timestamp-text">
                      {new Date(o.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric"
                      })}
                    </td>
                    <td style={{ color: "#FFF", fontWeight: 600 }}>{o.tracking_id}</td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ color: "#FFF", fontWeight: 500 }}>{o.customer_name}</span>
                        <span style={{ fontSize: "12px", color: "var(--admin-text-dimmed)" }}>{o.customer_email}</span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: o.coupon_code !== "N/A" ? "var(--figma-gold-elite)" : "var(--admin-text-dimmed)" }}>
                      {o.coupon_code}
                    </td>
                    <td className="text-right" style={{ color: o.discount > 0 ? "#EF4444" : "inherit" }}>
                      {o.discount > 0 ? `-${formatPrice(o.discount)}` : formatPrice(0)}
                    </td>
                    <td className="text-right">{formatPrice(o.gross_price)}</td>
                    <td className="text-right" style={{ color: "#FFF", fontWeight: 700 }}>{formatPrice(o.total_price)}</td>
                    <td className="text-center">
                      <span className={`tier-badge-node ${o.status === "delivered" ? "tier-gold" : "tier-standard"}`} style={{ textTransform: "capitalize" }}>
                        {o.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* TABLE PAGINATION FOOTER */}
            <footer className="table-pagination-footer-console">
              <div className="pagination-range-counter-info">
                Showing <span className="text-white-weight">{count === 0 ? 0 : startItemRange}-{endItemRange}</span> of <span className="text-white-weight">{count.toLocaleString()}</span> orders
              </div>

              <div className="pagination-action-controls-button-group">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="console-pagination-step-btn"
                  aria-label="Previous Page"
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="pagination-page-numeric-cluster">
                  <button className="numeric-page-btn numeric-active-btn">
                    {page}
                  </button>
                  {page * 10 < count && (
                    <button onClick={() => setPage(page + 1)} className="numeric-page-btn">
                      {page + 1}
                    </button>
                  )}
                </div>

                <button
                  disabled={page * 10 >= count}
                  onClick={() => setPage(page + 1)}
                  className="console-pagination-step-btn"
                  aria-label="Next Page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </>
        )}
      </div>

      {/* FOOTER COOLDOWN BRAND ANCHOR */}
      <footer className="admin-footer-branding">
        <span>© 2026 TravelKart. All Rights Reserved.</span>
      </footer>
    </div>
  );
};

export default AdminSalesReport;
