import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import "../css/HeritageHub.css";

//display facilities users want to visit
function BucketList() {
  const { token } = useContext(AuthContext);
  const [bucket, setBucket] = useState([]);
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
        //sort bucket list by newest first
        setBucket(
          data.user.bucketList.sort((a, b) => new Date(b._id) - new Date(a._id))
        );
        setStats(data.stats);
      });
  }, [token]);

  const remove = (id) => {
    fetch(`http://localhost:5001/api/users/bucket/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    }).then(() => {
      setBucket(bucket.filter((facility) => facility._id !== id));
    });
  };

  //get provinces from bucket list for grouping
  const provinces = [...new Set(bucket.map((facility) => facility.Province))];

  //map province to its full name to replace shorthand
  const provinceMap = {
    ab: "Alberta",
    bc: "British Columbia",
    mb: "Manitoba",
    nb: "New Brunswick",
    nl: "Newfoundland and Labrador",
    ns: "Nova Scotia",
    nt: "Northwest Territories",
    nu: "Nunavut",
    on: "Ontario",
    pe: "Prince Edward Island",
    qc: "Quebec",
    sk: "Saskatchewan",
    yt: "Yukon",
  };

  //get full province name
  function getProvinceName(code) {
    return provinceMap[code] || code;
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

      <h2>My Bucket List</h2>
      <p> You have {stats.bucketCount || 0} saved places</p>

      {/* group bucket list by province */}
      {provinces.map((prov) => (
        <div key={prov}>
          <h3>{getProvinceName(prov)}</h3>
          {bucket
            .filter((facility) => facility.Province === prov) //filter facilities by province
            .map((facility) => (
              <Link to={`/facility/${facility._id}`} key={facility._id}>
                <div className="facility-card-home">
                  <h3>{facility.Name}</h3>
                  <p>
                    {facility.City}, {facility.Province}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      remove(facility._id);
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

export default BucketList;
