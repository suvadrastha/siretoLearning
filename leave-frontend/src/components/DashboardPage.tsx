import { useLocation, useNavigate } from "react-router-dom";
import { getCurrentUser, getDashboardPathForRole, logout } from "../auth";
import DashboardLayout from "./DashboardLayout";
import { useEffect, useMemo, useState } from "react";
import { useGetCurrentUserQuery } from "../api/usersApi";

export type DashboardTab = {
  id: string;
  label: string;
};

const userTabs: DashboardTab[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "apply-leave", label: "Apply Leave" },
  { id: "my-leave", label: "My Leave" },
  { id: "leave-calendar", label: "Leave Calendar" },
  { id: "profile", label: "Profile" },
];

const adminTabs: DashboardTab[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pending-request", label: "Pending Request" },
  { id: "all-leave-request", label: "All Leave Request" },
  { id: "all-users", label: "All Users" },
  { id: "team-calendar", label: "Team Calendar" },
  { id: "profile", label: "Profile" },
];

function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const cachedUser = useMemo(() => getCurrentUser(), []);
  const {
    data: currentUser,
    isError,
    isLoading: isUserLoading,
  } = useGetCurrentUserQuery();
  const [activeTab, setActiveTab] = useState("dashboard");
  const user = currentUser ?? cachedUser;

  useEffect(() => {
    if (!user) {
      return;
    }

    const dashboardPath = getDashboardPathForRole(user.role);
    if (location.pathname !== dashboardPath) {
      navigate(dashboardPath, { replace: true });
    }
  }, [location.pathname, navigate, user]);

  const isAdmin = user?.role === "ROLE_ADMIN";
  const tabs = useMemo(() => (isAdmin ? adminTabs : userTabs), [isAdmin]);
  const error = !user && isError ? "Failed to load user profile" : null;
  const isLoading = !user && isUserLoading;

  if (isLoading) {
    return <main className="dashboard-loading">Loading dashboard...</main>;
  }

  if (error || !user) {
    return (
      <main className="dashboard-loading">
        <p>{error || "Unable to load dashboard"}</p>
        <button
          type="button"
          onClick={() => navigate("/login", { replace: true })}
        >
          Back to Login
        </button>
      </main>
    );
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      tabs={tabs}
      title={isAdmin ? "Admin Dashboard" : "User Dashboard"}
      user={user}
      onLogout={handleLogout}
      onSelectTab={setActiveTab}
    />
  );
}

export default DashboardPage;
