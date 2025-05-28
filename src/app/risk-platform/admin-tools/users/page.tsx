import { Suspense } from "react";
import { UsersTable } from "@/components/features/users/table";

export const metadata = {
  title: "CTS | Users",
  description: "Users page for CTS",
};

export default function Page() {
  return (
    <div className="px-12 pt-6">
        <UsersTable />
    </div>
  );
}