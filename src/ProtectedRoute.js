import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

//wrapper component
function ProtectedRoute({ children }) {
  //check for token
  const { token } = useContext(AuthContext);
  const location = useLocation();

  // if the token is null (not authenticated)
  if (!token) {
    //redirect to login and save the location they tried to access
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Otherwise, return children components
  return children;
}

export default ProtectedRoute;
