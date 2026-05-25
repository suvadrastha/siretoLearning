import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../DataTable";
import {
  useGetAdminLeavesQuery,
  type LeaveRequest,
  type LeaveStatus,
} from "../../api/leavesApi";

const statusStyles: Record<LeaveStatus, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
};

const AdminAllLeaveRequests = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "">("");
  const [username, setUsername] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedUsername(username.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [username]);

  const queryArgs = useMemo(
    () => ({
      status: statusFilter,
      username: debouncedUsername,
    }),
    [debouncedUsername, statusFilter],
  );

  const {
    data: leaves = [],
    isError,
    isFetching,
    isLoading,
  } = useGetAdminLeavesQuery(queryArgs);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch leave requests");
    }
  }, [isError]);

  const columns = [
    {
      header: "Employee",
      accessor: (row: LeaveRequest) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.employee?.fullName ||
              row.employee?.fullname ||
              row.employee?.username ||
              "Unknown employee"}
          </p>
          <p className="text-xs text-gray-500">{row.employee?.email || "-"}</p>
        </div>
      ),
    },
    {
      header: "Start Date",
      accessor: (row: LeaveRequest) => row.startDate,
    },
    {
      header: "End Date",
      accessor: (row: LeaveRequest) => row.endDate,
    },
    {
      header: "Leave Type",
      accessor: (row: LeaveRequest) => row.leaveType,
    },
    {
      header: "Reason",
      accessor: (row: LeaveRequest) => row.reason,
    },
    {
      header: "Status",
      accessor: (row: LeaveRequest) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            statusStyles[row.status]
          }`}
        >
          {row.status}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full bg-white p-4 sm:p-6 lg:p-8">
      <div className="border-b border-gray-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
          Admin
        </p>

        <p className="mt-2 text-gray-500">
          View and filter all leave requests.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end">
        <div className="w-full md:w-64">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Search by Username
          </label>

          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />
        </div>

        <div className="w-full md:w-56">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Filter by Status
          </label>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as LeaveStatus | "")
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          >
            <option value="">All</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="mt-8">
        {isLoading || isFetching ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 sm:p-8">
            Loading leave requests...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={leaves}
            emptyMessage="No leave requests found"
          />
        )}
      </div>
    </div>
  );
};

export default AdminAllLeaveRequests;
