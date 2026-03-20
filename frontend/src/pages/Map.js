import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "../css/App.css";

// References to build map:
// https://ujjwaltiwari2.medium.com/a-guide-to-using-openstreetmap-with-react-70932389b8b1
// https://medevel.com/react-and-leaflet-js-tutorial/

const markerIcon = new L.Icon({
  iconUrl: require("../../src/images/placeholderMarker.png"),
  iconSize: [20, 20],
  iconAnchor: [10, 20], //[left/right, top/bottom]
  popupAnchor: [0, -26], //[left/right, top/bottom]
});

const Map = () => {
  const { token, user, logout } = useContext(AuthContext);
  return (
    <div>
      {/* Navigation Bar */}
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
      </nav>

      <MapContainer center={[57, -100]} zoom={3} className="leaflet-container">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[37.7749, -122.4194]} icon={markerIcon}>
          <Popup>
            <Link to="/" className="nav-link">
              TEST POPUP
            </Link>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default Map;
