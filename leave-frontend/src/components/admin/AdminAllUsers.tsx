import { useEffect } from "react";
import toast from "react-hot-toast";
import type { UserProfile } from "../../auth";
import { useGetAdminUsersQuery } from "../../api/usersApi";
import DataTable from "../DataTable";

function getDisplayName(user: UserProfile) {
  return user.fullname || user.fullName || user.username;
}

const AdminAllUsers = () => {
  const {
    data: users = [],
    isError,
    isFetching,
    isLoading,
  } = useGetAdminUsersQuery();

  useEffect(() => {
    if (isError) {
      toast.error("Failed to fetch users");
    }
  }, [isError]);

  const columns = [
    {
      header: "Full Name",
      accessor: (row: UserProfile) => getDisplayName(row),
    },
    {
      header: "Username",
      accessor: (row: UserProfile) => row.username || "-",
    },
    {
      header: "Email",
      accessor: (row: UserProfile) => row.email || "-",
    },
    // {
    //   header: "Role",
    //   accessor: (row: UserProfile) => row.role || "-",
    // },
  ];

  return (
    <div className="w-full bg-white p-4 sm:p-6 lg:p-8">
      <div className="border-b border-gray-200 pb-6">
        <p className="text-sm font-bold uppercase tracking-wide text-violet-600">
          Admin
        </p>

        <p className="mt-2 text-gray-500">View all registered users.</p>
      </div>

      <div className="mt-8">
        {isLoading || isFetching ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center text-gray-500 sm:p-8">
            Loading users...
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            emptyMessage="No users found"
          />
        )}
      </div>
    </div>
  );
};

export default AdminAllUsers;
