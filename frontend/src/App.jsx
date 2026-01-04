import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import Login from "./pages/Login";
import Feed from "./pages/Feed";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Register from "./pages/Register";

export default function App() {
  const { user } = useAuth();

  return (
    <div className="page-background">
      <div className="app-container">
        {!user ? (
          <Routes>
            <Route path="*" element={<Login />} />
          </Routes>
        ) : (
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/users" element={<Users />} />
            <Route path="/users/:id" element={<UserProfile />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        )}
      </div>
    </div>
  );
}
