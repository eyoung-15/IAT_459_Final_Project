import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/App.css";

// References to build map:
// https://ujjwaltiwari2.medium.com/a-guide-to-using-openstreetmap-with-react-70932389b8b1
// https://medevel.com/react-and-leaflet-js-tutorial/

function FacilityDetails() {
  const { id } = useParams();
  // Main facilities array
  const [facility, setFacility] = useState(null);
  const [reviews, setReviews] = useState([]);
  //Get token, user, logout from AuthContext
  const { token, user, logout } = useContext(AuthContext);

  //bucket list + visited
  const [inBucket, setInBucket] = useState(false);
  const [isVisited, setIsVisited] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  // initial load
  useEffect(() => {
    fetch(`http://localhost:5000/api/facility/${id}`)
      .then((res) => res.json())
      .then((data) => setFacility(data))
      .catch((err) => console.error("Error fetching facilities:", err));

    fetch(`http://localhost:5000/api/reviews/${id}`)
      .then((res) => res.json())
      .then((data) => setReviews(data));
  }, [id]);

  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:5000/api/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const user = data.user;

        setInBucket(user.bucketList.some((f) => f._id.toString() === id));

        setIsVisited(user.visited.some((v) => v.facility._id === id));
      });
  }, [token, id]);

  //toggle bucket list
  function toggleBucket() {
    const method = inBucket ? "DELETE" : "POST";

    fetch(`http://localhost:5000/api/users/bucket/${id}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    }).then(() => {
      setInBucket(!inBucket);
    });
  }

  //mark places visited
  function markVisited() {
    fetch(`http://localhost:5000/api/users/visited/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ image: imageUrl }),
    }).then(() => {
      setIsVisited(true);
      setInBucket(false);
    });
  }

  if (!facility) return <p>No facility found...</p>;

  // Map markers
  const markerIcon = new L.Icon({
    iconUrl: require("../../src/images/marker.png"),
    iconSize: [24, 24],
    iconAnchor: [12, 24], //[left/right, top/bottom]
    popupAnchor: [0, -26], //[left/right, top/bottom]
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
              <Link to="/" className="nav-link">
                Curated Lists
              </Link>
              <Link to="/dashboard" className="nav-link">
                Manage
              </Link>
            </div>
          </div>

          <div className="nav-right">
            {user && (
              <span className="user-greeting">Welcome, {user.username}!</span>
            )}
            <button onClick={logout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="card-details">
        <h3>{facility.Name}</h3>
        <p>
          {" "}
          <strong>Category:</strong> {facility.Category}{" "}
        </p>
        <p>
          {" "}
          <strong>Address:</strong> {facility.Address}{" "}
        </p>
        <p>
          {" "}
          <strong>City:</strong> {facility.City}{" "}
        </p>
        <p>
          {" "}
          <strong>Province:</strong> {facility.Province}{" "}
        </p>
      </div>

      {token && (
        <div>
          <button onClick={toggleBucket} disabled={isVisited}>
            {inBucket ? "Remove from Bucket List" : "Add to Bucket List"}
          </button>

          <input
            type="text"
            placeholder="Optional image URL"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <button onClick={markVisited} disabled={isVisited}>
            {isVisited ? "Visited" : "Mark as Visited"}
          </button>
        </div>
      )}

      {token && <Link to={`/add-review/${facility._id}`}>Add Review</Link>}

      <h4>Reviews</h4>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map((r) => (
          <div key={r._id} className="review-card">
            <strong>{r.user.username}</strong>
            <p>{r.rating}/5</p>
            <p>{r.comment}</p>
          </div>
        ))
      )}

      {/* MAP */}
      {/* Avoid throwing error if theres no lat/lng values by only generating map if they exist */}
      {facility.Latitude && facility.Longitude ? (
        <MapContainer
          center={[facility.Latitude, facility.Longitude]}
          zoom={7}
          className="leaflet-container detailsMap"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {/* Marker to indicate where facility is located on map based on lat/lng values */}
          <Marker
            position={[facility.Latitude, facility.Longitude]}
            icon={markerIcon}
          >
            {/* On clicking the marker, display name and address */}
            <Popup>
              <b>{facility.Name}</b>
              <p>{facility.Address}</p>
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        ""
      )}
    </div>
  );
}
export default FacilityDetails;
