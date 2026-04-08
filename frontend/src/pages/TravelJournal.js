import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

//display facilities users have visited
function TravelJournal() {
  const { token } = useContext(AuthContext);
  const [visited, setVisited] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetch("http://localhost:5001/api/users/me", {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        //sort visited by newest first
        setVisited(
          data.user.visited.sort(
            (a, b) => new Date(b.visitedAt) - new Date(a.visitedAt)
          )
        );
        setStats(data.stats);
      });
  }, [token]);

  //group visited places by month and year for UI
  const grouped = (visited || []).reduce((acc, v) => {
    const date = new Date(v.visitedAt);
    const key = `${date.toLocaleString("default", {
      month: "long",
    })} ${date.getFullYear()}`; //generate string key for grouping (month and year)
    if (!acc[key]) acc[key] = []; //check if accumulator already has an array for this month/year key, if not create an empty array to hold visits for that month
    acc[key].push(v); //push facility into correct month
    return acc;
  }, {});

  const removeVisited = async (facilityId) => {
    try {
      await fetch(`http://localhost:5001/api/users/visited/${facilityId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
      });

      setVisited((prev) => prev.filter((v) => v.facility._id !== facilityId));
    } catch (err) {
      console.error("Failed to remove visited:", err);
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
            {/* To Home page */}
            <Link
              to="/"
              style={{ padding: "4rem", color: "#122A64", fontWeight: "bold" }}
            >
              Home
            </Link>
          </div>
        )}
      </header>

      <h2>My Travel Journal</h2>
      <p> You have visited {stats.visitedCount || 0} places</p>

      {/* group visited places by month */}
      {Object.keys(grouped).map((month) => (
        <div key={month}>
          <h3>{month}</h3>
          {/* list facilities visited in this month */}
          {grouped[month].map((v) => (
            <Link to={`/facility/${v.facility._id}`} key={v.facility._id}>
              <div className="facility-card-home">
                <h3>{v.facility.Name}</h3>
                <p>
                  {v.facility.City}, {v.facility.Province}
                </p>
                <p>Visited on: {new Date(v.visitedAt).toLocaleDateString()}</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    removeVisited(v.facility._id);
                  }}
                >
                  Remove
                </button>
              </div>
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
export default TravelJournal;
