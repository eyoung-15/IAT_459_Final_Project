import { useContext, useEffect, useState } from "react";
import "./App.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function Dashboard() {
  // Main facilities array
  const [facilities, setFacilities] = useState([]);
  //Get token, user, logout from AuthContext
  const { token, user, logout } = useContext(AuthContext);

  // initial load
  useEffect(() => {
    fetch("http://localhost:5000/api/facility")
      .then((res) => res.json())
      .then((data) => setFacilities(data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  // Form for adding new item
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

  // Updates the field in formData
  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  // stop page from refreshing on submit
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/facility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // prove users authorized
          Authorization: token,
        },
        // Send data to server
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error("Failed to add facility. Are you authorized?");
      }

      // Server sends back new item response
      const newFacility = await response.json();

      // Update frontend visual
      setFacilities([...facilities, newFacility]);

      // clear form
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

  // Deleting data
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/facility/${id}`, {
        method: "DELETE",
        headers: {
          // prove users authorized
          Authorization: token,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }
      // remove from frontend
      setFacilities(facilities.filter((facility) => facility._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  return (
    <div className="page-container">
      <header
        className="main-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>
            Canada Museums, Galleries, & Cultural Sites
          </h1>
          {/* conditionally show welcome message if the user object successfully loaded */}
          {user && (
            <h3
              style={{
                color: "#122A64",
                marginTop: "5px",
                marginBottom: 0,
                fontWeight: "normal",
                fontSize: "1rem",
              }}
            >
              Welcome back, {user.username}!
            </h3>
          )}
        </div>

        {/* Conditionaly display navigation buttons based on if user has token */}
        {!token ? (
          <Link to="/login" style={{ color: "#122A64", fontWeight: "bold" }}>
            Login
          </Link>
        ) : (
          <div>
            {/* To Item page */}
            <Link
              to="/Item"
              style={{ padding: "4rem", color: "#122A64", fontWeight: "bold" }}
            >
              Page 2
            </Link>
            {/* logout */}
            <button
              onClick={logout}
              style={{
                padding: "10px 20px",
                backgroundColor: "#122A64",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* ADD NEW FACILITY */}
      <div className="left-panel">
        <div className="card form-card">
          <h3>Add New Facility</h3>
          <form onSubmit={handleSubmit} className="form">
            <label>Name</label>
            <input
              name="Name"
              value={formData.Name}
              onChange={handleChange}
              required
            />

            <label>Category</label>
            <input
              name="Category"
              value={formData.Category}
              onChange={handleChange}
            />

            <label>Province</label>
            <input
              name="Province"
              value={formData.Province}
              onChange={handleChange}
            />

            <label>City</label>
            <input name="City" value={formData.City} onChange={handleChange} />

            <label>Address</label>
            <input
              name="Address"
              value={formData.Address}
              onChange={handleChange}
            />

            <button type="submit">Add Facility</button>
          </form>
        </div>
      </div>

      <div className="content-wrapper">
        {/* GRID OF ITEMS */}
        <div className="right-panel">
          <div className="facilities-grid">
            {/* loop over every facility */}
            {facilities.map((facility) => (
              // keys are required by React to keep track of list items efficiently
              <div key={facility._id} className="facilities-card">
                <div className="image-container">
                  {/* conditional rendering for the image */}
                  {facility.imgUrl ? (
                    <img src={facility.imgUrl} alt={facility.Name} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                </div>
                <div className="card-details">
                  <h3>{facility.Name}</h3>
                  <p>
                    <strong>Category:</strong> {facility.Category}
                  </p>
                  <p>
                    <strong>Province:</strong> {facility.Province}
                  </p>
                  <p>
                    <strong>City:</strong> {facility.City}
                  </p>
                  <p>
                    <strong>Address:</strong> {facility.Address}
                  </p>
                  {/* DELETE */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(facility._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
