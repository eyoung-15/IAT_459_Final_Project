import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./Dashboard";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import Register from "./pages/Register";

function App() {
  return (
    //wraps app in AuthProvider so components can access token
    <AuthProvider>
      <Router>
        <Routes>
          {/*PUBLIC ROUTES - doesn't need token*/}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* PROTECTED ROUTE - needs token!*/}
          <Route
            path="/"
            element={<ProtectedRoute>{/* <TravelJournal /> */}</ProtectedRoute>}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
