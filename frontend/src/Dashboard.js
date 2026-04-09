import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./css/HeritageHub.css";

function Dashboard() {
  const [myFacilities, setMyFacilities] = useState([]);
  const { token, user, logout, timeoutMsg } = useContext(AuthContext) || {};
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMenu, setEditMenu] = useState(null);
  // Initialize facilityData and specify attributes/inputs that can be filled under it
  const [facilityEditData, setFacilityEditData] = useState({
    //Empty until user inputs new data
    Name: "",
    Category: "",
    Province: "",
    City: "",
    Address: "",
    Latitude: "",
    Longitude: "",
  });

  const [formData, setFormData] = useState({
    Name: "",
    Category: "",
    Province: "",
    City: "",
    Address: "",
    Latitude: "",
    Longitude: "",
    imgUrl: "",
  });

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("http://localhost:5001/api/facility/my-facilities", {
      headers: { Authorization: token },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching facilities.");
        return res.json();
      })
      .then((data) => setMyFacilities(data))
      .catch((err) => console.error("Error fetching facilities:", err))
      .finally(() => setLoading(false));
  }, [token]);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5001/api/facility", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(formData),
      });
      if (!response.ok)
        throw new Error("Failed to add facility. Are you authorized?");

      const newFacility = await response.json();
      setMyFacilities([newFacility, ...myFacilities]);
      setFormData({
        Name: "",
        Category: "",
        Province: "",
        City: "",
        Address: "",
        Latitude: "",
        Longitude: "",
        imgUrl: "",
      });
    } catch (err) {
      alert(err.message);
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this facility?"))
      return;
    try {
      const response = await fetch(`http://localhost:5001/api/facility/${id}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      if (!response.ok) throw new Error("Failed to delete.");
      setMyFacilities(myFacilities.filter((facility) => facility._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredFacilities = myFacilities.filter((facility) =>
    (facility.Name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // onSubmit, applies this function. Prevents reload behaviour, applies facilityData. EditMenu holds the id of the facility with the editMenu currently open
  async function handleFacilityEditSubmit(e) {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:5001/api/facility/${editMenu}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: token },
          body: JSON.stringify({
            Name: facilityEditData.Name,
            Category: facilityEditData.Category,
            Province: facilityEditData.Province,
            City: facilityEditData.City,
            Address: facilityEditData.Address,
            Latitude: Number(facilityEditData.Latitude),
            Longitude: Number(facilityEditData.Longitude),
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update facility");

      const updatedFacility = await response.json();
      // Update the UI right away
      setMyFacilities(
        myFacilities.map((f) => (f._id === editMenu ? updatedFacility : f))
      );
      // Close editMenu
      setEditMenu(null);
    } catch (err) {
      alert(err.message);
    }
  }

  // When user interacts with edit facility inputs, set the facilityData attribute to match the value
  const handleEditFacility = (e) => {
    setFacilityEditData({
      ...facilityEditData,
      [e.target.name]: e.target.value,
    });
  };

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
              <Link to="/dashboard" className="nav-link active">
                Manage
              </Link>
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

      <div className="manage-container">
        {/* Manage Facilities Section */}
        <section className="manage-section">
          <header className="manage-header">
            <h1 className="manage-title">Manage My Facilities</h1>
            <p className="manage-subtitle">
              Edit or remove facilities that you have added to the platform.
            </p>
          </header>

          <div className="manage-search">
            <div className="search-input-wrapper" style={{ maxWidth: "400px" }}>
              <svg
                className="search-icon-home"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                className="filter-input with-icon"
                placeholder="Search your facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="clear-filters-btn"
                style={{ height: "42px" }}
              >
                Clear
              </button>
            )}
          </div>

          {loading ? (
            <div className="status-container">
              <div className="loader-spinner"></div>
              <p>Loading your facilities...</p>
            </div>
          ) : filteredFacilities.length > 0 ? (
            <div className="manage-grid">
              {filteredFacilities.map((facility) => (
                <div key={facility._id} className="manage-card-wrapper">
                  <div className="facility-card-home">
                    <div className="card-image-box" style={{ height: "180px" }}>
                      {/* show the last posted image from reviews */}
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
                            : facility.Category === "heritage or historic site"
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
                          {facility.Category || "HERITAGE SITE"}
                        </span>
                      </div>
                      <h3 className="card-title" style={{ fontSize: "1.3rem" }}>
                        {facility.Name}
                      </h3>
                      <p className="card-location">
                        {facility.City}, {facility.Province?.toUpperCase()}
                      </p>

                      <div className="manage-actions">
                        <button
                          onClick={() => {
                            setEditMenu(
                              editMenu === facility._id ? null : facility._id
                            );
                            setFacilityEditData(facility);
                          }}
                          className="manage-edit-btn"
                        >
                          {editMenu === facility._id ? "Cancel Edit" : "Edit"}
                        </button>
                        <button
                          onClick={() => handleDelete(facility._id)}
                          className="manage-delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Inline Edit Form */}
                  {editMenu === facility._id && (
                    <form
                      onSubmit={handleFacilityEditSubmit}
                      className="elegant-form inline-edit-form"
                    >
                      <h4 className="form-heading">Edit Facility Details</h4>

                      <div className="form-grid">
                        <div className="form-group">
                          <label className="form-label">Facility Name</label>
                          <input
                            name="Name"
                            value={facilityEditData.Name}
                            onChange={handleEditFacility}
                            className="form-input"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Category</label>
                          <select
                            name="Category"
                            value={facilityEditData.Category}
                            onChange={handleEditFacility}
                            className="form-input"
                          >
                            <option value="">Select a category</option>
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
                        <div className="form-group">
                          <label className="form-label">
                            Province/Territory
                          </label>
                          <select
                            name="Province"
                            value={facilityEditData.Province}
                            onChange={handleEditFacility}
                            className="form-input"
                          >
                            <option value="">Select a province</option>
                            <option value="on">Ontario</option>
                            <option value="qc">Quebec</option>
                            <option value="bc">British Columbia</option>
                            <option value="ab">Alberta</option>
                            <option value="ns">Nova Scotia</option>
                            <option value="nb">New Brunswick</option>
                            <option value="nl">
                              Newfoundland and Labrador
                            </option>
                            <option value="sk">Saskatchewan</option>
                            <option value="mb">Manitoba</option>
                            <option value="nu">Nunavut</option>
                            <option value="yt">Yukon</option>
                            <option value="nt">Northwest Territories</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">City</label>
                          <input
                            name="City"
                            value={facilityEditData.City}
                            onChange={handleEditFacility}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group full-width">
                          <label className="form-label">Address</label>
                          <input
                            name="Address"
                            value={facilityEditData.Address}
                            onChange={handleEditFacility}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Latitude</label>
                          <input
                            name="Latitude"
                            value={facilityEditData.Latitude}
                            onChange={handleEditFacility}
                            className="form-input"
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Longitude</label>
                          <input
                            name="Longitude"
                            value={facilityEditData.Longitude}
                            onChange={handleEditFacility}
                            className="form-input"
                          />
                        </div>
                      </div>

                      <button type="submit" className="form-submit-btn">
                        Save Changes
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="status-container">
              <p>You haven't added any facilities yet.</p>
            </div>
          )}
        </section>

        {/* Add Facility Section */}
        <section className="add-facility-section">
          <div className="elegant-form-container">
            <header className="form-header">
              <h2 className="form-title">Add a New Facility</h2>
              <p className="form-subtitle">
                Contribute a new museum, gallery, or historic site to the
                platform.
              </p>
            </header>

            <form onSubmit={handleSubmit} className="elegant-form">
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Facility Name *</label>
                  <input
                    name="Name"
                    value={formData.Name}
                    onChange={handleChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="Category"
                    value={formData.Category}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select a category</option>
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

                <div className="form-group">
                  <label className="form-label">Province</label>
                  <select
                    name="Province"
                    value={formData.Province}
                    onChange={handleChange}
                    className="form-input"
                  >
                    <option value="">Select a province</option>
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

                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    name="City"
                    value={formData.City}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group full-width">
                  <label className="form-label">Address</label>
                  <input
                    name="Address"
                    value={formData.Address}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Latitude</label>
                  <input
                    name="Latitude"
                    placeholder="e.g., 49.246292"
                    value={formData.Latitude}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Longitude</label>
                  <input
                    name="Longitude"
                    placeholder="e.g., -123.116226"
                    value={formData.Longitude}
                    onChange={handleChange}
                    className="form-input"
                  />
                </div>
              </div>

              <button type="submit" className="form-submit-btn">
                Publish Facility
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
