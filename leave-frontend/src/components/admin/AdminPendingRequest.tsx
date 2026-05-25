import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DataTable from "../DataTable";
import {
  useGetAdminPendingLeavesQuery,
  useReviewLeaveRequestMutation,
  type LeaveRequest,
} from "../../api/leavesApi";

const AdminPendingRequest = () => {
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const {
    data: leaves = [],
    isError,
    isFetching,
    isLoading,
  } = useGetAdminPendingLeavesQuery();
  const [reviewLeaveRequest, { isLoading: submitting }] =
    useReviewLeaveRequestMutation();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch pending requests");
    }
  }, [isError]);

  const reviewLeave = async (
    requestId: number,
    status: "APPROVED" | "REJECTED",
    reason?: string,
  ) => {
    try {
      await reviewLeaveRequest({
        requestId,
        status,
        rejectionReason: reason,
      }).unwrap();

      toast.success(
        status === "APPROVED"
          ? "Leave approved successfully"
          : "Leave rejected successfully",
      );

      setSelectedLeaveId(null);
      setRejectionReason("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update leave request");
    }
  };

  const handleReject = () => {
    if (selectedLeaveId === null) return;

    if (!rejectionReason.trim()) {
      toast.error("Rejection reason is required");
      return;
    }

    reviewLeave(selectedLeaveId, "REJECTED", rejectionReason);
  };

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
      header: "Action",
      accessor: (row: LeaveRequest) => (
        <div className="flex flex-wrap gap-2">
          <button
            disabled={submitting}
            onClick={() => reviewLeave(row.requestId, "APPROVED")}
            className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60"
          >
            Approve
          </button>

          <button
            disabled={submitting}
            onClick={() => setSelectedLeaveId(row.requestId)}
            className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            Reject
          </button>
        </div>
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
          Review all pending leave requests submitted by employees.
        </p>
      </div>

      <div className="mt-8">
        {isLoading || isFetching ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 sm:p-8">
            Loading pending requests...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={leaves}
            emptyMessage="No pending requests found"
          />
        )}
      </div>

      {selectedLeaveId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl sm:p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Reject Leave Request
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Please enter a reason for rejecting this leave request.
            </p>

            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="mt-5 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

            <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
              <button
                disabled={submitting}
                onClick={() => {
                  setSelectedLeaveId(null);
                  setRejectionReason("");
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                disabled={submitting}
                onClick={handleReject}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {submitting ? "Rejecting..." : "Reject Leave"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPendingRequest;
