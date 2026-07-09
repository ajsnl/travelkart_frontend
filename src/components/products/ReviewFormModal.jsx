import React from "react";
import { X, Star, Loader2 } from "lucide-react";

export default function ReviewFormModal({
  showReviewForm,
  setShowReviewForm,
  editingReviewId,
  reviewFormRating,
  setReviewFormRating,
  reviewFormComment,
  setReviewFormComment,
  reviewSubmitLoading,
  handleReviewSubmit
}) {
  if (!showReviewForm) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h3 className="modal-title font-plus-jakarta">
            {editingReviewId ? "Edit Your Review" : "Share Your Experience"}
          </h3>
          <button onClick={() => setShowReviewForm(false)} className="modal-close-btn">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleReviewSubmit} className="review-form font-inter">
          <div className="form-group">
            <label className="form-label">Your Rating</label>
            <div className="star-rating-selector">
              {[1, 2, 3, 4, 5].map(starNum => (
                <button
                  key={starNum}
                  type="button"
                  onClick={() => setReviewFormRating(starNum)}
                  className={`star-select-btn ${starNum <= reviewFormRating ? "selected" : ""}`}
                >
                  <Star 
                    size={24} 
                    fill={starNum <= reviewFormRating ? "#fbbf24" : "none"} 
                    style={{ color: starNum <= reviewFormRating ? "#fbbf24" : "#cbd5e1" }} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Your Comments</label>
            <textarea
              value={reviewFormComment}
              onChange={(e) => setReviewFormComment(e.target.value)}
              className="comment-textarea"
              placeholder="Tell us about the durability, style, features, and how it holds up during travel..."
              required
            />
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              onClick={() => setShowReviewForm(false)} 
              className="btn-secondary"
              disabled={reviewSubmitLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={reviewSubmitLoading}
            >
              {reviewSubmitLoading ? (
                <>
                  <Loader2 className="spinner-icon animate-spin" size={14} />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
