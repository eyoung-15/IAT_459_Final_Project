import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import "./css/HeritageHub.css";

function Dashboard() {
  const [myFacilities, setMyFacilities] = useState([]);
  const { token, user, logout, timeoutMsg } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editMenu, setEditMenu] = useState();
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

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch("http://localhost:5000/api/facility/my-facilities", {
      headers: {
        Authorization: token,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error fetching facilities.");
        return res.json();
      })
      .then((data) => setMyFacilities(data))
      .catch((err) => console.error("Error fetching facilities:", err))
      .finally(() => {
        setLoading(false);
      });
  }, [token]);

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
      setMyFacilities(myFacilities.filter((facility) => facility._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const filteredFacilities = myFacilities.filter((facility) => {
    return (facility.Name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  // onSubmit, applies this function. Prevents reload behaviour, applies facilityData. EditMenu holds the id of the facility with the editMenu currently open
  async function handleFacilityEditSubmit(e) {
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
          // Apply to the fields that may need to be changed
          body: JSON.stringify({
            Name: facilityEditData.Name,
            Category: facilityEditData.Category,
            Province: facilityEditData.Province,
            City: facilityEditData.City,
            Address: facilityEditData.Address,
            Latitude: Number(facilityEditData.Latitude),
            Longitude: Number(facilityEditData.Longitude),
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Failed to update facility");
      }
      const updatedFacility = await response.json();
      // Update the UI right away
      setMyFacilities(
        myFacilities.map((facility) =>
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
    setFacilityEditData({
      ...facilityEditData,
      [name]: value,
    });
  };

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
        {timeoutMsg && <div className="timeout">{timeoutMsg}</div>}
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
        <h2 className="section-title">Manage My Facilities</h2>

        {/* Search */}
        <div style={{ marginBottom: "2rem" }}>
          <input
            type="text"
            className="filter-btn"
            placeholder="Search my facilities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Clear filters btn */}
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
          {loading ? (
            <p>Loading facilities...</p>
          ) : filteredFacilities.length > 0 ? (
            filteredFacilities.map((facility) => (
              <div>
                <Link
                  to={`/facility/${facility._id}`}
                  key={facility._id}
                  style={{ textDecoration: "none" }}
                >
                  <div key={facility._id} className="facility-card-home">
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

                <button
                  onClick={() => handleDelete(facility._id)}
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
                    setFacilityEditData(facility);
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
                      onSubmit={handleFacilityEditSubmit}
                      style={styles.form}
                    >
                      <label style={styles.label}>Facility Name</label>
                      <input
                        name="Name"
                        value={facilityEditData.Name}
                        onChange={handleEditFacility}
                        style={styles.input}
                        required
                      />
                      <label style={styles.label}>Category</label>
                      <select
                        name="Category"
                        value={facilityEditData.Category}
                        onChange={handleEditFacility}
                        style={styles.input}
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
                      <label style={styles.label}>Province/Territory</label>
                      <select
                        name="Province"
                        value={facilityEditData.Province}
                        onChange={handleEditFacility}
                        style={styles.input}
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
                      <label style={styles.label}>City</label>
                      <input
                        name="City"
                        value={facilityEditData.City}
                        onChange={handleEditFacility}
                        style={styles.input}
                      />
                      <label style={styles.label}>Address</label>
                      <input
                        name="Address"
                        value={facilityEditData.Address}
                        onChange={handleEditFacility}
                        style={styles.input}
                      />
                      <label style={styles.label}>Latitude</label>
                      <input
                        name="Latitude"
                        value={facilityEditData.Latitude}
                        onChange={handleEditFacility}
                        style={styles.input}
                      />
                      <label style={styles.label}>Longitude</label>
                      <input
                        name="Longitude"
                        value={facilityEditData.Longitude}
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
      </div>

      {/* Add Form */}
      <div
        style={{
          marginBottom: "3rem",
          padding: "2rem 5rem",
          borderRadius: "16px",
          maxWidth: "35rem",
          margin: "0 auto",
          border: "1px solid #eaeef2",
        }}
      >
        <h3 style={{ marginBottom: "1.5rem" }}>Add a New Facility</h3>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Facility Name*</label>
          <input
            name="Name"
            value={formData.Name}
            onChange={handleChange}
            required
            style={styles.input}
          />
          <label style={styles.label}>Category</label>
          <select
            name="Category"
            value={formData.Category}
            onChange={handleChange}
            style={styles.input}
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
          <label style={styles.label}>Province/Territory</label>
          <select
            name="Province"
            value={formData.Province}
            onChange={handleChange}
            style={styles.input}
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
          <label style={styles.label}>City</label>
          <input
            name="City"
            value={formData.City}
            onChange={handleChange}
            style={styles.input}
          />
          <label style={styles.label}>Address</label>
          <input
            name="Address"
            value={formData.Address}
            onChange={handleChange}
            style={styles.input}
          />
          <label style={styles.label}>Latitude</label>
          <input
            name="Latitude"
            placeholder="example: 49.246292"
            value={formData.Latitude}
            onChange={handleChange}
            style={styles.input}
          />
          <label style={styles.label}>Longitude</label>
          <input
            name="Longitude"
            placeholder="example: -123.116226"
            value={formData.Longitude}
            onChange={handleChange}
            style={styles.input}
          />
          <button type="submit" className="auth-button" style={styles.submit}>
            Add Facility
          </button>
        </form>
      </div>
    </div>
  );
}

export default Dashboard;
