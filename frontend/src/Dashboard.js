import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./css/HeritageHub.css";

function Dashboard() {
  const [facility, setFacility] = useState([]);
  const { token, user, logout } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/facility")
      .then((res) => res.json())
      .then((data) => setFacility(data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  const [formData, setFormData] = useState({
    Name: "",
    Category: "",
    Province: "",
    City: "",
    Address: "",
    Latitude: "",
    Longitude: "",
    PostalCode: "",
    imgUrl: "",
  });

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/facility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to add facility. Are you authorized?");
      }
      const newFacility = await response.json();
      setFacility([newFacility, ...facility]);
      setFormData({
        Name: "",
        Category: "",
        Province: "",
        City: "",
        Address: "",
        Latitude: "",
        Longitude: "",
        PostalCode: "",
        imgUrl: "",
      });
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  }

  const handleDelete = async (id) => {
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
      setFacility(facility.filter((facility) => facility._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const filteredFacilities = facility.filter((facility) => {
    return (facility.Name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

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
        <h2 className="section-title">Manage Facilities</h2>

        {/* Add Form */}
        <div
          style={{
            marginBottom: "3rem",
            background: "white",
            padding: "2rem",
            borderRadius: "16px",
          }}
        >
          <h3 style={{ marginBottom: "1.5rem" }}>Add New Facility</h3>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            <input
              name="Name"
              placeholder="Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />
            <input
              name="Category"
              placeholder="Category"
              value={formData.Category}
              onChange={handleChange}
            />
            <select
              name="Province"
              value={formData.Province}
              onChange={handleChange}
            >
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
            <input
              name="City"
              placeholder="City"
              value={formData.City}
              onChange={handleChange}
            />
            <input
              name="Address"
              placeholder="Address"
              value={formData.Address}
              onChange={handleChange}
            />
            <button
              type="submit"
              className="auth-button"
              style={{ gridColumn: "span 2" }}
            >
              Add Facility
            </button>
          </form>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            placeholder="Search facilities..."
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

        {/* Facilities Grid */}
        <div className="facilities-grid-home">
          {filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
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
                  onClick={() => handleDelete(facility._id)}
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
              <p>No facilities found. Try adjusting your search terms</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
