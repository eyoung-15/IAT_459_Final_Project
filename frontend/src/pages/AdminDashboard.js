import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useCallback } from "react";

function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
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
    //Empty until user inputs new data
    Name: "",
    Category: "",
    Province: "",
    City: "",
    Address: "",
    Latitude: "",
    Longitude: "",
    PostalCode: "",
  });

  //   Backup security - redirect user out if they aren't admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const fetchFacilities = useCallback(
    async (page = 1) => {
      try {
        const query = new URLSearchParams({
          page,
          limit: 6, //number of facilities per page
          searchTerm: searchTerm,
          Category: selectedCategory === "All" ? "" : selectedCategory,
          City: selectedCity,
          Province: selectedProvince,
        });

        const res = await fetch(
          `http://localhost:5000/api/facility?${query.toString()}`,
        );

        const data = await res.json();

        setFacilities(data.data);
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

  useEffect(() => {
    fetch("http://localhost:5000/api/users", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data.user))
      .catch((err) => console.error("Error fetching users:", err));
  }, [token]);

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => setReviews(data.review))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, [token]);

  const handleDeleteFacility = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/facility/${id}`, {
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
      const response = await fetch(`http://localhost:5000/api/users/${id}`, {
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
      const response = await fetch(`http://localhost:5000/api/reviews/${id}`, {
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
        `http://localhost:5000/api/users/${id}/role`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
          },
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update role");
      }
      const data = await response.json();
      // Update the UI right away
      setUsers(
        users.map((u) => (u._id === id ? { ...u, role: data.user.role } : u)),
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // onSubmit, applies this function. Prevents reload behaviour, applies facilityData. EditMenu holds the id of the facility with the editMenu currently open
  async function handleFacilitySubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5000/api/facility/${editMenu}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
          // Ensure lat/lng values are numbers
          body: JSON.stringify({
            ...facilityData,
            Latitude: Number(facilityData.Latitude),
            Longitude: Number(facilityData.Longitude),
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update facility");
      }
      const updatedFacility = await response.json();
      // Update the UI right away
      setFacilities(
        facilities.map((facility) =>
          facility._id === editMenu ? updatedFacility : facility,
        ),
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

  // Get unique categories for filter
  const categories = [
    "All",
    ...new Set(facilities.map((f) => f.Category).filter(Boolean)),
  ];

  const styles = {
    mainBtn: {
      background: "none",
      border: "1px solid #eaeef2",
      padding: "0.4rem 1rem",
      margin: "2rem 0.5rem",
      borderRadius: "20px",
      color: "#5b6778",
      cursor: "pointer",
      transition: "all 0.2s",
    },
    active: {
      background: "#0d7451",
      color: "white",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      marginTop: "0.8rem",
    },
    label: {
      fontSize: "0.7rem",
      fontWeight: "500",
      marginBottom: "0.17rem",
      color: "#0d7451",
    },
    input: {
      padding: "0.25rem 0.65rem",
      borderRadius: "20px",
      border: "1px solid #d6dde5",
      fontSize: "0.85rem",
      marginBottom: "0.35rem",
      color: "rgb(92, 92, 92)",
    },
    submit: {
      marginTop: "0.5rem",
      padding: "0.5rem",
      borderRadius: "20px",
      border: "none",
      background: "#0d7451",
      color: "white",
      fontWeight: "600",
      cursor: "pointer",
    },
  };

  return (
    <div className="heritage-hub">
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
      <div className="featured" style={{ marginTop: "2rem" }}>
        <h2 className="section-title">Admin Dashboard</h2>

        {/* Conditional Rendering Buttons */}
        <button
          // spread all styles but override some if state is active
          style={{
            ...styles.mainBtn,
            ...(currentView === "facilities" ? styles.active : ""),
          }}
          onClick={() => {
            setCurrentView("facilities");
          }}
        >
          View Facilities
        </button>
        <button
          style={{
            ...styles.mainBtn,
            ...(currentView === "users" ? styles.active : ""),
          }}
          onClick={() => {
            setCurrentView("users");
          }}
        >
          View Users
        </button>
        <button
          style={{
            ...styles.mainBtn,
            ...(currentView === "reviews" ? styles.active : ""),
          }}
          onClick={() => {
            setCurrentView("reviews");
          }}
        >
          View Reviews
        </button>

        {/* Facilities Grid */}
        {currentView === "facilities" ? (
          <div>
            {/* Filters */}
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
              {/* Search */}
              <div style={{ marginBottom: "2rem" }}>
                <input
                  type="text"
                  placeholder="Search my facilities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    padding: "0.75rem",
                    width: "300px",
                    borderRadius: "8px",
                    border: "1px solid #eaeef2",
                  }}
                />
                <button
                  onClick={() => setSearchTerm("")}
                  className="filter-btn"
                  style={{ marginLeft: "1rem" }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="facilities-grid-home">
              {facilities.length > 0 ? (
                facilities.map((facility) => (
                  <div>
                    <Link
                      to={`/facility/${facility._id}`}
                      key={facility._id}
                      style={{ textDecoration: "none" }}
                    >
                      <div key={facility._id} className="facility-card-home">
                        <div className="card-image-container">
                          {facility.lastReviewImage ? (
                            <img
                              src={facility.lastReviewImage}
                              alt={facility.Name}
                              className="facility-image"
                            />
                          ) : (
                            <div className="image-placeholder">🏛️</div>
                          )}
                        </div>
                        <div className="card-content">
                          <div className="location-tag">
                            {facility.City?.toUpperCase()},{" "}
                            {facility.Province?.toUpperCase()}
                          </div>
                          <h3 className="facility-name">{facility.Name}</h3>
                        </div>
                      </div>
                    </Link>

                    <button
                      onClick={() => handleDeleteFacility(facility._id)}
                      className="filter-btn"
                      style={{
                        marginTop: "7px",
                        background: "#fee",
                        color: "#c00",
                        borderColor: "#fcc",
                        width: "59%",
                      }}
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => {
                        // Open the edit menu based on which id has been clicked
                        setEditMenu(
                          editMenu === facility._id ? null : facility._id,
                        );
                        // Fill values with existing facility data
                        setFacilityData(facility);
                      }}
                      className="filter-btn"
                      style={{
                        marginTop: "7px",
                        marginLeft: "1%",
                        background: "rgb(237, 249, 246)",
                        color: "#0d7451",
                        borderColor: "rgb(163, 220, 205)",
                        width: "40%",
                      }}
                    >
                      Edit
                    </button>
                    {editMenu === facility._id ? (
                      <div styles={styles.formContainer}>
                        <form
                          onSubmit={handleFacilitySubmit}
                          style={styles.form}
                        >
                          <label style={styles.label}>Facility Name</label>
                          <input
                            name="Name"
                            value={facilityData.Name}
                            onChange={handleEditFacility}
                            style={styles.input}
                            required
                          />
                          <label style={styles.label}>Category</label>
                          <input
                            name="Category"
                            value={facilityData.Category}
                            onChange={handleEditFacility}
                            style={styles.input}
                          />
                          <label style={styles.label}>Province/Territory</label>
                          <select
                            name="Province"
                            value={facilityData.Province}
                            onChange={handleEditFacility}
                            style={styles.input}
                          >
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
                            <option value={"nt"}>Northwest Territories</option>
                          </select>
                          <label style={styles.label}>City</label>
                          <input
                            name="City"
                            value={facilityData.City}
                            onChange={handleEditFacility}
                            style={styles.input}
                          />
                          <label style={styles.label}>Address</label>
                          <input
                            name="Address"
                            value={facilityData.Address}
                            onChange={handleEditFacility}
                            style={styles.input}
                          />
                          <label style={styles.label}>Latitude</label>
                          <input
                            name="Latitude"
                            value={facilityData.Latitude}
                            onChange={handleEditFacility}
                            style={styles.input}
                          />
                          <label style={styles.label}>Longitude</label>
                          <input
                            name="Longitude"
                            value={facilityData.Longitude}
                            onChange={handleEditFacility}
                            style={styles.input}
                          />
                          <label style={styles.label}>Postal Code</label>
                          <input
                            name="PostalCode"
                            value={facilityData.PostalCode}
                            onChange={handleEditFacility}
                            style={styles.input}
                          />
                          <button type="submit" style={styles.submit}>
                            Submit Changes
                          </button>
                        </form>
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))
              ) : (
                <div>
                  <p>No facilities found.</p>
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
                disabled={currentPage === totalPages}
              >
                ⮕
              </button>
            </div>
          </div>
        ) : currentView === "users" ? (
          <div className="facilities-grid-home">
            {users.length > 0 ? (
              users.map((user) => (
                <div>
                  <div key={user._id} className="facility-card-home">
                    <div className="card-content">
                      <h3 className="facility-name">{user.username}</h3>
                      <p className="facility-description">
                        <strong>Email:</strong> {user.email}
                        <br />
                        <strong>Role:</strong> {user.role}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="filter-btn"
                    style={{
                      marginTop: "7px",
                      background: "#fee",
                      color: "#c00",
                      borderColor: "#fcc",
                      width: "59%",
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleRole(user._id)}
                    className="filter-btn"
                    style={{
                      marginTop: "7px",
                      marginLeft: "1%",
                      background: "rgb(237, 249, 246)",
                      color: "#0d7451",
                      borderColor: "rgb(163, 220, 205)",
                      width: "40%",
                    }}
                  >
                    Make {user.role === "admin" ? "Member" : "Admin"}
                  </button>
                </div>
              ))
            ) : (
              <div>
                <p>No users found.</p>
              </div>
            )}
          </div>
        ) : currentView === "reviews" ? (
          <div className="facilities-grid-home">
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div>
                  <Link
                    to={
                      review.facility?.Name
                        ? `/facility/${review.facility?._id}`
                        : ""
                    }
                    key={review._id}
                    style={{ textDecoration: "none" }}
                  >
                    <div key={review._id} className="facility-card-home">
                      <div className="card-content">
                        <p
                          className="facility-description"
                          style={{ color: "black" }}
                        >
                          {review.comment}
                        </p>
                        <p className="facility-description">
                          <strong>Facility:</strong>{" "}
                          {review.facility?.Name
                            ? review.facility?.Name
                            : "Deleted Facility"}
                          <br />
                          <strong>Rating:</strong> {review.rating}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="filter-btn"
                    style={{
                      marginTop: "7px",
                      background: "#fee",
                      color: "#c00",
                      borderColor: "#fcc",
                      width: "100%",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div>
                <p>No reviews found.</p>
              </div>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
export default AdminDashboard;
