import React from "react";
import { Edit2 } from "lucide-react";

const UserInfoCard = ({ user, onEdit }) => {
  const getDisplayName = () => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.username || "User";
  };

  return (
    <div className="profile-data-display-card font-inter">
      <div className="display-card-header">
        <h3 className="display-card-title">Personal Information</h3>
        <button className="display-card-edit-trigger" onClick={onEdit} title="Edit Profile">
          <Edit2 size={18} />
        </button>
      </div>

      <div className="personal-information-data-grid">
        <div className="data-node-block">
          <span className="data-node-label uppercase">Full Name</span>
          <span className="data-node-value">{getDisplayName()}</span>
        </div>

        <div className="data-node-block">
          <span className="data-node-label uppercase">Username</span>
          <span className="data-node-value">@{user.username}</span>
        </div>

        <div className="data-node-block">
          <span className="data-node-label uppercase">Email Address</span>
          <span className="data-node-value lowercase-text">{user.email}</span>
        </div>

        <div className="data-node-block">
          <span className="data-node-label uppercase">Phone Number</span>
          <span className={`data-node-value ${!user.phone ? "value-placeholder" : ""}`}>
            {user.phone || "Not added"}
          </span>
        </div>

        <div className="data-node-block">
          <span className="data-node-label uppercase">Date of Birth</span>
          <span className={`data-node-value ${!user.dob ? "value-placeholder" : ""}`}>
            {user.dob || "Not added"}
          </span>
        </div>

        <div className="data-node-block">
          <span className="data-node-label uppercase">Verification Status</span>
          <span className="data-node-value" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {(user.is_verified || user.is_social) ? (
              <span style={{ color: "var(--success-color)", fontWeight: 700 }}>✅ Verified</span>
            ) : (
              <span style={{ color: "var(--error-color)", fontWeight: 700 }}>❌ Unverified</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserInfoCard;