import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

//wrapper component
function ProtectedRoute({ children }) {
  //check for token
  const { token } = useContext(AuthContext);

  // if the tokens null
  if (!token) {
    //redirect to login
    return <Navigate to="/login" />;
  }
  // Otherwise, return children components
  return children;
}

export default ProtectedRoute;
