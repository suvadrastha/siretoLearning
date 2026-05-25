import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithAuth } from "./baseQuery";

export type LeaveStatus = "APPROVED" | "PENDING" | "REJECTED";

export type LeaveType = "CASUAL" | "SICK" | "VACATION";

export type ApplyLeaveRequest = {
  startDate: string;
  endDate: string;
  leaveType: LeaveType;
  reason: string;
};

export type LeaveEmployee = {
  fullName?: string;
  fullname?: string;
  username?: string;
  email?: string;
};

export type LeaveReviewer = {
  fullName?: string;
  fullname?: string;
  username?: string;
};

export type LeaveRequest = {
  requestId: number;
  employee?: LeaveEmployee;
  reviewedBy?: LeaveReviewer | null;
  rejectionReason?: string | null;
  status: LeaveStatus;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
};

export type LeaveStatistics = {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
};

export type AdminLeavesQuery = {
  status?: LeaveStatus | "";
  username?: string;
};

export type ReviewLeaveRequest = {
  requestId: number;
  status: Extract<LeaveStatus, "APPROVED" | "REJECTED">;
  rejectionReason?: string;
};

const buildAdminLeavesParams = ({ status, username }: AdminLeavesQuery) => {
  const params: Record<string, string> = {};

  if (status) {
    params.status = status;
  }

  if (username) {
    params.username = username;
  }

  return params;
};

export const leavesApi = createApi({
  reducerPath: "leavesApi",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Leaves"],
  endpoints: (builder) => ({
    getMyLeaves: builder.query<LeaveRequest[], LeaveStatus | "" | void>({
      query: (status) => ({
        url: "/leaves/my",
        params: status ? { status } : undefined,
      }),
      providesTags: ["Leaves"],
    }),

    getMyLeaveStatistics: builder.query<LeaveStatistics, void>({
      query: () => ({
        url: "/leaves/my/statistics",
      }),
      providesTags: ["Leaves"],
    }),

    getColleaguesUpcomingApprovedLeaves: builder.query<LeaveRequest[], void>({
      query: () => ({
        url: "/leaves/colleagues/upcoming-approved",
      }),
      providesTags: ["Leaves"],
    }),

    applyLeave: builder.mutation<LeaveRequest, ApplyLeaveRequest>({
      query: (body) => ({
        url: "/leaves/apply",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Leaves"],
    }),

    getAdminLeaves: builder.query<LeaveRequest[], AdminLeavesQuery | void>({
      query: (query) => ({
        url: "/leaves/admin/all",
        params: buildAdminLeavesParams(query ?? {}),
      }),
      providesTags: ["Leaves"],
    }),

    getAdminLeaveStatistics: builder.query<LeaveStatistics, void>({
      query: () => ({
        url: "/leaves/admin/statistics",
      }),
      providesTags: ["Leaves"],
    }),

    getAdminPendingLeaves: builder.query<LeaveRequest[], void>({
      query: () => ({
        url: "/leaves/admin/all",
        params: { status: "PENDING" },
      }),
      providesTags: ["Leaves"],
    }),

    reviewLeaveRequest: builder.mutation<LeaveRequest, ReviewLeaveRequest>({
      query: ({ requestId, status, rejectionReason }) => ({
        url: `/leaves/admin/${requestId}/review`,
        method: "PUT",
        body:
          status === "APPROVED"
            ? { status }
            : { status, rejectionReason },
      }),
      invalidatesTags: ["Leaves"],
    }),
  }),
});

export const {
  useApplyLeaveMutation,
  useGetAdminLeaveStatisticsQuery,
  useGetAdminLeavesQuery,
  useGetAdminPendingLeavesQuery,
  useGetColleaguesUpcomingApprovedLeavesQuery,
  useGetMyLeaveStatisticsQuery,
  useGetMyLeavesQuery,
  useReviewLeaveRequestMutation,
} = leavesApi;
