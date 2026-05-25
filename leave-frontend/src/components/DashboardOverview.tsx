import type { UserProfile } from "../auth";
import {
  type LeaveRequest,
  type LeaveStatistics,
  useGetAdminLeaveStatisticsQuery,
  useGetColleaguesUpcomingApprovedLeavesQuery,
  useGetMyLeaveStatisticsQuery,
} from "../api/leavesApi";
import AdminPendingRequest from "./admin/AdminPendingRequest";

type DashboardStat = {
  label: string;
  metric: keyof LeaveStatistics;
  note: string;
  tone: "blue" | "green" | "amber" | "rose";
};

const employeeStats: DashboardStat[] = [
  {
    label: "Total Requests",
    metric: "totalRequests",
    note: "Requests submitted by you",
    tone: "blue",
  },
  {
    label: "Pending Requests",
    metric: "pendingRequests",
    note: "Requests awaiting review",
    tone: "amber",
  },
  {
    label: "Approved Requests",
    metric: "approvedRequests",
    note: "Approved requests so far",
    tone: "green",
  },
  {
    label: "Rejected Requests",
    metric: "rejectedRequests",
    note: "Closed with reviewer notes",
    tone: "rose",
  },
];

const managerStats: DashboardStat[] = [
  {
    label: "Total Requests",
    metric: "totalRequests",
    note: "Requests submitted by team",
    tone: "blue",
  },
  {
    label: "Pending Requests",
    metric: "pendingRequests",
    note: "Need manager action",
    tone: "amber",
  },
  {
    label: "Approved Requests",
    metric: "approvedRequests",
    note: "Approved for the year",
    tone: "green",
  },
  {
    label: "Rejected Requests",
    metric: "rejectedRequests",
    note: "Closed with reviewer notes",
    tone: "rose",
  },
];

const getDisplayName = (user: UserProfile) =>
  user.fullname || user.fullName || user.fullnme || user.username;

function getEmployeeName(leave: LeaveRequest) {
  return (
    leave.employee?.fullName ||
    leave.employee?.fullname ||
    leave.employee?.username ||
    "Colleague"
  );
}

function formatLeaveType(leaveType: string) {
  return leaveType
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function formatDateRange(leave: LeaveRequest) {
  if (!leave.endDate || leave.startDate === leave.endDate) {
    return formatDate(leave.startDate);
  }

  return `${formatDate(leave.startDate)} - ${formatDate(leave.endDate)}`;
}

function DashboardOverview({ user }: { user: UserProfile }) {
  const isManager = user.role === "ROLE_ADMIN";
  const stats = isManager ? managerStats : employeeStats;
  const {
    data: employeeStatistics,
    isError: isEmployeeStatisticsError,
    isFetching: isEmployeeStatisticsFetching,
  } = useGetMyLeaveStatisticsQuery(undefined, { skip: isManager });
  const {
    data: managerStatistics,
    isError: isManagerStatisticsError,
    isFetching: isManagerStatisticsFetching,
  } = useGetAdminLeaveStatisticsQuery(undefined, { skip: !isManager });
  const {
    data: colleagueLeaves = [],
    isError: isColleagueLeavesError,
    isFetching: isColleagueLeavesFetching,
    isLoading: isColleagueLeavesLoading,
  } = useGetColleaguesUpcomingApprovedLeavesQuery(undefined, {
    skip: isManager,
  });
  const statistics = isManager ? managerStatistics : employeeStatistics;
  const isFetching = isManager
    ? isManagerStatisticsFetching
    : isEmployeeStatisticsFetching;
  const isError = isManager
    ? isManagerStatisticsError
    : isEmployeeStatisticsError;

  return (
    <section className="dashboard-overview" aria-labelledby="overview-title">
      <div className="dashboard-section-heading">
        <p className="dashboard-eyebrow">
          {isManager ? "Manager Overview" : "Employee Overview"}
        </p>
        <h3 id="overview-title">
          {isManager
            ? "Team leave activity"
            : `${getDisplayName(user)}'s leave summary`}
        </h3>
      </div>

      <div className="dashboard-stat-grid">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className={`dashboard-stat-card tone-${stat.tone}`}
          >
            <p>{stat.label}</p>
            <strong>
              {isFetching && !statistics
                ? "..."
                : String(statistics?.[stat.metric] ?? 0)}
            </strong>
            <span>{isError ? "Unable to load stats" : stat.note}</span>
          </article>
        ))}
      </div>

      {isManager ? (
        <section
          className="dashboard-pending-requests"
          aria-labelledby="admin-pending-requests-title"
        >
          <div className="dashboard-section-heading">
            <p className="dashboard-eyebrow">Pending Requests</p>
            <h3 id="admin-pending-requests-title">Requests awaiting review</h3>
          </div>
          <AdminPendingRequest />
        </section>
      ) : (
        <section
          className="colleague-leave-panel"
          aria-labelledby="colleague-leaves-title"
        >
          <div className="dashboard-section-heading">
            <p className="dashboard-eyebrow">Colleagues</p>
            <h3 id="colleague-leaves-title">Upcoming approved leaves</h3>
          </div>

          {isColleagueLeavesLoading || isColleagueLeavesFetching ? (
            <p className="colleague-leave-status">
              Loading approved colleague leaves...
            </p>
          ) : null}

          {isColleagueLeavesError ? (
            <p className="colleague-leave-status">
              Unable to load approved colleague leaves.
            </p>
          ) : null}

          {!isColleagueLeavesLoading &&
          !isColleagueLeavesFetching &&
          !isColleagueLeavesError &&
          colleagueLeaves.length === 0 ? (
            <p className="colleague-leave-status">
              No upcoming approved colleague leaves.
            </p>
          ) : null}

          {!isColleagueLeavesError && colleagueLeaves.length > 0 ? (
            <div className="colleague-leave-list">
              {colleagueLeaves.map((leave) => (
                <article
                  key={leave.requestId}
                  className="colleague-leave-card"
                >
                  <div>
                    <strong>{getEmployeeName(leave)}</strong>
                    <span>{formatLeaveType(leave.leaveType)} Leave</span>
                  </div>
                  <p>{formatDateRange(leave)}</p>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      )}
    </section>
  );
}

export default DashboardOverview;
