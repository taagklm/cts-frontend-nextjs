
import { UsersTable } from "@/components/features/users";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "CTS | Users",
  description: "Users page for CTS",
};

export default function Page() {
  return (
    <div className="w-full max-w-[1280px] mx-auto sm:p-6">
      <Card className="border-none shadow-none">
        <div className="px-12 pt-0">
          <UsersTable />
        </div>
      </Card>
    </div>
  );
}