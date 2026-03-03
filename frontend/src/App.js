import { useEffect, useState } from "react";
import "./App.css";

function App() {
  // state

  // store the list of plants fetched from the database.
  // initial value is an empty array [] because we haven't fetched data yet.
  const [plants, setPlants] = useState([]);

  // store the form inputs.
  // we use a single object to hold all fields instead of creating 6 separate state variables.
  const [formData, setFormData] = useState({
    commonName: "",
    family: "",
    category: "",
    origin: "",
    climate: "",
    imgUrl: "",
  });

  // use effect (Load Data)

  // this runs ONLY when the component first mounts (loads onto the screen) (empty dependency array)
  useEffect(() => {
    fetch("http://localhost:5000/api/plants")
      .then((res) => res.json()) // convert the raw response to JSON
      .then((data) => setPlants(data)) // save the data into our State
      .catch((err) => console.error("Error fetching plants:", err));
  }, []);

  // event handlers

  // handles typing in the input boxes.
  // we use [e.target.name] as a dynamic key to update the correct field in the object.
  const handleChange = (e) => {
    setFormData({
      ...formData, // spread operator: keep existing data (don't delete other fields) (immutability)
      [e.target.name]: e.target.value, // overwrite only the field currently being typed in
    });
  };

  // handles the "Add Plant" button click.
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page (standard form behavior)

    try {
      // send the new data to the Backend
      const response = await fetch("http://localhost:5000/api/plants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData), // Convert JS object to JSON string
      });

      // get the saved plant (including the new _id from MongoDB)
      const newPlant = await response.json();

      // update the UI immediately by adding the new plant to the existing list
      setPlants([...plants, newPlant]);

      // clear the form inputs so the user can type a new one
      setFormData({
        commonName: "",
        family: "",
        category: "",
        origin: "",
        climate: "",
        imgUrl: "",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // handles deleting a plant.
  const handleDelete = async (id) => {
    try {
      // tell Backend to delete the document with this specific ID
      await fetch(`http://localhost:5000/api/plants/${id}`, {
        method: "DELETE",
      });

      // update Frontend: Keep all plants EXCEPT the one we just deleted
      setPlants(plants.filter((plant) => plant._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // UI
  return (
    <div className="page-container">
      {/* header */}
      <header className="main-header">
        <h1>Plant Collection Dashboard</h1>
      </header>
      <div className="content-wrapper">
        {/* left panel: data entry form*/}
        <div className="left-panel">
          <div className="card form-card">
            <h3>Add New Plant</h3>
            <form onSubmit={handleSubmit} className="plant-form">
              <label>Name</label>
              {/* Note on Inputs:
                  - 'name' attribute must match the state key (e.g. "commonName")
                  - 'value' binds the input to the state (Controlled Component)
                  - 'onChange' updates the state when typing 
              */}
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
        </div>

        {/* right panel: the grid of plants */}
        <div className="right-panel">
          <div className="plant-grid">
            {/* .map() loops through the 'plants' array.
               For every plant item, it creates a <div> (plant-card).
            */}
            {plants.map((plant) => (
              <div key={plant._id} className="plant-card">
                {/* the 'key' prop is required by React for performance.
                    It helps React track which items changed, added, or removed.
                */}

                <div className="image-container">
                  {/* conditional rendering:
                      IF plant.imgUrl exists, show the Image.
                      ELSE (:), show the "No Image" placeholder.
                  */}
                  {plant.imgUrl ? (
                    <img src={plant.imgUrl} alt={plant.commonName} />
                  ) : (
                    <div className="placeholder">No Image</div>
                  )}
                </div>

                <div className="card-details">
                  <h3>{plant.commonName}</h3>
                  <p>
                    <strong>Family:</strong> {plant.family}
                  </p>
                  <p>
                    <strong>Origin:</strong> {plant.origin}
                  </p>
                  <p>
                    <strong>Climate:</strong> {plant.climate}
                  </p>

                  {/* we use an arrow function here () => handleDelete(...) 
                      so the function only runs when CLICKED, not when the page loads. */}
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(plant._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>{" "}
      {/* End content-wrapper */}
    </div>
  );
}

export default App;
