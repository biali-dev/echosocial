import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

import Login from "./pages/Login";
import Register from "./pages/Register";

import Feed from "./pages/Feed";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

export default function App() {
  const { user, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <div className="page-background">
        <div className="app-container">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background">
      <div className="app-container">
        <Routes>
          {/* Rotas públicas */}
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/" /> : <Register />}
          />

          {/* Rotas privadas */}
          <Route
            path="/"
            element={user ? <Feed /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={user ? <Users /> : <Navigate to="/login" />}
          />
          <Route
            path="/users/:id"
            element={user ? <UserProfile /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={user ? <Profile /> : <Navigate to="/login" />}
          />

          {/* Fallback */}
          <Route
            path="*"
            element={<Navigate to={user ? "/" : "/login"} />}
          />
        </Routes>
      </div>
    </div>
  );
}
