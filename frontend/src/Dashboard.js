import { useContext, useEffect, useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

function Dashboard() {
  const [facilities, setFacilities] = useState([]); // holds the array of plants from the database

  // const [formData, setFormData] = useState({
  //   // holds the current text typed into the form
  //   commonName: "",
  //   family: "",
  //   category: "",
  //   origin: "",
  //   climate: "",
  //   imgUrl: "",
  // });

  //Get token, user, logout from AuthContext
  const { token, user, logout } = useContext(AuthContext);

  // initial load
  useEffect(() => {
    fetch("http://localhost:5000/api/facility")
      .then((res) => res.json())
      .then((data) => setFacilities(data))
      .catch((err) => console.error("Error fetching facilities:", err));
  }, []);

  // helper function for the Controlled Form
  // Updates the specific field in our formData state based on the input's 'name' attribute
  // function handleChange(e) {
  //   setFormData({
  //     ...formData,
  //     [e.target.name]: e.target.value,
  //   });
  // }

  // // creating data: protected POST request
  // async function handleSubmit(e) {
  //   e.preventDefault(); // stop the page from refreshing

  //   try {
  //     const response = await fetch("http://localhost:5000/api/plants", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         // attach the token to prove user is authorized
  //         Authorization: token,
  //       },
  //       body: JSON.stringify(formData), // send the form data to the server
  //     });

  //     // basic error handling if the token is invalid/missing or the server rejects
  //     if (!response.ok) {
  //       throw new Error("Failed to add plant. Are you authorized?");
  //     }

  //     // if successful, the server sends back the newly created plant (including its new MongoDB _id)
  //     const newPlant = await response.json();

  //     // update our local React state to include the new plant instantly without refreshing the page
  //     setPlants([...plants, newPlant]);

  //     // clear the form fields
  //     setFormData({
  //       commonName: "",
  //       family: "",
  //       category: "",
  //       origin: "",
  //       climate: "",
  //       imgUrl: "",
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     alert(err.message); // show the error to the user
  //   }
  // }

  // // deleting data: protected DELETE request
  // const handleDelete = async (id) => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/api/plants/${id}`, {
  //       method: "DELETE",
  //       headers: {
  //         // attach the token to prove user is authorized - again
  //         Authorization: token,
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to delete. Are you authorized?");
  //     }

  //     // if the backend successfully deleted it, remove it from our local React state
  //     // this filters out the deleted plant so it disappears from the screen instantly
  //     setPlants(plants.filter((plant) => plant._id !== id));
  //   } catch (err) {
  //     console.error(err);
  //     alert(err.message);
  //   }
  // };

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
          {/* conditional rendering: only show the welcome message if the user object successfully loaded */}
          {user && (
            <h3 style={{ color: "#122A64", marginTop: "5px", marginBottom: 0 }}>
              Welcome back, {user.username}!
            </h3>
          )}
        </div>

        {/* Conditionaly display login/logout buttons based on if user has token */}
        {!token ? (
          <Link to="/login" style={{ color: "#122A64", fontWeight: "bold" }}>
            Login
          </Link>
        ) : (
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
        )}
      </header>

      <div className="content-wrapper">
        {/* ADD NEW ITEM */}
        {/* <div className="left-panel">
          <div className="card form-card">
            <h3>Add New Plant</h3>
            <form onSubmit={handleSubmit} className="plant-form">
              <label>Name</label>
              <input
                name="commonName"
                value={formData.commonName}
                onChange={handleChange}
                required
              />

              <label>Family</label>
              <input
                name="family"
                value={formData.family}
                onChange={handleChange}
              />

              <label>Category</label>
              <input
                name="category"
                value={formData.category}
                onChange={handleChange}
              />

              <label>Origin</label>
              <input
                name="origin"
                value={formData.origin}
                onChange={handleChange}
              />

              <label>Climate</label>
              <input
                name="climate"
                value={formData.climate}
                onChange={handleChange}
              />

              <label>Image URL</label>
              <input
                name="imgUrl"
                value={formData.imgUrl}
                onChange={handleChange}
              />

              <button type="submit">Add Plant</button>
            </form>
          </div>
        </div> */}

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
                  {/* <button
                    className="delete-btn"
                    onClick={() => handleDelete(plant._id)}
                  >
                    Delete
                  </button> */}
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
