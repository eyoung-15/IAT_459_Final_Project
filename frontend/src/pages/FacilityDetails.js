import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/HeritageHub.css";

function FacilityDetails() {
  const { id } = useParams();
  const [facility, setFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const { token, user, logout, timeoutMsg } = useContext(AuthContext);
  const [inBucket, setInBucket] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [visitedDate, setVisitedDate] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5001/api/facility/${id}`)
      .then((res) => res.json())
      .then((data) => setFacility(data))
      .catch((err) => console.error("Error fetching facilities:", err))
      .finally(() => setLoading(false));

    fetch(`http://localhost:5001/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, [id]);

  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:5001/api/users/me", {
      headers: { "Content-Type": "application/json", Authorization: token },
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user;
        setInBucket(user.bucketList.some((f) => f._id.toString() === id));
        setIsVisited(user.visited.some((v) => v.facility._id === id));
      });
  }, [token, id]);

  const toggleBucket = async () => {
    const method = inBucket ? "DELETE" : "POST";
    await fetch(`http://localhost:5001/api/users/bucket/${id}`, {
      method,
      headers: { "Content-Type": "application/json", Authorization: token },
    }).then(() => setInBucket(!inBucket));
  };

  const toggleVisited = async () => {
    try {
      if (isVisited) {
        await fetch(`http://localhost:5001/api/users/visited/${id}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json", Authorization: token },
        });
        setIsVisited(false);
      } else {
        const dateToSend = visitedDate ? new Date(visitedDate) : new Date();
        await fetch(`http://localhost:5001/api/users/visited/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({ visitedAt: dateToSend }),
        });
        setIsVisited(true);
        setInBucket(false);
        setVisitedDate("");
      }
    } catch (err) {
      console.error("Toggle visited failed:", err);
    }
  };

  const markerIcon = new L.Icon({
    iconUrl: require("../../src/images/marker.png"),
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -26],
  });

  const deleteReview = async (id) => {
    try {
      const res = await fetch(`http://localhost:5001/api/reviews/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!res.ok) throw new Error("Failed to delete. Are you authorized?");
      setReviews(reviews.filter((r) => r._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  function capitalizeWords(str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  const provinceMap = {
    ab: "Alberta",
    bc: "British Columbia",
    mb: "Manitoba",
    nb: "New Brunswick",
    nl: "Newfoundland and Labrador",
    ns: "Nova Scotia",
    nt: "Northwest Territories",
    nu: "Nunavut",
    on: "Ontario",
    pe: "Prince Edward Island",
    qc: "Quebec",
    sk: "Saskatchewan",
    yt: "Yukon",
  };
  function getProvinceName(code) {
    return provinceMap[code?.toLowerCase()] || code;
  }

  if (loading || !facility) {
    return (
      <div className="heritage-home-wrapper">
        <div className="status-container">
          <div className="loader-spinner"></div>
          <p>
            {loading ? "Loading facility details..." : "No facility found."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="heritage-home-wrapper">
      {/* Shared Navigation Bar */}
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
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
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

      <div className="details-container">
        {/* Main Details Section */}
        <div className="details-header">
          <div className="details-meta">
            <span className="details-category">
              {capitalizeWords(facility.Category)}
            </span>
            <span className="details-location">
              {capitalizeWords(facility.City)},{" "}
              {getProvinceName(facility.Province)}
            </span>
          </div>
          <h1 className="details-title">{facility.Name}</h1>
          <p className="details-address">{capitalizeWords(facility.Address)}</p>

          {/* User Action Buttons */}
          {token && (
            <div className="details-actions">
              <button
                onClick={toggleBucket}
                disabled={isVisited}
                className={`action-btn ${inBucket ? "active" : ""}`}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill={inBucket ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
                {inBucket ? "Saved to Bucket List" : "Add to Bucket List"}
              </button>

              <div className="visited-action-group">
                <button
                  onClick={toggleVisited}
                  className={`action-btn visited-btn ${
                    isVisited ? "active" : ""
                  }`}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {isVisited ? "Visited" : "Mark as Visited"}
                </button>
                {!isVisited && (
                  <input
                    type="date"
                    value={visitedDate}
                    onChange={(e) => setVisitedDate(e.target.value)}
                    className="date-input"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Map Section */}
        {facility.Latitude && facility.Longitude && (
          <div className="details-map-container">
            <MapContainer
              center={[facility.Latitude, facility.Longitude]}
              zoom={12}
              className="leaflet-container"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker
                position={[facility.Latitude, facility.Longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <b>{facility.Name}</b>
                  <br />
                  {facility.Address}
                </Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        {/* Reviews Section */}
        <div className="reviews-section">
          <div className="reviews-header">
            <h2 className="reviews-title">Visitor Reviews</h2>
            {token && (
              <Link
                to={`/add-review/${facility._id}`}
                className="add-review-btn"
              >
                Write a Review
              </Link>
            )}
          </div>

          <div className="reviews-list">
            {reviews.length === 0 ? (
              <p className="no-reviews">
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              reviews.map((r) => (
                <div key={r._id} className="review-card">
                  <div className="review-meta">
                    <span className="review-author">{r.user.username}</span>
                    <span className="review-rating">★ {r.rating}/5</span>
                  </div>
                  <p className="review-comment">{r.comment}</p>
                  {r.image && (
                    <img src={r.image} alt="Review" className="review-image" />
                  )}
                  {(user?.role === "admin" || user?.id === r.user._id) && (
                    <button
                      onClick={() => deleteReview(r._id)}
                      className="delete-review-btn"
                    >
                      Delete Review
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacilityDetails;
