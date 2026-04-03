import { useContext, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./css/HeritageHub.css";

function Home() {
  const { token, user, logout } = useContext(AuthContext);
  const [facility, setFacility] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFacilities = async (page = 1) => {
    try{
      const query = new URLSearchParams({
        page,
        limit: 6,
        searchTerm: searchTerm,
        Category: selectedCategory === "All" ? "" : selectedCategory,
        City: selectedCity,
        Province: selectedProvince,
      });

      const res = await fetch(
        `http://localhost:5000/api/facility?${query.toString()}`
      );

      const data = await res.json();

      setFacility(data.data);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      console.error("Error fetching facilities:", err);
    }
  };

  //fetch when page changes
  useEffect(() => {
    fetchFacilities(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
    fetchFacilities(1);
  }, [selectedCategory, selectedCity, selectedProvince]);

  useEffect(() => {
    const delay = setTimeout(() => {
      setCurrentPage(1);
      fetchFacilities(1);
    }, 400);
    return() => clearTimeout(delay);
  }, [searchTerm]);

  // Get unique categories for filter
  const categories = [
    "All",
    ...new Set(facility.map((f) => f.Category).filter(Boolean)),
  ];

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
            <div className="search-container">
              <input
                type="text"
                placeholder="Q"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

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
        <h2 className="section-title">Featured Destination</h2>

        <div className="filters-row">
          <div className="filter-buttons">
            <h3>Category</h3>
            {categories.map((category) => (
              <button
                key={category}
                className={`filter-btn ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}

            <h3>City</h3>
            {
              <input
                type="text"
                placeholder="City"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              />
            }

            <h3>Province/Territory</h3>
            {
              <select
                name="province"
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
              >
                <option value=""></option>
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
            }
          </div>
        </div>

        <div className="facilities-grid-home">
          {facility.length > 0 ? (
            facility.map((facility) => (
              <Link to={`/facility/${facility._id}`} key={facility._id}>
                <div className="facility-card-home">
                  <div className="card-image-container">
                    {facility.lastReviewImage ? (
                      <img
                        src={`http://localhost:5000${facility.lastReviewImage}`}
                        alt={facility.Name}
                        className="facility-image"
                      />
                    ) : (
                      <div className="image-placeholder">📸</div>
                    )}
                    <div className="rating-badge">
                      ★ {facility.avgRating || "N/A"}
                    </div>
                  </div>

                  <div className="card-content">
                    <div className="location-tag">
                      {facility.City?.toUpperCase()},{" "}
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
                      {/* <span className="category-tag">
                    {facility.Category || "Museum"}
                  </span> */}
                      <span className="category-tag">Museum</span>
                      <span className="category-tag">Art</span>
                      <span className="category-tag">History</span>
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
          onClick={() =>
            setCurrentPage((p) => Math.min(p + 1, totalPages))
          }
          disabled = {currentPage === totalPages}
          >
          ⮕
          </button>
        </div>
      </section>
    </div>
  );
}

export default Home;
