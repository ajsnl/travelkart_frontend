import React, { useRef,useState } from "react";
import { Edit2,Loader2 } from "lucide-react";
import { uploadProfileImage } from "../../services/authService";
import { toast } from "react-toastify";
import { BASE_URL } from "../../api/axios";

const UserInfoCard = ({ user, onEdit, refreshUser }) => {
  const fileInputRef = useRef();
  const [uploading,setUploading]=useState(false);

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
    
    // Client-side Size Validation 
    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error("Image size exceeds 5MB limit. Please upload a smaller image. ❌");
      e.target.value = "";
      return;
    }
    // Client-side Format Validation 
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
    const fileExtension = file.name.split(".").pop().toLowerCase();
    const isImage = file.type.startsWith("image/");
    if (!isImage || !allowedExtensions.includes(fileExtension)) {
      toast.error("Unsupported file format. Please upload a JPG, PNG, or WEBP image. ❌");
      e.target.value = "";
      return;
    }

    try {
      setUploading(true);
      await uploadProfileImage(file);
      toast.success("Profile picture updated ✅");
      await refreshUser(); // 🔥 reload profile
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.profile_picture?.[0] || err.response?.data?.detail || "Upload failed ❌";
      toast.error(errMsg);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="profile-data-display-card font-inter">

      {/* 🔥 PROFILE IMAGE SECTION */}
      <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>

          <div 
          style={{ 
            position: "relative", 
            cursor: uploading ? "not-allowed" : "pointer", 
            width: "90px", 
            height: "90px" 
          }} 
          onClick={uploading ? null : handleImageClick}
        >
          <img
            src={getProfilePictureUrl()}
            alt="profile"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #eee",
              opacity: uploading ? 0.6 : 1,
              transition: "opacity 0.2s ease"
            }}
          />
          
          {/* loader overlay */}
          {uploading && (
            <div style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "90px",
              height: "90px",
              borderRadius: "50%",
              background: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2
            }}>
              <Loader2 className="animate-spin" style={{ color: "#fff" }} size={24} />
            </div>
          )}

          {/* small edit icon */}
          {!uploading && (
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
          )}
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