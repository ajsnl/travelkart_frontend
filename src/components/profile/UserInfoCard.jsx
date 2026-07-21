import React, { useRef } from "react";
import { Edit2 } from "lucide-react";
import { uploadProfileImage } from "../../services/authService";
import { toast } from "react-toastify";
import { BASE_URL } from "../../api/axios";

const UserInfoCard = ({ user, onEdit, refreshUser }) => {
  const fileInputRef = useRef();

  const getDisplayName = () => {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ""} ${user.last_name || ""}`.trim();
    }
    return user.username || "User";
  };

  const getProfilePictureUrl = () => {
    if (!user || !user.profile_picture) return "https://cdn-icons-png.flaticon.com/512/149/149071.png";
    let url = user.profile_picture;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
    }
    const ts = user.updated_at ? new Date(user.updated_at).getTime() : new Date().getTime();
    return `${url}?t=${ts}`;
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadProfileImage(file);
      toast.success("Profile picture updated ✅");
      refreshUser(); // 🔥 reload profile
    } catch (err) {
      console.error(err);
      toast.error("Upload failed ❌");
    }
  };

  return (
    <div className="profile-data-display-card font-inter">

      {/* 🔥 PROFILE IMAGE SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>

        <div style={{ position: "relative", cursor: "pointer", width: "90px", height: "90px" }} onClick={handleImageClick}>
          <img
            src={getProfilePictureUrl()}
            alt="profile"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #eee"
            }}
          />

          {/* small edit icon */}
          <div style={{
            position: "absolute",
            bottom: "2px",
            right: "2px",
            background: "#1E3A8A",
            color: "#fff",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px solid #fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.15)"
          }}>
            <Edit2 size={12} />
          </div>
        </div>

        <div>
          <h3 style={{ margin: 0 }}>{getDisplayName()}</h3>
          <p style={{ margin: 0, color: "#777" }}>{user.email}</p>
        </div>

        {/* hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      {/* 🔥 EXISTING INFO */}
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
      </div>
    </div>
  );
};

export default UserInfoCard;