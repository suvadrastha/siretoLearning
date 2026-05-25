import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  useApplyLeaveMutation,
  type ApplyLeaveRequest,
} from "../api/leavesApi";

const ApplyLeave = () => {
  const [applyLeave, { isLoading: isApplyingLeave }] =
    useApplyLeaveMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ApplyLeaveRequest>();

  const onSubmit = async (data: ApplyLeaveRequest) => {
    try {
      await applyLeave(data).unwrap();
      toast.success("Leave applied successfully");
      reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to apply leave");
    }
  };

  return (
    <div className="w-full bg-white p-4 sm:p-6 lg:p-8">
      <div className="border-b border-gray-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
          Apply Leave
        </p>

        <p className="mt-3 text-gray-500">
          Fill the details below to request leave.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 max-w-3xl space-y-6"
      >
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* START DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Start Date
            </label>

            <input
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("startDate", {
                required: "Start date is required",
                validate: (value) => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);

                  const selectedDate = new Date(value);

                  return (
                    selectedDate >= today || "Start date cannot be before today"
                  );
                },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

            {errors.startDate && (
              <p className="mt-2 text-sm text-red-500">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* END DATE */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              End Date
            </label>

            <input
              type="date"
              {...register("endDate", {
                required: "End date is required",
                validate: (value, formValues) => {
                  if (!formValues.startDate) return true;

                  const startDate = new Date(formValues.startDate);
                  const endDate = new Date(value);

                  return (
                    endDate >= startDate ||
                    "End date must be after or equal to start date"
                  );
                },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
            />

            {errors.endDate && (
              <p className="mt-2 text-sm text-red-500">
                {errors.endDate.message}
              </p>
            )}
          </div>
        </div>

        {/* LEAVE TYPE */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Leave Type
          </label>

          <select
            {...register("leaveType", {
              required: "Leave type is required",
            })}
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          >
            <option value="">Select leave type</option>
            <option value="CASUAL">Casual</option>
            <option value="SICK">Sick</option>
            <option value="VACATION">Vacation</option>
          </select>

          {errors.leaveType && (
            <p className="mt-2 text-sm text-red-500">
              {errors.leaveType.message}
            </p>
          )}
        </div>

        {/* REASON */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Leave Reason
          </label>

          <textarea
            rows={3}
            placeholder="Write your leave reason..."
            {...register("reason", {
              required: "Leave reason is required",
              minLength: {
                value: 5,
                message: "Reason must be at least 5 characters",
              },
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
          />

          {errors.reason && (
            <p className="mt-2 text-sm text-red-500">{errors.reason.message}</p>
          )}
        </div>

        {/* BUTTON */}
        <button
          disabled={isSubmitting || isApplyingLeave}
          type="submit"
          className="w-full rounded-lg bg-violet-600 px-6 py-3 font-medium text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {isSubmitting || isApplyingLeave ? "Applying..." : "Apply Leave"}
        </button>
      </form>
    </div>
  );
};

export default ApplyLeave;
