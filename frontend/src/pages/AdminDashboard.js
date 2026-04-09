import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";
import "../css/HeritageHub.css";

function AdminDashboard() {
  const { token, user, logout, timeoutMsg } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  // Initialize useState for dashboard navigation
  const [currentView, setCurrentView] = useState("facilities");
  const [editMenu, setEditMenu] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Initialize facilityData and specify attributes/inputs that can be filled under it
  const [facilityData, setFacilityData] = useState({
    Name: "",
    Category: "",
    Province: "",
    City: "",
    Address: "",
    Latitude: "",
    Longitude: "",
  });

  // Backup security - redirect user out if they aren't admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchFacilities = useCallback(
    async (page = 1) => {
      setLoadingFacilities(true);
      try {
        const query = new URLSearchParams({
          page,
          limit: 9, //number of facilities per page
          searchTerm: searchTerm,
          Category: selectedCategory === "All" ? "" : selectedCategory,
          City: selectedCity,
          Province: selectedProvince,
        });

        const res = await fetch(
          `http://localhost:5001/api/facility?${query.toString()}`
        );

        const data = await res.json();

        setFacilities(data.data);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (err) {
        console.error("Error fetching facilities:", err);
      } finally {
        setLoadingFacilities(false);
      }
    },
    [searchTerm, selectedCategory, selectedCity, selectedProvince]
  ); //refetch if a filter changes

  //fetch when page changes
  useEffect(() => {
    fetchFacilities(currentPage);
  }, [currentPage, fetchFacilities]);

  //reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedCity, selectedProvince]);

  //search reset
  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      //reset to first page after user stops typing in search
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  useEffect(() => {
    if (!token) return;
    if (currentView !== "users") return;
    setLoadingUsers(true);
    fetch("http://localhost:5001/api/users", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.user))
      .catch((err) => console.error("Error fetching users:", err))
      .finally(() => setLoadingUsers(false));
  }, [token, currentView]);

  useEffect(() => {
    if (!token) return;
    if (currentView !== "reviews") return;
    setLoadingReviews(true);
    fetch("http://localhost:5001/api/reviews", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => setReviews(data.review))
      .catch((err) => console.error("Error fetching reviews:", err))
      .finally(() => setLoadingReviews(false));
  }, [token, currentView]);

  const handleDeleteFacility = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/facility/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }
      setFacilities(facilities.filter((facility) => facility._id !== id));
      // Update reviews in case there were some under that facility that deleted too
      setReviews(reviews.filter((review) => review.facility?._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }
      setUsers(users.filter((user) => user._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleDeleteReview = async (id) => {
    try {
      const response = await fetch(`http://localhost:5001/api/reviews/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }
      setReviews(reviews.filter((review) => review._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleRole = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/${id}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      const data = await response.json();
      // Update the UI right away
      setUsers(
        users.map((u) => (u._id === id ? { ...u, role: data.user.role } : u))
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // onSubmit, applies this function. Prevents reload behaviour, applies facilityData
  async function handleFacilitySubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5001/api/facility/${editMenu}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          // Apply to the fields that may need to be changed
          body: JSON.stringify({
            Name: facilityData.Name,
            Category: facilityData.Category,
            Province: facilityData.Province,
            City: facilityData.City,
            Address: facilityData.Address,
            Latitude: Number(facilityData.Latitude),
            Longitude: Number(facilityData.Longitude),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update facility");
      }
      const updatedFacility = await response.json();
      // Update the UI right away
      setFacilities(
        facilities.map((facility) =>
          facility._id === editMenu ? updatedFacility : facility
        )
      );
      // Close editMenu
      setEditMenu(null);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  // When user interacts with edit facility inputs, set the facilityData attribute to match the value
  const handleEditFacility = (e) => {
    const { name, value } = e.target;
    setFacilityData({
      ...facilityData,
      [name]: value,
    });
  };

  return (
    <div className="heritage-home-wrapper">
      {/* Shared Nav Bar */}
      <nav className="navbar">
        {timeoutMsg && <div className="timeout">{timeoutMsg}</div>}
        <div className="nav-container">
          <div className="nav-left">
            <Link
              to="/"
              className="logo-link"
              onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
            >
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
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16.2 7.8l-2 6.3-6.4 2.1 2-6.3z" />
                </svg>
              </div>
              <span className="logo-text">
                Heritage<span className="logo-accent">Hub</span>
              </span>
            </Link>
            <div className="nav-links">
              <Link
                to="/"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Explore
              </Link>
              <Link
                to="/Map"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Map View
              </Link>
              <Link
                to="/bucket-list"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Bucket List
              </Link>
              <Link
                to="/travel-journal"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Travel Journal
              </Link>
              <Link
                to="/dashboard"
                className="nav-link"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
                Manage
              </Link>
              {/* Nav link to admin panel. Only visible if user is present and role is admin */}
              {user && user.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="nav-link active"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "instant" })
                  }
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          <div className="nav-right">
            {!token ? (
              <Link
                to="/login"
                className="sign-in-btn"
                onClick={() => window.scrollTo({ top: 0, behavior: "instant" })}
              >
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

      {/* Main Admin Dashboard Content */}
      <div className="manage-container">
        <div className="manage-header">
          <h1 className="manage-title">Admin Dashboard</h1>
          <p className="manage-subtitle">
            Manage platform facilities, users, and reviews.
          </p>
        </div>

        {/* View Selection Tabs */}
        <div className="filter-chips" style={{ marginBottom: "2rem" }}>
          <button
            className={`chip ${
              currentView === "facilities" ? "active" : "outline"
            }`}
            onClick={() => setCurrentView("facilities")}
          >
            View Facilities
          </button>
          <button
            className={`chip ${currentView === "users" ? "active" : "outline"}`}
            onClick={() => setCurrentView("users")}
          >
            View Users
          </button>
          <button
            className={`chip ${
              currentView === "reviews" ? "active" : "outline"
            }`}
            onClick={() => setCurrentView("reviews")}
          >
            View Reviews
          </button>
        </div>

        {/* Facilities Grid */}
        {currentView === "facilities" && (
          <div>
            {/* Filters */}
            <div className="filters-bar">
              <div className="filter-group">
                <label className="filter-label">Search</label>
                <div className="search-input-wrapper">
                  <svg
                    className="search-icon-home"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                  <input
                    type="text"
                    className="filter-input with-icon"
                    placeholder="Search facilities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="filter-label">Category</label>
                <select
                  name="Category"
                  className="filter-input"
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value.toLowerCase())
                  }
                >
                  <option value={""}>All Categories</option>
                  <option value={"museum"}>Museum</option>
                  <option value={"gallery"}>Gallery</option>
                  <option value={"heritage or historic site"}>
                    Heritage or Historic Site
                  </option>
                  <option value={"art or cultural centre"}>
                    Art or Cultural Centre
                  </option>
                  <option value={"other"}>Other</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="filter-label">City</label>
                <input
                  type="text"
                  className="filter-input"
                  placeholder="City..."
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="filter-label">Province/Territory</label>
                <select
                  name="province"
                  className="filter-input"
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value={""}>All Provinces</option>
                  <option value={"on"}>Ontario</option>
                  <option value={"qc"}>Quebec</option>
                  <option value={"bc"}>British Columbia</option>
                  <option value={"ab"}>Alberta</option>
                  <option value={"ns"}>Nova Scotia</option>
                  <option value={"nb"}>New Brunswick</option>
                  <option value={"nl"}>Newfoundland and Labrador</option>
                  <option value={"sk"}>Saskatchewan</option>
                  <option value={"mb"}>Manitoba</option>
                  <option value={"nu"}>Nunavut</option>
                  <option value={"yt"}>Yukon</option>
                  <option value={"nt"}>Northwest Territories</option>
                </select>
              </div>

              <div className="filter-group button-group">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedCity("");
                    setSelectedProvince("");
                  }}
                  className="clear-filters-btn"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            <div className="manage-grid">
              {loadingFacilities ? (
                <div className="status-container">
                  <div className="loader-spinner"></div>
                  <p>Loading facilities...</p>
                </div>
              ) : facilities.length > 0 ? (
                facilities.map((facility) => (
                  <div key={facility._id} className="manage-card-wrapper">
                    <Link
                      to={`/facility/${facility._id}`}
                      style={{ textDecoration: "none" }}
                      onClick={() =>
                        window.scrollTo({ top: 0, behavior: "instant" })
                      }
                      className="facility-card-home"
                    >
                      <div className="card-image-box">
                        {facility.lastReviewImage ? (
                          <img
                            src={facility.lastReviewImage}
                            alt={facility.Name}
                            className="card-image"
                          />
                        ) : (
                          <div className="card-placeholder">
                            {facility.Category === "museum"
                              ? "🏺"
                              : facility.Category === "gallery"
                              ? "🖼️"
                              : facility.Category ===
                                "heritage or historic site"
                              ? "🏛️"
                              : facility.Category === "art or cultural centre"
                              ? "🎭"
                              : "📍"}
                          </div>
                        )}
                      </div>
                      <div className="card-details">
                        <div className="card-meta">
                          <span className="card-category">
                            {facility.Category || "Other"}
                          </span>
                          <span className="card-location">
                            {facility.City?.toUpperCase()}
                            {facility.City && facility.Province && ", "}
                            {facility.Province?.toUpperCase()}
                          </span>
                        </div>
                        <h3 className="card-title">{facility.Name}</h3>
                      </div>
                    </Link>

                    <div className="manage-actions">
                      <button
                        onClick={() => {
                          setEditMenu(
                            editMenu === facility._id ? null : facility._id
                          );
                          setFacilityData(facility);
                        }}
                        className="manage-edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteFacility(facility._id)}
                        className="manage-delete-btn"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Inline Edit Menu */}
                    {editMenu === facility._id && (
                      <div
                        className="inline-edit-form"
                        style={{ marginTop: "1rem" }}
                      >
                        <h4 className="form-heading">Edit Facility</h4>
                        <form
                          onSubmit={handleFacilitySubmit}
                          className="elegant-form"
                        >
                          <div className="form-grid">
                            <div className="form-group full-width">
                              <label className="form-label">
                                Facility Name
                              </label>
                              <input
                                className="form-input"
                                name="Name"
                                value={facilityData.Name}
                                onChange={handleEditFacility}
                                required
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Category</label>
                              <select
                                className="form-input"
                                name="Category"
                                value={facilityData.Category}
                                onChange={handleEditFacility}
                              >
                                <option value={""}></option>
                                <option value={"museum"}>Museum</option>
                                <option value={"gallery"}>Gallery</option>
                                <option value={"heritage or historic site"}>
                                  Heritage or Historic Site
                                </option>
                                <option value={"art or cultural centre"}>
                                  Art or Cultural Centre
                                </option>
                                <option value={"other"}>Other</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label">
                                Province/Territory
                              </label>
                              <select
                                className="form-input"
                                name="Province"
                                value={facilityData.Province}
                                onChange={handleEditFacility}
                              >
                                <option value={""}></option>
                                <option value={"on"}>Ontario</option>
                                <option value={"qc"}>Quebec</option>
                                <option value={"bc"}>British Columbia</option>
                                <option value={"ab"}>Alberta</option>
                                <option value={"ns"}>Nova Scotia</option>
                                <option value={"nb"}>New Brunswick</option>
                                <option value={"nl"}>
                                  Newfoundland and Labrador
                                </option>
                                <option value={"sk"}>Saskatchewan</option>
                                <option value={"mb"}>Manitoba</option>
                                <option value={"nu"}>Nunavut</option>
                                <option value={"yt"}>Yukon</option>
                                <option value={"nt"}>
                                  Northwest Territories
                                </option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label className="form-label">City</label>
                              <input
                                className="form-input"
                                name="City"
                                value={facilityData.City}
                                onChange={handleEditFacility}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Address</label>
                              <input
                                className="form-input"
                                name="Address"
                                value={facilityData.Address}
                                onChange={handleEditFacility}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Latitude</label>
                              <input
                                className="form-input"
                                name="Latitude"
                                value={facilityData.Latitude}
                                onChange={handleEditFacility}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Longitude</label>
                              <input
                                className="form-input"
                                name="Longitude"
                                value={facilityData.Longitude}
                                onChange={handleEditFacility}
                              />
                            </div>
                          </div>
                          <button type="submit" className="form-submit-btn">
                            Submit Changes
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="status-container">
                  <p>No facilities found.</p>
                </div>
              )}
            </div>

            <div className="pagination-bar">
              <button
                className="page-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <span className="page-indicator">
                Page <strong>{currentPage}</strong> of{" "}
                <strong>{totalPages}</strong>
              </span>
              <button
                className="page-btn"
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Users Grid */}
        {currentView === "users" && (
          <div className="manage-grid">
            {loadingUsers ? (
              <div className="status-container">
                <div className="loader-spinner"></div>
                <p>Loading users...</p>
              </div>
            ) : users.length > 0 ? (
              users.map((user) => (
                <div key={user._id} className="manage-card-wrapper">
                  <div
                    className="facility-card-home"
                    style={{ height: "auto" }}
                  >
                    <div className="card-details">
                      <h3
                        className="card-title"
                        style={{ marginBottom: "1rem" }}
                      >
                        {user.username}
                      </h3>
                      <div
                        style={{
                          fontFamily: "-apple-system, sans-serif",
                          fontSize: "0.95rem",
                          color: "#5b6778",
                          lineHeight: "1.6",
                        }}
                      >
                        <div>
                          <strong>Email:</strong> {user.email}
                        </div>
                        <div>
                          <strong>Role:</strong> {user.role}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="manage-actions">
                    <button
                      onClick={() => handleRole(user._id)}
                      className="manage-edit-btn"
                    >
                      Make {user.role === "admin" ? "Member" : "Admin"}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="manage-delete-btn"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="status-container">
                <p>No users found.</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Grid */}
        {currentView === "reviews" && (
          <div className="manage-grid">
            {loadingReviews ? (
              <div className="status-container">
                <div className="loader-spinner"></div>
                <p>Loading reviews...</p>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review._id} className="manage-card-wrapper">
                  <div
                    className="facility-card-home"
                    style={{ height: "auto", padding: "1.5rem" }}
                  >
                    <div
                      className="review-meta"
                      style={{ marginBottom: "0.8rem", alignItems: "center" }}
                    >
                      <div
                        className="review-author"
                        style={{ fontSize: "0.95rem", color: "#6b8e78" }}
                      >
                        <strong>Facility:</strong>{" "}
                        {review.facility?.Name || "Deleted Facility"}
                      </div>
                      <div
                        className="review-rating"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        <svg
                          className="star-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        {review.rating}/5
                      </div>
                    </div>

                    <p
                      className="review-comment"
                      style={{
                        fontStyle: "italic",
                        color: "#1e382b",
                        margin: 0,
                      }}
                    >
                      "{review.comment}"
                    </p>
                  </div>

                  <div className="manage-actions">
                    <button
                      onClick={() => handleDeleteReview(review._id)}
                      className="manage-delete-btn"
                      style={{ width: "100%", flex: "none" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="status-container">
                <p>No reviews found.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
