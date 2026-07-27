import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchWalletDetails } from "../services/walletService";
import "./WalletHistory.css";

const WalletHistory = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Filters State
  const [filterType, setFilterType] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const loadWallet = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await fetchWalletDetails(filters);
      setBalance(parseFloat(res.data.balance));
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error("Failed to fetch wallet details:", err);
      toast.error("Failed to load wallet balance.");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch transactions whenever filters change
  useEffect(() => {
    loadWallet({
      type: filterType,
      startDate: filterStartDate,
      endDate: filterEndDate
    });
    setCurrentPage(1); // reset to page 1 on filter changes
  }, [filterType, filterStartDate, filterEndDate]);

  const clearFilters = () => {
    setFilterType("");
    setFilterStartDate("");
    setFilterEndDate("");
    setCurrentPage(1);
  };

  // Calculate pagination values
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pag-num-btn ${activePage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="wallet-pagination-container font-inter">
        <button
          disabled={activePage === 1}
          onClick={() => handlePageChange(activePage - 1)}
          className="wallet-pag-arrow-btn"
        >
          &lt; Previous
        </button>
        <div className="wallet-pag-numbers">
          {pages}
        </div>
        <button
          disabled={activePage === totalPages}
          onClick={() => handlePageChange(activePage + 1)}
          className="wallet-pag-arrow-btn"
        >
          Next &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="wallet-history-page-wrapper">
      <Navbar />

      <main className="wallet-history-container font-inter">
        {/* Header Breadcrumbs */}
        <header className="wallet-history-header">
          <button className="btn-back-link" onClick={() => navigate("/profile")} title="Back to Profile">
            <ArrowLeft size={18} />
          </button>
          <div className="wallet-history-title-block">
            <span style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: "700", letterSpacing: "1px", color: "#64748B" }}>
              My Account / Wallet
            </span>
            <h1 className="font-plus-jakarta">Wallet History</h1>
          </div>
        </header>

        <div className="wallet-history-grid">
          {/* Left Column: Wallet Balance Card */}
          <section className="wallet-balance-card-section">
            <div className="wallet-history-balance-card">
              <div className="balance-info-stack">
                <span className="balance-label uppercase">Current Balance</span>
                <h2 className="balance-value">
                  ₹{loading ? "..." : balance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h2>
                <p className="balance-subtext">Securely stored and ready for your next checkout.</p>
              </div>
              <div className="balance-icon-container">
                <Wallet size={24} />
              </div>
            </div>
          </section>

          {/* Right Column: Transactions & Filters */}
          <section className="wallet-transactions-section">
            <div className="wallet-history-card">
              <div className="wallet-card-header-row">
                <h3 className="section-subtitle font-plus-jakarta">Transaction Records</h3>
              </div>

              {/* FILTER CONTROLS */}
              <div className="wallet-filters-row font-inter">
                <div className="filter-input-group">
                  <label className="filter-label">Transaction Type</label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Types</option>
                    <option value="CREDIT">Credits (Refunds/Added)</option>
                    <option value="DEBIT">Debits (Payments)</option>
                  </select>
                </div>
                
                <div className="filter-input-group">
                  <label className="filter-label">From Date</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                    className="filter-date-input"
                  />
                </div>

                <div className="filter-input-group">
                  <label className="filter-label">To Date</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                    className="filter-date-input"
                  />
                </div>

                {(filterType || filterStartDate || filterEndDate) && (
                  <button onClick={clearFilters} className="btn-clear-filters">
                    Clear Filters
                  </button>
                )}
              </div>

              {/* TRANSACTIONS LIST */}
              <div className="transactions-list-wrapper">
                {loading && transactions.length === 0 ? (
                  <div className="wallet-loading-state">
                    <p>Loading transactions...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="wallet-empty-state">
                    <p>No transaction history matches your criteria.</p>
                    {(filterType || filterStartDate || filterEndDate) && (
                      <button onClick={clearFilters} className="btn-reset-empty">
                        Reset Filters
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="transactions-table">
                    <div className="table-header">
                      <div className="col-desc">Description / Reference</div>
                      <div className="col-date">Date & Time</div>
                      <div className="col-type">Type</div>
                      <div className="col-amount text-right">Amount</div>
                    </div>
                    
                    <div className="table-body animate-fade-in">
                      {paginatedTransactions.map((t) => (
                        <div key={t.id} className="table-row">
                          <div className="col-desc font-inter">
                            <div className="transaction-icon-meta-row">
                              <div className={`txn-icon-circle ${t.transaction_type === "CREDIT" ? "credit" : "debit"}`}>
                                {t.transaction_type === "CREDIT" ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                              </div>
                              <span className="txn-reason-title">{t.reason}</span>
                            </div>
                          </div>
                          <div className="col-date text-muted font-inter">
                            {new Date(t.created_at).toLocaleString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                          <div className="col-type font-inter">
                            <span className={`badge-type ${t.transaction_type === "CREDIT" ? "credit" : "debit"}`}>
                              {t.transaction_type === "CREDIT" ? "Refund / Deposit" : "Order Payment"}
                            </span>
                          </div>
                          <div className={`col-amount text-right font-inter bold ${t.transaction_type === "CREDIT" ? "credit-color" : "debit-color"}`}>
                            {t.transaction_type === "CREDIT" ? "+" : "-"}₹{parseFloat(t.amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Render pagination below list */}
                {renderPagination()}
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WalletHistory;
