import {
  Route,
  BrowserRouter as Router,
  Routes,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./pages/Register";
import Item from "./Item";
import Home from "./Home";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* PUBLIC ROUTES - no token needed */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* PROTECTED ROUTES - all require token */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Item"
            element={
              <ProtectedRoute>
                <Item />
              </ProtectedRoute>
            }
          />

          {/* Catch all other routes - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
