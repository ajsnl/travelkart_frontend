import React from "react";
import { Edit3, Trash2 } from "lucide-react";

export default function ProductReviewCard({
  rev,
  user,
  isAuthenticated,
  renderStars,
  handleOpenEditReview,
  handleReviewDelete,
  handleAdminToggleStatus,
  handleAdminDelete
}) {
  return (
    <article className="review-card-layout">
      <div className="review-card-header-row">
        <div className="reviewer-avatar">
          {rev.user_profile_picture ? (
            <img 
              src={rev.user_profile_picture} 
              alt={rev.user_name} 
              style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} 
            />
          ) : (
            <span>{(rev.user_name || rev.user_email || "U")[0].toUpperCase()}</span>
          )}
        </div>
        <div className="reviewer-identity-column">
          <span className="reviewer-name">
            {rev.user_name || rev.user_email?.split('@')[0]}
            {user?.role === 'admin' && (
              <span className={`admin-badge ${rev.is_active ? 'active-review' : 'hidden-review'}`}>
                {rev.is_active ? 'Active' : 'Hidden'}
              </span>
            )}
          </span>
          <div className="reviewer-stars-rating">
            {renderStars(rev.rating, 11)}
          </div>
        </div>
        <span className="review-date-stamp">
          {new Date(rev.created_at).toLocaleDateString()}
        </span>
      </div>
      <p className="review-body-text">{rev.comment}</p>
      
      {/* Regular User CRUD actions */}
      {isAuthenticated && user?.email === rev.user_email && (
        <div className="review-card-action-row">
          <button 
            onClick={() => handleOpenEditReview(rev)} 
            className="review-action-btn"
            title="Edit Review"
          >
            <Edit3 size={14} />
          </button>
          <button 
            onClick={() => handleReviewDelete(rev.id)} 
            className="review-action-btn delete"
            title="Delete Review"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Admin Moderation Panel */}
      {user?.role === 'admin' && (
        <div className="admin-actions-bar">
          <button 
            onClick={() => handleAdminToggleStatus(rev.id, rev.is_active)} 
            className="admin-action-pill"
          >
            {rev.is_active ? "Hide" : "Activate"}
          </button>
          <button 
            onClick={() => handleAdminDelete(rev.id)} 
            className="admin-action-pill danger"
          >
            Delete Spam
          </button>
        </div>
      )}
    </article>
  );
}
