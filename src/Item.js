import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Item() {
  const [facilities, setFacilities] = useState([]);
  const { token, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // IMMEDIATELY check for token
  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, [token, navigate]);

  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/api/facility")
        .then((res) => res.json())
        .then((data) => setFacilities(data))
        .catch((err) => console.error("Error fetching facilities:", err));
    }
  }, [token]);

  const handleDelete = async (id) => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/facility/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      });

      if (response.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to delete. Are you authorized?");
      }
      setFacilities(facilities.filter((facility) => facility._id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (!token) {
    return null;
  }

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

        <div>
          <Link
            to="/dashboard"
            style={{ padding: "4rem", color: "#122A64", fontWeight: "bold" }}
          >
            Home
          </Link>
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
      </header>

      <h2>Page 2 (Protected Dashboard Item.js)</h2>
      <div className="content-wrapper">
        <div className="right-panel">
          <div className="facilities-grid">
            {facilities.map((facility) => (
              <div key={facility._id} className="facilities-card">
                <div className="image-container">
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
