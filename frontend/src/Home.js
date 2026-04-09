import { useContext, useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./css/HeritageHub.css";

function Home() {
  const { token, user, logout, timeoutMsg } = useContext(AuthContext) || {};
  const [facility, setFacility] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFacilities = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
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

        setFacility(data.data || []);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
      } catch (err) {
        console.error("Error fetching facilities:", err);
      } finally {
        setLoading(false);
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

  return (
    <div className="heritage-home-wrapper">
      {/* Shared Navigation Bar */}
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
                  <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                  <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
              </div>
              <span className="logo-text">
                Heritage<span className="logo-accent">Hub</span>
              </span>
            </Link>
            <div className="nav-links">
              <Link
                to="/"
                className="nav-link active"
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
              {user && user.role === "admin" && (
                <Link
                  to="/admin-dashboard"
                  className="nav-link"
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

      {/* Elegant Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Discover Canada's Heritage</h1>
          <p className="hero-subtitle">
            Explore world-class museums, galleries, and historic sites from
            coast to coast, preserved for generations to come.
          </p>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="featured-destinations">
        <div className="featured-container">
          <div className="section-header">
            <h2 className="section-title">Featured Destinations</h2>
            <p className="section-description">
              Filter your journey and uncover cultural gems near you.
            </p>
          </div>

          {/* Elegant Filters */}
          <div className="filters-bar">
            <div className="filter-group">
              <label className="filter-label">Search</label>
              <div className="search-input-wrapper">
                <svg
                  className="search-icon-home"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
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
                className="filter-input"
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value.toLowerCase())
                }
              >
                <option value="All">All Categories</option>
                <option value="museum">Museum</option>
                <option value="gallery">Gallery</option>
                <option value="heritage or historic site">
                  Heritage or Historic Site
                </option>
                <option value="art or cultural centre">
                  Art or Cultural Centre
                </option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">City</label>
              <input
                type="text"
                className="filter-input"
                placeholder="e.g. Toronto"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label className="filter-label">Province</label>
              <select
                className="filter-input"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value="">Any Province</option>
                <option value="on">Ontario</option>
                <option value="qc">Quebec</option>
                <option value="bc">British Columbia</option>
                <option value="ab">Alberta</option>
                <option value="ns">Nova Scotia</option>
                <option value="nb">New Brunswick</option>
                <option value="nl">Newfoundland and Labrador</option>
                <option value="sk">Saskatchewan</option>
                <option value="mb">Manitoba</option>
                <option value="nu">Nunavut</option>
                <option value="yt">Yukon</option>
                <option value="nt">Northwest Territories</option>
              </select>
            </div>

            <div className="filter-group button-group">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setSelectedCity("");
                  setSelectedProvince("");
                }}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Grid Layout */}
          <div className="facilities-grid">
            {loading && facility.length === 0 ? (
              <div className="status-container">
                <div className="loader-spinner"></div>
                <p>Loading historical sites...</p>
              </div>
            ) : facility.length > 0 ? (
              facility.map((item) => (
                <Link
                  to={`/facility/${item._id}`}
                  key={item._id}
                  className="facility-card-home"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "instant" })
                  }
                >
                  <div className="card-image-box">
                    {/* show the last posted image from reviews */}
                    {item.lastReviewImage || item.Image ? (
                      <img
                        src={item.lastReviewImage || item.Image}
                        alt={item.Name}
                        className="card-image"
                      />
                    ) : (
                      <div className="card-placeholder">
                        {item.Category === "museum"
                          ? "🏛️"
                          : item.Category === "gallery"
                          ? "🖼️"
                          : item.Category === "heritage or historic site"
                          ? "🏛️"
                          : item.Category === "art or cultural centre"
                          ? "🎭"
                          : "📍"}
                      </div>
                    )}
                    <div className="card-rating">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="#f59e0b"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      {item.avgRating || item.Rating || "N/A"}
                    </div>
                  </div>

                  <div className="card-details">
                    <div className="card-meta">
                      <span className="card-category">
                        {item.Category || item.Type || "Heritage Site"}
                      </span>
                      <span className="card-location">
                        {item.City
                          ? item.City.toUpperCase()
                          : item.Location
                          ? item.Location.split(",")[0].toUpperCase()
                          : "CANADA"}
                      </span>
                    </div>
                    <h3 className="card-title">{item.Name}</h3>

                    <div className="card-footer">
                      <span className="explore-text">Explore Details</span>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14" />
                        <path d="m12 5 7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="status-container">
                <p>No facilities found matching your filters.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination-bar">
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="page-indicator">
              Page <strong>{currentPage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>
            <button
              className="page-btn"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
