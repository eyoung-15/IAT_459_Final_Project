import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useParams, Link } from "react-router-dom";

function FacilityDetails() {
    
    const { id } = useParams();
    // Main facilities array
    const [facility, setFacility] = useState(null);
    const [reviews, setReviews] = useState([]);
    //Get token, user, logout from AuthContext
    const { token } = useContext(AuthContext);

  // initial load
  useEffect(() => {
    fetch(`http://localhost:5000/api/facility/${id}`)
      .then((res) => res.json())
      .then((data) => setFacility(data))
      .catch((err) => console.error("Error fetching facilities:", err));

    fetch(`http://localhost:5000/api/reviews/${id}`)
      .then(res=>res.json())
      .then(data=>setReviews(data));
  }, [id]);

  if (!facility) return <p>Cannot Find Facility</p>;


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

      
      <div className="card-details">
        <h3>{facility.Name}</h3>
        <p> <strong>Category:</strong> {facility.Category} </p>
        <p> <strong>Address:</strong> {facility.Address} </p>
        <p> <strong>City:</strong> {facility.City} </p>
        <p> <strong>Province:</strong> {facility.Province} </p>
        </div>

        {token && <Link to={`/add-review/${facility._id}`}>
        Add Review
        </Link>}

        <h4>Reviews</h4>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ):(
          reviews.map((r) => (
            <div key={r._id} className="review-card">
                <strong>{r.user.username}</strong>
                <p>{r.rating}/5</p>
                <p>{r.comment}</p>
                </div>
        )))}
</div>
   
             
    
    
  );
}
export default FacilityDetails;