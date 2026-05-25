import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { isAuthenticated } from "./auth";

import LoginPage from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./components/DashboardPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="*"
          element={
            <Navigate
              to={isAuthenticated() ? "/dashboard" : "/login"}
              replace
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
