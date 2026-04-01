import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";

//wrapper component
function ProtectedRouteAdmin({ children }) {
  //check for token
  const { token, user } = useContext(AuthContext);

  // if the tokens null
  if (!token) {
    //redirect to login
    return <Navigate to="/login" />;
  }
  // if the role is not admin (plus optional chaining in case role schema didnt exist)
  if (user?.role !== "admin") {
    //redirect to home
    return (
      <div>
        <Navigate to="/" />
      </div>
    );
  }
  // Otherwise, return children components
  return children;
}

export default ProtectedRouteAdmin;
