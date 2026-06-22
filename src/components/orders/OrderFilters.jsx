import React from "react";
import { Search } from "lucide-react";

export default function OrderFilters({ searchQuery, setSearchQuery, activeTab, setActiveTab }) {
  return (
    <section className="myorders-toolbar">
      <div className="search-bar-container">
        <Search size={18} className="search-bar-icon" />
        <input
          type="text"
          placeholder="Search orders by number or item..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar-input"
        />
      </div>

      <div className="status-tabs-container">
        {["ALL", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"].map((tab) => (
          <button
            key={tab}
            className={`status-tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  );
}
