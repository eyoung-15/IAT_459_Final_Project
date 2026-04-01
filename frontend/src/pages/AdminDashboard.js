import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  //   Backup security - redirect user out if they aren't admin
  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="page-container">
      <p>adminDashboard</p>
    </div>
  );
}
export default AdminDashboard;
