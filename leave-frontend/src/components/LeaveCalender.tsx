import { useMemo, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import type { UserProfile } from "../auth";
import {
  type LeaveRequest,
  type LeaveStatus,
  useGetAdminLeavesQuery,
  useGetMyLeavesQuery,
} from "../api/leavesApi";

type TooltipData = {
  x: number;
  y: number;
  title: string;
  status: LeaveStatus;
  employee: string;
  reviewer: string;
  reason: string;
  note: string;
};

type CalendarEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay: true;
  extendedProps: {
    status: LeaveStatus;
    employee: string;
    reviewer: string;
    reason: string;
    note: string;
  };
};

const statusClassNames: Record<LeaveStatus, string> = {
  APPROVED: "status-approved",
  PENDING: "status-pending",
  REJECTED: "status-rejected",
};

function getTooltipPosition(clientX: number, clientY: number) {
  const tooltipWidth = 280;
  const tooltipHeight = 260;

  return {
    x: Math.max(12, Math.min(clientX + 12, window.innerWidth - tooltipWidth)),
    y: Math.max(12, Math.min(clientY + 12, window.innerHeight - tooltipHeight)),
  };
}

function addOneDay(dateString: string) {
  const [year, month, day] = dateString.split("-").map(Number);

  if (!year || !month || !day) {
    return dateString;
  }

  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10);
}

function formatLeaveType(leaveType: string) {
  return leaveType
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function getEmployeeName(leave: LeaveRequest) {
  return (
    leave.employee?.fullName ||
    leave.employee?.fullname ||
    leave.employee?.username ||
    "Employee"
  );
}

function getReviewerName(leave: LeaveRequest) {
  return leave.reviewedBy?.fullName || leave.reviewedBy?.fullname || "-";
}

function mapLeaveToEvent(leave: LeaveRequest, isAdmin: boolean): CalendarEvent {
  const leaveType = formatLeaveType(leave.leaveType);
  const employeeName = getEmployeeName(leave);

  return {
    id: String(leave.requestId),
    title: isAdmin ? `${employeeName} - ${leaveType}` : `${leaveType} Leave`,
    start: leave.startDate,
    end: addOneDay(leave.endDate || leave.startDate),
    allDay: true,
    extendedProps: {
      status: leave.status,
      employee: isAdmin ? employeeName : "You",
      reviewer: getReviewerName(leave),
      reason: leave.reason || "-",
      note: leave.rejectionReason || "-",
    },
  };
}

const LeaveCalendar = ({ user }: { user: UserProfile }) => {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const isAdmin = user.role === "ROLE_ADMIN";
  const {
    data: myLeaves = [],
    isError: isMyLeavesError,
    isFetching: isMyLeavesFetching,
    isLoading: isMyLeavesLoading,
  } = useGetMyLeavesQuery(undefined, { skip: isAdmin });
  const {
    data: adminLeaves = [],
    isError: isAdminLeavesError,
    isFetching: isAdminLeavesFetching,
    isLoading: isAdminLeavesLoading,
  } = useGetAdminLeavesQuery(undefined, { skip: !isAdmin });
  const leaves = isAdmin ? adminLeaves : myLeaves;
  const calendarEvents = useMemo(
    () => leaves.map((leave) => mapLeaveToEvent(leave, isAdmin)),
    [isAdmin, leaves],
  );
  const isLoading = isAdmin
    ? isAdminLeavesLoading || isAdminLeavesFetching
    : isMyLeavesLoading || isMyLeavesFetching;
  const isError = isAdmin ? isAdminLeavesError : isMyLeavesError;

  return (
    <section className="leave-calendar-page">
      <div className="leave-calendar-header">
        <p className="dashboard-eyebrow">Calendar</p>
        <h3>{isAdmin ? "Team Leave Calendar" : "Leave Calendar"}</h3>
      </div>

      <div className="leave-calendar-card">
        {isLoading ? (
          <p className="leave-calendar-status">Loading leave calendar...</p>
        ) : null}
        {isError ? (
          <p className="leave-calendar-status">
            Failed to load leave calendar.
          </p>
        ) : null}
        {!isLoading && !isError && calendarEvents.length === 0 ? (
          <p className="leave-calendar-status">No leave requests found.</p>
        ) : null}

        <div className="leave-calendar-scroll">
          <FullCalendar
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="auto"
            aspectRatio={1.35}
            expandRows
            dayMaxEventRows={3}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,dayGridWeek",
            }}
            events={calendarEvents}
            eventClick={(info) => {
              const position = getTooltipPosition(
                info.jsEvent.clientX,
                info.jsEvent.clientY,
              );

              setTooltip({
                ...position,
                title: info.event.title,
                status: info.event.extendedProps.status as LeaveStatus,
                employee: info.event.extendedProps.employee || "-",
                reviewer: info.event.extendedProps.reviewer || "-",
                reason: info.event.extendedProps.reason || "-",
                note: info.event.extendedProps.note || "-",
              });
            }}
            eventMouseEnter={(info) => {
              const position = getTooltipPosition(
                info.jsEvent.clientX,
                info.jsEvent.clientY,
              );

              setTooltip({
                ...position,
                title: info.event.title,
                status: info.event.extendedProps.status as LeaveStatus,
                employee: info.event.extendedProps.employee || "-",
                reviewer: info.event.extendedProps.reviewer || "-",
                reason: info.event.extendedProps.reason || "-",
                note: info.event.extendedProps.note || "-",
              });
            }}
            eventMouseLeave={() => setTooltip(null)}
            eventContent={(eventInfo) => {
              const status = eventInfo.event.extendedProps
                .status as LeaveStatus;

              return (
                <div
                  className={`calendar-status-pill ${statusClassNames[status]}`}
                >
                  <span>{eventInfo.event.title}</span>
                  <strong>{status}</strong>
                </div>
              );
            }}
          />
        </div>
      </div>

      {tooltip ? (
        <div
          className="leave-calendar-tooltip"
          style={{
            top: tooltip.y,
            left: tooltip.x,
          }}
        >
          <p>{tooltip.title}</p>
          <dl>
            <div>
              <dt>Status</dt>
              <dd>{tooltip.status}</dd>
            </div>
            <div>
              <dt>Employee</dt>
              <dd>{tooltip.employee}</dd>
            </div>
            <div>
              <dt>Reviewer</dt>
              <dd>{tooltip.reviewer}</dd>
            </div>
            <div>
              <dt>Reason</dt>
              <dd>{tooltip.reason}</dd>
            </div>
            <div>
              <dt>Note</dt>
              <dd>{tooltip.note || "-"}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </section>
  );
};

export default LeaveCalendar;
