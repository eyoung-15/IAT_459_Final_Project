import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { Link } from "react-router-dom";

function Item() {
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
        </div>

        {/* Conditionaly display login/logout buttons based on if user has token */}
        {!token ? (
          <Link to="/login" style={{ color: "#122A64", fontWeight: "bold" }}>
            Login
          </Link>
        ) : (
          <div>
            {/* To Dashboard page */}
            <Link
              to="/dashboard"
              style={{ padding: "4rem", color: "#122A64", fontWeight: "bold" }}
            >
              Home
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

      <h2>Page 2 (Protected Dashboard Item.js)</h2>
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
export default Item;
