import { useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../css/HeritageHub.css";

// ==============================================
// ADD REVIEW PAGE - Community Contribution Feature
// Allows authenticated members to rate and review facilities
// Supports image upload via Multer (multipart/form-data)
// ==============================================

function AddReview() {
  const { facilityId } = useParams(); // Get facility ID from URL
  const { token, user, logout, timeoutMsg } = useContext(AuthContext) || {};

  // Review form state
  const [rating, setRating] = useState(5); // Default rating: 5 stars
  const [comment, setComment] = useState("");
  const [imageFile, setImageFile] = useState(null); // Optional photo upload

  const navigate = useNavigate();

  // Submit review with optional image to backend
  async function handleSubmit(e) {
    e.preventDefault();

    // Use FormData to handle both text and file upload
    const formData = new FormData();
    formData.append("facility", facilityId); // Link review to facility
    formData.append("rating", rating); // 1-5 star rating
    formData.append("comment", comment); // User's written review
    if (imageFile) formData.append("image", imageFile); // Optional photo (Multer handles this)

    try {
      const res = await fetch("http://localhost:5001/api/reviews", {
        method: "POST",
        headers: { Authorization: token }, // JWT required - members only
        body: formData, // Multipart form data for image upload
      });

      if (!res.ok) throw new Error("Failed to add review");
      // Redirect back to facility page to see new review
      navigate(`/facility/${facilityId}`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  return (
    <div className="heritage-home-wrapper">
      {/* ========== SHARED NAVIGATION BAR ========== */}
      <nav className="navbar">
        {timeoutMsg && <div className="timeout">{timeoutMsg}</div>}
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="logo-link">
              <div className="logo-icon">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10 Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="logo-text">
                Heritage<span className="logo-accent">Hub</span>
              </span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">
                Explore
              </Link>
              <Link to="/Map" className="nav-link">
                Map View
              </Link>
              <Link to="/bucket-list" className="nav-link">
                Bucket List
              </Link>
              <Link to="/travel-journal" className="nav-link">
                Travel Journal
              </Link>
              <Link to="/dashboard" className="nav-link">
                Manage
              </Link>
            </div>
          </div>
          <div className="nav-right">
            {!token ? (
              <Link to="/login" className="sign-in-btn">
                Sign In
              </Link>
            ) : (
              <div className="user-menu">
                <span className="user-greeting">
                  Hi, {user?.username || "User"}
                </span>
                <button onClick={logout} className="logout-btn">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ========== REVIEW SUBMISSION FORM ========== */}
      <div className="manage-container">
        <div className="elegant-form-container">
          <header className="form-header">
            <h2 className="form-title">Write a Review</h2>
            <p className="form-subtitle">
              Share your experience and photos from your visit.
            </p>
          </header>

          {/* Review form with image upload capability */}
          <form onSubmit={handleSubmit} className="elegant-form">
            <div className="form-grid">
              {/* RATING INPUT - Interactive slider (1-5 stars) */}
              <div className="form-group full-width">
                <label className="form-label">Rating (1-5 Stars)</label>
                <div className="rating-selector">
                  {/* Range slider for selecting rating */}
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="1"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="slider-input"
                  />
                  {/* Visual display of selected rating */}
                  <div className="rating-display">
                    <span className="rating-number">{rating}</span>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="#f59e0b"
                      stroke="#f59e0b"
                      strokeWidth="2"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* COMMENT TEXT AREA - Written review */}
              <div className="form-group full-width">
                <label className="form-label">Your Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="form-input textarea-input"
                  placeholder="Tell us what you loved about this facility..."
                  rows="5"
                  required
                />
              </div>

              {/* IMAGE UPLOAD - Optional photo from visit */}
              <div className="form-group full-width">
                <label className="form-label">Upload a Photo (Optional)</label>
                {/* File input - Multer middleware handles image storage */}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="file-input"
                />
                <small className="form-help-text">
                  Share a photo you took during your visit.
                </small>
              </div>
            </div>

            {/* FORM ACTIONS - Cancel or Submit */}
            <div
              className="form-actions"
              style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}
            >
              {/* Cancel button returns to facility page */}
              <Link to={`/facility/${facilityId}`} className="cancel-btn">
                Cancel
              </Link>
              {/* Submit creates review document in MongoDB */}
              <button
                type="submit"
                className="form-submit-btn"
                style={{ marginTop: "0", flex: 1 }}
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddReview;
