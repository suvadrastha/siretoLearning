import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  useGetMyLeavesQuery,
  type LeaveRequest,
  type LeaveStatus,
} from "../api/leavesApi";
import DataTable from "./DataTable";

const statusStyles: Record<LeaveStatus, string> = {
  APPROVED: "bg-green-100 text-green-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  REJECTED: "bg-red-100 text-red-700",
};

const MyLeave = () => {
  const [statusFilter, setStatusFilter] = useState<LeaveStatus | "">("");
  const {
    data: leaves = [],
    isError,
    isFetching,
    isLoading,
  } = useGetMyLeavesQuery(statusFilter);

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch leave requests");
    }
  }, [isError]);

  const columns = [
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

    {
      header: "Reviewed By",
      accessor: (row: LeaveRequest) =>
        row.reviewedBy?.fullName || row.reviewedBy?.fullname || "-",
    },

    {
      header: "Reviewer Note",
      accessor: (row: LeaveRequest) => row.rejectionReason || "-",
    },
  ];

  return (
    <div className="w-full bg-white p-4 sm:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-6 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
            My Leaves
          </p>

          <p className="mt-2 text-gray-500">
            View all your leave requests and their statuses.
          </p>
        </div>

        {/* FILTER */}
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

      {/* TABLE */}
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

export default MyLeave;
