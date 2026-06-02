import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  Search, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Bell,
  Radio,
  Award,
  Ticket,
  Flag
} from "lucide-react";
import { fetchUsers, toggleUserStatus } from "../services/adminService";
import { logoutUser } from "../services/authService";
import TravelKartLogoMain from "../components/brand/TravelKartLogoMain";
import "./AdminDashboard.css";

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [filter, setFilter] = useState("");
  const [goldFilter, setGoldFilter] = useState("");
  const [stats, setStats] = useState({
    total_members: 4821,
    total_gold_members: 1204,
    total_active_members: 3828,
    unverified_users: 14,
  });

  const loadUsers = async () => {
    try {
      const res = await fetchUsers({
        search,
        page,
        is_active: filter,
        is_gold: goldFilter,
      });
      setUsers(res.data.results);
      setCount(res.data.count);
      if (res.data.stats) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error("Error loading administration data tree:", err);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, filter, goldFilter]);

  useEffect(() => {
    loadUsers();
  }, [search, page, filter, goldFilter]);

  const handleToggle = async (id) => {
    const confirmAction = window.confirm("Are you sure you want to change this user's account execution status?");
    if (!confirmAction) return;

    await toggleUserStatus(id);
    loadUsers();
  };

  // Helper calculation metrics to display ranges accurately
  const startItemRange = (page - 1) * 10 + 1;
  const endItemRange = Math.min(page * 10, count);

  return (
    <div className="admin-viewport font-inter select-none antialiased">
      
      {/* ELITE GLOBAL TOP NAVIGATION BAR CONTAINER */}
      <header className="admin-global-navbar">
        <div className="navbar-left-brand-wrapper">
          <div className="brand-logo-frame">
            <TravelKartLogoMain className="w-8 h-8" color="#3B82F6" accentColor="#FF8F4F" />
          </div>
          <div className="global-search-container">
            <Search className="search-icon-inside" size={16} />
            <input 
              type="text"
              placeholder="Search elite members or logistics IDs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="navbar-search-input"
            />
          </div>
        </div>

        <div className="navbar-right-utilities">
          <button className="navbar-notification-trigger" aria-label="Notifications system">
            <Bell size={18} />
          </button>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                logoutUser(navigate);
              }
            }}
            className="navbar-logout-btn"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* CORE FRAME LAYOUT WIDTH BOX */}
      <main className="admin-container">
        
        {/* Workspace Structural Section Title Header */}
        <div className="workspace-header-row">
          <h1 className="workspace-title font-plus-jakarta">User Management</h1>
        </div>

        {/* METRIC SUMMATION SCOREBOARDS GRID */}
        <div className="stats-grid">
          
          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper total-icon-bg">
                <Radio size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Total Members</span>
            <span className="stat-value font-plus-jakarta">{stats.total_members.toLocaleString()}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper gold-icon-bg">
                <Award size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Gold Members</span>
            <span className="stat-value font-plus-jakarta">{stats.total_gold_members.toLocaleString()}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper active-icon-bg">
                <Ticket size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Active Members</span>
            <span className="stat-value font-plus-jakarta">{stats.total_active_members.toLocaleString()}</span>
          </div>

          <div className="stat-card">
            <div className="stat-card-row">
              <div className="stat-icon-wrapper unverified-icon-bg">
                <Flag size={18} />
              </div>
            </div>
            <span className="stat-label uppercase font-inter">Unverified Users</span>
            <span className="stat-value font-plus-jakarta">{stats.unverified_users.toLocaleString()}</span>
          </div>

        </div>

        {/* LOGISTICS CONTROLS AND CUSTOM DROP FILTERS ROW BAR */}
        <div className="controls-bar-row">
          <div className="filter-select-wrapper">
            <SlidersHorizontal size={14} className="filter-leading-icon" />
            <select
              value={goldFilter}
              onChange={(e) => setGoldFilter(e.target.value)}
              className="custom-filter-dropdown font-inter"
            >
              <option value="">All Membership Tiers</option>
              <option value="true">Gold Elite</option>
              <option value="false">Standard</option>
            </select>
          </div>

          <div className="filter-select-wrapper">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="custom-filter-dropdown font-inter"
            >
              <option value="">Any Account Status</option>
              <option value="true">Active</option>
              <option value="false">Suspended</option>
            </select>
          </div>
        </div>

        {/* CORE DATA TABLE MODULE WRAPPER */}
        <div className="table-card-frame">
          <table className="figma-dark-table font-inter">
            <thead>
              <tr>
                <th className="uppercase">User Profile</th>
                <th className="uppercase">Join Date</th>
                <th className="uppercase">Membership Tier</th>
                <th className="uppercase">Account Status</th>
                <th className="uppercase text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-row text-center font-inter">
                    No matching users mapped within data registry clusters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    
                    {/* User Profile Info Composite Block Column */}
                    <td>
                      <div className="profile-composite-block">
                        <div className="profile-avatar-frame">
                          {u.avatar ? (
                            <img src={u.avatar} alt="User Avatar Display" className="avatar-img-source" />
                          ) : (
                            <div className="avatar-placeholder-initials">
                            {(u.full_name || u.username || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="profile-meta-stack">
                          <span className="profile-row-fullname font-inter">{u.full_name || u.username}</span>
                          <span className="profile-row-email-anchor">{u.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Join Date Column */}
                    <td className="table-row-timestamp-text">
                      {formatDate(u.date_joined)}
                    </td>

                    {/* Membership Level Badge Column */}
                    <td>
                      <span className={`tier-badge-node ${u.is_gold_member ? "tier-gold" : "tier-standard"}`}>
                        {u.is_gold_member ? "Gold Elite" : "Standard"}
                      </span>
                    </td>

                    {/* Account Status Badge Column */}
                    <td>
                      <div className="status-indicator-node-wrapper">
                        <span className={`status-dot-indicator ${u.is_active ? "dot-active" : "dot-suspended"}`} />
                        <span className={`status-label-node-text ${u.is_active ? "text-active" : "text-suspended"}`}>
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </td>

                    {/* Actions Context Trigger Button Column */}
            {/* Actions Context Trigger Button Column */}
                    <td>
                    <div className="actions-cell-alignment-box">
                        <button
                        onClick={() => handleToggle(u.id)}
                        className={`table-action-toggle-btn ${u.is_active ? "action-suspend" : "action-activate"}`}
                        title={u.is_active ? "Suspend User Account" : "Activate User Account"}
                        >
                        {u.is_active ? (
                            <>
                            <span className="action-btn-text">Suspend</span>
                            </>
                        ) : (
                            <>
                            <span className="action-btn-text">Activate</span>
                            </>
                        )}
                        </button>
                    </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* METRIC ADVANCEMENT PAGINATION CORE CONSOLE */}
          <footer className="table-pagination-footer-console font-inter">
            <div className="pagination-range-counter-info">
              Showing <span className="text-white-weight">{count === 0 ? 0 : startItemRange}-{endItemRange}</span> of <span className="text-white-weight">{count.toLocaleString()}</span> users
            </div>

            <div className="pagination-action-controls-button-group">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="console-pagination-step-btn"
                aria-label="Previous Data Row Page"
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
                aria-label="Next Data Row Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </footer>
        </div>

      </main>

      {/* FOOTER COOLDOWN BRAND ANCHOR */}
      <footer className="admin-footer-branding font-inter">
        <span>© 2026 TravelKart. All Rights Reserved.</span>
      </footer>

    </div>
  );
};

export default AdminDashboard;