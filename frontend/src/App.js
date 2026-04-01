import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./Dashboard";
import Login from "./pages/Login";
import ProtectedRoute from "./ProtectedRoute";
import ProtectedRouteAdmin from "./ProtectedRouteAdmin";
import Register from "./pages/Register";
import Home from "./Home";
import AddReview from "./pages/AddReview";
import FacilityDetails from "./pages/FacilityDetails";
import BucketList from "./pages/BucketList";
import TravelJournal from "./pages/TravelJournal";
import Map from "./pages/Map";
import AdminDashboard from "./pages/AdminDashboard";

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
          <Route path="/map" element={<Map />} />

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
          <Route
            path="/travel-journal"
            element={
              <ProtectedRoute>
                <TravelJournal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bucket-list"
            element={
              <ProtectedRoute>
                <BucketList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRouteAdmin>
                <AdminDashboard />
              </ProtectedRouteAdmin>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
