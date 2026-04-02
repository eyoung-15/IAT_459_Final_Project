import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function TravelJournal(){
    const { token } = useContext(AuthContext);
    const [visited, setVisited] = useState([]);
    const [stats, setStats] = useState({});

    useEffect(() => {
        fetch("http://localhost:5000/api/users/me", {
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        }).then(res => res.json())
        .then(data => {
            setVisited(data.user.visited.sort((a, b) => new Date(b.visitedAt) - new Date(a.visitedAt)));
            setStats(data.stats);
        });
    }, [token]);

    const grouped = visited.reduce((acc, v) => {
      const date = new Date(v.visitedAt);
      const key = `${date.toLocaleString("default", {month: "long"})} ${date.getFullYear()}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(v);
      return acc;
    }, {});

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

        {Object.keys(grouped).map((month) => (
          <div key={month}>
            <h3>{month}</h3>
            {grouped[month].map((v) => (
              <Link to={`/facility/${v._id}`} key={v._id}>
                <div className="facility-card-home">
                  <h3>{v.facility.Name}</h3>
                  <p>{v.facility.City}, {v.facility.Province}</p>
                  <p>Visited on: {new Date(v.visitedAt).toLocaleDateString()}</p>
                  
                </div>
                </Link>

            ))}
            </div>
        ))}

</div>
   
             
    
    
  );
}
export default TravelJournal;