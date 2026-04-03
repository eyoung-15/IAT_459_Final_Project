import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  // Initialize useState for dashboard navigation
  const [currentView, setCurrentView] = useState("facilities");

  //   Backup security - redirect user out if they aren't admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    fetch("http://localhost:5000/api/facility")
      .then((res) => res.json())
      .then((data) => setFacilities(data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data.user))
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

  useEffect(() => {
    fetch("http://localhost:5000/api/reviews")
      .then((res) => res.json())
      .then((data) => setReviews(data.review))
      .catch((err) => console.error("Error fetching reviews:", err));
  }, []);

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
              <Link to="/" className="nav-link">
                Curated Lists
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
          // className={currentView === "facilities" ? "active" : " "}
          style={{
            background: "none",
            border: "1px solid #eaeef2",
            padding: "0.4rem 1rem",
            margin: "2rem 0.5rem",
            borderRadius: "20px",
            color: "#5b6778",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => {
            setCurrentView("facilities");
          }}
        >
          View Facilities
        </button>
        <button
          // className={currentView === "users" ? "active" : " "}
          style={{
            background: "none",
            border: "1px solid #eaeef2",
            padding: "0.4rem 1rem",
            margin: "2rem 0.5rem",
            borderRadius: "20px",
            color: "#5b6778",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => {
            setCurrentView("users");
          }}
        >
          View Users
        </button>
        <button
          // className={currentView === "reviews" ? "active" : " "}
          style={{
            background: "none",
            border: "1px solid #eaeef2",
            padding: "0.4rem 1rem",
            margin: "2rem 0.5rem",
            borderRadius: "20px",
            color: "#5b6778",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => {
            setCurrentView("reviews");
          }}
        >
          View Reviews
        </button>

        {/* Facilities Grid */}
        {currentView === "facilities" ? (
          <div className="facilities-grid-home">
            {facilities.length > 0 ? (
              facilities.map((facility) => (
                <div>
                  <Link to={`/facility/${facility._id}`} key={facility._id}>
                    <div key={facility._id} className="facility-card-home">
                      <div className="card-image-container">
                        {facility.lastReviewImage ? (
                          <img
                            src={`http://localhost:5000${facility.lastReviewImage}`}
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
                        <p className="facility-description">
                          <strong>Category:</strong> {facility.Category}
                          <br />
                          <strong>Address:</strong> {facility.Address}
                        </p>
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
                      width: "100%",
                    }}
                  >
                    Delete
                  </button>
                </div>
              ))
            ) : (
              <div>
                <p>No facilities found.</p>
              </div>
            )}
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
                      width: "100%",
                    }}
                  >
                    Delete
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
                  >
                    <div key={review._id} className="facility-card-home">
                      <div className="card-content">
                        <h3 className="facility-name">{review.comment}</h3>
                        <p className="facility-description">
                          <strong>Rating:</strong> {review.rating}
                          <br />
                          <strong>Facility:</strong>{" "}
                          {review.facility?.Name
                            ? review.facility?.Name
                            : "Deleted Facility"}
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
