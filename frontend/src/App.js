import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./pages/Register"; // Fixed: now points to pages folder
// import Item from "./Item";
import Home from "./Home";
import AddReview from "./pages/AddReview";
import FacilityDetails from "./pages/FacilityDetails";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/facility/:id" element={<FacilityDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />


          {/* PROTECTED ROUTE */}
          <Route
            path="/add-review/:facilityId"
            element={
              <ProtectedRoute>
                <AddReview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
