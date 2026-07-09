import React, { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, XCircle, Trash2, Star, Loader2 } from "lucide-react";
import { adminFetchReviews, adminToggleReviewStatus, adminDeleteReview } from "../../services/reviewService";
import { toast } from "react-toastify";

const AdminReviewManager = ({ product, onBack }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await adminFetchReviews(product.id);
      setReviews(res.data || []);
    } catch (err) {
      console.error("Error loading reviews for product:", err);
      toast.error("Failed to load product reviews.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      loadReviews();
    }
  }, [product]);

  const handleToggleStatus = async (reviewId, currentStatus) => {
    try {
      await adminToggleReviewStatus(reviewId, !currentStatus);
      toast.success(`Review ${currentStatus ? "hidden" : "activated"} successfully.`);
      loadReviews();
    } catch (err) {
      console.error("Error toggling status:", err);
      toast.error("Failed to update status.");
    }
  };

  const handleDeleteSpam = async (reviewId) => {
    if (!window.confirm("Are you sure you want to permanently delete this spam review?")) return;
    try {
      await adminDeleteReview(reviewId);
      toast.success("Review deleted permanently.");
      loadReviews();
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error("Failed to delete review.");
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={12}
          fill={i <= rating ? "#fbbf24" : "none"}
          style={{ color: i <= rating ? "#fbbf24" : "#cbd5e1" }}
        />
      );
    }
    return stars;
  };

  return (
    <>
      <div className="workspace-header-row product-header-flex">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={onBack}
            className="console-pagination-step-btn"
            style={{ border: '1px solid var(--admin-border-gray)', padding: '6px', cursor: 'pointer' }}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="workspace-title font-plus-jakarta">Review Moderation</h1>
            <span style={{ fontSize: '12px', color: 'var(--admin-text-dimmed)' }}>
              Managing reviews for: <strong>{product.name}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="table-card-frame" style={{ marginTop: '20px' }}>
        <table className="figma-dark-table font-inter">
          <thead>
            <tr>
              <th className="uppercase">Reviewer</th>
              <th className="uppercase">Rating</th>
              <th className="uppercase">Comment</th>
              <th className="uppercase">Date Submitted</th>
              <th className="uppercase">Status</th>
              <th className="uppercase text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="table-empty-row text-center">
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading reviews...</span>
                  </div>
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty-row text-center">
                  No reviews submitted for this product yet.
                </td>
              </tr>
            ) : (
              reviews.map((rev) => (
                <tr key={rev.id}>
                  {/* Reviewer email & name */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span className="product-cell-name">{rev.user_name || "User"}</span>
                      <span className="product-cell-slug" style={{ fontSize: '11px' }}>{rev.user_email}</span>
                    </div>
                  </td>

                  {/* Rating */}
                  <td>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {renderStars(rev.rating)}
                    </div>
                  </td>

                  {/* Comment */}
                  <td>
                    <div style={{ maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word', fontSize: '12px', lineHeight: '1.4' }}>
                      {rev.comment}
                    </div>
                  </td>

                  {/* Date Submitted */}
                  <td className="table-row-timestamp-text">
                    {new Date(rev.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>

                  {/* Status Toggle */}
                  <td>
                    <div 
                      className="status-toggle-wrapper" 
                      onClick={() => handleToggleStatus(rev.id, rev.is_active)}
                      title="Click to toggle review active status"
                      style={{ cursor: 'pointer' }}
                    >
                      <span className={`status-dot-indicator ${rev.is_active ? "dot-active" : "dot-suspended"}`} />
                      <span className={`status-label-node-text ${rev.is_active ? "text-active" : "text-suspended"}`}>
                        {rev.is_active ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td>
                    <div className="actions-cell-alignment-box product-actions-gap">
                      <button
                        onClick={() => handleToggleStatus(rev.id, rev.is_active)}
                        className="table-icon-action-btn edit-btn-style"
                        title={rev.is_active ? "Deactivate Review" : "Activate Review"}
                        style={{ color: rev.is_active ? "#ef4444" : "#10b981" }}
                      >
                        {rev.is_active ? <XCircle size={14} /> : <CheckCircle size={14} />}
                      </button>
                      <button
                        onClick={() => handleDeleteSpam(rev.id)}
                        className="table-icon-action-btn delete-btn-style"
                        title="Delete Spam Permanently"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AdminReviewManager;
