import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./css/HeritageHub.css";
import { useCallback } from "react";

function Home() {
  const { token, user, logout } = useContext(AuthContext);
  const [facility, setFacility] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFacilities = useCallback(
    async (page = 1) => {
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
          `http://localhost:5000/api/facility?${query.toString()}`,
        );

        const data = await res.json();

        setFacility(data.data);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (err) {
        console.error("Error fetching facilities:", err);
      }
    },
    [searchTerm, selectedCategory, selectedCity, selectedProvince],
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
    <div className="heritage-hub">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-left">
            <Link to="/" className="logo">
              Heritage<span>Hub</span>
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link active">
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
              {/* Nav link to admin panel. Only visible if user is present and role is admin */}
              {user && user.role === "admin" && (
                <Link to="/admin-dashboard" className="nav-link">
                  Admin
                </Link>
              )}
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

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Discover Canada's Heritage</h1>
          <p className="hero-subtitle">
            Explore world-class museums, galleries and historic sites from coast
            to coast
          </p>
        </div>
      </section>

      {/* Featured Destination */}
      <section className="featured">
        <h2 className="section-title">Featured Destinations</h2>

        {/* Filters */}
        <div className="filters-row">
          <div className="filter-buttons">
            {/* Search */}
            <input
              type="text"
              className="filter-btn"
              placeholder="Search my facilities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <h3>Category</h3>
            <select
              name="Category"
              className="filter-btn"
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value.toLowerCase())
              }
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

            <h3>City</h3>
            <input
              type="text"
              className="filter-btn"
              placeholder="City"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            />

            <h3>Province/Territory</h3>
            <select
              name="province"
              className="filter-btn"
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
            >
              <option value={""}></option>
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

            {/* Clear filters button */}
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setSelectedCity("");
                setSelectedProvince("");
              }}
              className="filter-btn"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        <div className="facilities-grid-home">
          {facility.length > 0 ? (
            facility.map((facility) => (
              <Link
                to={`/facility/${facility._id}`}
                key={facility._id}
                style={{ textDecoration: "none" }}
              >
                <div className="facility-card-home">
                  <div className="card-image-container">
                    {/* show the last posted image from reviews */}
                    {facility.lastReviewImage ? (
                      <img
                        src={facility.lastReviewImage}
                        alt={facility.Name}
                        className="facility-image"
                      />
                    ) : (
                      // Change img placeholder based on category
                      <div className="image-placeholder">
                        {facility.Category === "museum" ? (
                          <div>🏺</div>
                        ) : facility.Category === "gallery" ? (
                          <div>🖼️</div>
                        ) : facility.Category ===
                          "heritage or historic site" ? (
                          <div>🏛️</div>
                        ) : facility.Category === "art or cultural centre" ? (
                          <div>🎭</div>
                        ) : (
                          <div>📍</div>
                        )}
                      </div>
                    )}
                    <div className="rating-badge">
                      ★ {facility.avgRating || "N/A"}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="location-tag">
                      {facility.City?.toUpperCase()}
                      {facility.City && facility.Province && ", "}
                      {facility.Province?.toUpperCase()}
                    </div>
                    <h3 className="facility-name">{facility.Name}</h3>
                    <p className="facility-description">
                      {facility.Description ||
                        (facility.Category === "Museum"
                          ? "One of the largest museums in North America and the largest museum in Canada."
                          : "Experience the rich cultural heritage of Canada's historic sites.")}
                    </p>

                    <div className="category-tags">
                      <div>
                        {facility.Category ? (
                          <span className="category-tag">
                            {facility.Category}
                          </span>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div>
              <p>
                No facilities found. Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </div>
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            ⬅
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            ⮕
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
