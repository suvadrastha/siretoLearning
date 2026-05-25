import type { UserProfile } from "../auth";
import ProfilePanel from "./ProfilePanel";
import AdminAllLeaveRequests from "./admin/AdminAllLeaveRequests";
import AdminAllUsers from "./admin/AdminAllUsers";
import AdminPendingRequest from "./admin/AdminPendingRequest";
import ApplyLeave from "./ApplyLeave";
import DashboardOverview from "./DashboardOverview";
import getPanelDescription from "./GetPanelDescription";
import LeaveCalendar from "./LeaveCalender";
import MyLeave from "./MyLeave";

function DashboardTabPanel({
  activeTab,
  user,
}: {
  activeTab: string;
  user: UserProfile;
}) {
  if (activeTab === "dashboard") {
    return <DashboardOverview user={user} />;
  }

  if (activeTab === "profile") {
    return <ProfilePanel user={user} />;
  }

  if (activeTab === "apply-leave") {
    return <ApplyLeave />;
  }
  if (activeTab === "my-leave") {
    return <MyLeave />;
  }

  if (activeTab === "pending-request") {
    return <AdminPendingRequest />;
  }
  if (activeTab === "all-leave-request") {
    return <AdminAllLeaveRequests />;
  }
  if (activeTab === "all-users") {
    return <AdminAllUsers />;
  }

  if (activeTab === "leave-calendar" || activeTab === "team-calendar") {
    return <LeaveCalendar user={user} />;
  }
  const title = activeTab
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <section className="dashboard-panel">
      <h3>{title}</h3>
      <p>{getPanelDescription(activeTab)}</p>
    </section>
  );
}

export default DashboardTabPanel;
