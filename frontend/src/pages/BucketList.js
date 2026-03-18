import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function BucketList(){
    const { token } = useContext(AuthContext);
    const [bucket, setBucket] = useState([]);
    const [stats, setStats] = useState({});
    
    useEffect(() => {
        fetch("http://localhost:5000/api/users/me", {
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }
        }).then(res => res.json())
        .then(data => {
            setBucket(data.user.bucketList);
            setStats(data.stats);
        });
    }, [token]);

    function remove(id) {
         fetch(`http://localhost:5000/api/users/bucket/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: token
            }

         }).then(() => {
            setBucket(bucket.filter(f => f._id !== id));
         });

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

        {bucket.map(f => (
            <div key={f._id} className="facility-card-home">
                <h3>{f.Name}</h3>
                <p>{f.City}, {f.Province}</p>

                <button onClick={() => remove(f._id)}>
                    Remove
                </button>

            </div>
        ))}
</div>
   
             
    
    
  );
}

export default BucketList;