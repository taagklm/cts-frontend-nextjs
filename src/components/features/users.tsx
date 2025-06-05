"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { format, intervalToDuration } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table as TableComponent,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import { SheetDemo } from "./users/addUser";
import Loading from "../ui/loading";

const initialUsers = [
  {
    fullName: "John Doe",
    username: "johndoe",
    employeeCode: "JD001",
    email: "john.doe@example.com",
    tier: "Senior",
    roles: ["Trader"],
    team: "Alpha Team",
    traderUserMarkets: { PH: "PH123", JP: "JP456", US: "US789" },
    marketAllocation: { PH: 1000, JP: 500, US: 2000 },
    dateCreated: "2024-01-10",
    dateModified: "2024-02-15",
  },
  {
    fullName: "Jane Doe",
    username: "janedoe",
    employeeCode: "JD002",
    email: "jane.doe@example.com",
    tier: "Junior",
    roles: ["Researcher"],
    team: "Beta Team",
    traderUserMarkets: { PH: "PH124", JP: "", US: "" },
    marketAllocation: { PH: 500, JP: 0, US: 0 },
    dateCreated: "2024-01-12",
    dateModified: "2024-02-10",
  },
];

const columns = [
  { key: "fullName", label: "Full Name", sortable: true, hideMobile: false },
  { key: "username", label: "Username", sortable: true, hideMobile: false },
  { key: "email", label: "Email", sortable: true, hideMobile: false },
  { key: "tier", label: "Tier", sortable: true, hideMobile: true },
  { key: "roles", label: "Roles", sortable: true, hideMobile: true },
  { key: "team", label: "Team", sortable: true, hideMobile: true },
  { key: "dateCreated", label: "Created", sortable: true, hideMobile: false },
  { key: "dateModified", label: "Modified", sortable: true, hideMobile: false },
  { key: "actions", label: "Actions", sortable: false, hideMobile: false },
] as const;

const defaultVisibleColumns = columns.map((col) => col.key);

export function UsersTable() {
  const [users, setUsers] = useState(initialUsers);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [sortConfig, setSortConfig] = useState<{
    key: keyof typeof initialUsers[0] | null;
    direction: "asc" | "desc";
  }>({ key: null, direction: "asc" });
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumns);
  const [selectedUser, setSelectedUser] = useState<typeof initialUsers[0] | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    fullName: "",
    username: "",
    employeeCode: "",
    email: "",
    tier: "",
    roles: [] as string[],
    team: "",
    traderUserMarkets: { PH: "", JP: "", US: "" },
    marketAllocation: { PH: "", JP: "", US: "" },
  });

  const roleOptions = ["Admin", "Trader", "Risk Manager", "Researcher"];
  const teamOptions = ["Alpha Team", "Beta Team", "Gamma Team", "Delta Team"];

  // Simulate async data fetch (replace with actual API call)
  useEffect(() => {
    setIsLoading(true);
    // Example: Replace with your API call
    setTimeout(() => {
      setUsers(initialUsers);
      setIsLoading(false);
    }, 1000);
  }, []);

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return users;
    return [...users].sort((a, b) => {
      const key = sortConfig.key as keyof typeof initialUsers[0];
      const aValue = key === "roles" ? a[key].join(", ") : a[key];
      const bValue = key === "roles" ? b[key].join(", ") : b[key];
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortConfig]);

  const toggleColumn = useCallback((columnKey: string) => {
    setVisibleColumns((prev) =>
      prev.includes(columnKey) ? prev.filter((key) => key !== columnKey) : [...prev, columnKey]
    );
  }, []);

  const resetColumns = useCallback(() => {
    setVisibleColumns(defaultVisibleColumns);
  }, []);

  const sortUsers = useCallback((key: keyof typeof initialUsers[0]) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  }, []);

  const handleAddUser = useCallback(
    (newUser: typeof initialUsers[0]) => {
      setUsers((prev) => {
        const updated = [...prev, newUser];
        if (sortConfig.key) {
          return updated.sort((a, b) => {
            const key = sortConfig.key as keyof typeof initialUsers[0];
            const aValue = key === "roles" ? a[key].join(", ") : a[key];
            const bValue = key === "roles" ? b[key].join(", ") : b[key];
            if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
            return 0;
          });
        }
        return updated;
      });
      console.log("Added user:", newUser);
    },
    [sortConfig]
  );

  const handleDeleteUser = useCallback((username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      setUsers((prev) => prev.filter((user) => user.username !== username));
    }
  }, []);

  const handleViewUser = useCallback((user: typeof initialUsers[0]) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  }, []);

  const handleEditUser = useCallback((user: typeof initialUsers[0]) => {
    setSelectedUser(user);
    setEditForm({
      fullName: user.fullName,
      username: user.username,
      employeeCode: user.employeeCode,
      email: user.email,
      tier: user.tier,
      roles: user.roles,
      team: user.team,
      traderUserMarkets: { ...user.traderUserMarkets },
      marketAllocation: {
        PH: user.marketAllocation.PH.toString(),
        JP: user.marketAllocation.JP.toString(),
        US: user.marketAllocation.US.toString(),
      },
    });
    setIsEditOpen(true);
  }, []);

  const handleEditSubmit = useCallback(() => {
    if (!selectedUser) return;

    const updatedUser = {
      ...selectedUser,
      fullName: editForm.fullName,
      username: editForm.username,
      employeeCode: editForm.employeeCode,
      email: editForm.email,
      tier: editForm.tier,
      roles: editForm.roles,
      team: editForm.team,
      traderUserMarkets: editForm.traderUserMarkets,
      marketAllocation: {
        PH: editForm.marketAllocation.PH === "" ? 0 : Number(editForm.marketAllocation.PH),
        JP: editForm.marketAllocation.JP === "" ? 0 : Number(editForm.marketAllocation.JP),
        US: editForm.marketAllocation.US === "" ? 0 : Number(editForm.marketAllocation.US),
      },
      dateModified: new Date().toISOString().split("T")[0],
    };

    setUsers((prev) => {
      const updated = prev.map((user) =>
        user.username === selectedUser.username ? updatedUser : user
      );
      if (sortConfig.key) {
        return updated.sort((a, b) => {
          const key = sortConfig.key as keyof typeof initialUsers[0];
          const aValue = key === "roles" ? a[key].join(", ") : a[key];
          const bValue = key === "roles" ? b[key].join(", ") : b[key];
          if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
      return updated;
    });

    setIsEditOpen(false);
    console.log("Edited user:", updatedUser);
  }, [selectedUser, editForm, sortConfig]);

  const handleEditMarketChange = useCallback(
    (market: "PH" | "JP" | "US", value: string, type: "id" | "allocation") => {
      setEditForm((prev) => ({
        ...prev,
        [type === "id" ? "traderUserMarkets" : "marketAllocation"]: {
          ...prev[type === "id" ? "traderUserMarkets" : "marketAllocation"],
          [market]: value,
        },
      }));
    },
    []
  );

  const handleEditRoleChange = useCallback((role: string, checked: boolean) => {
    setEditForm((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, role] : prev.roles.filter((r) => r !== role),
    }));
  }, []);

  const debounce = (func: () => void, wait: number) => {
    let timeout: NodeJS.Timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-start justify-center font-sans text-sm font-normal w-full max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
        <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-6 pb-4 bg-white dark:bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-semibold pb-0">User Information</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled>
                  Columns <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" disabled>
                  Add User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <Loading variant="table" rows={6} className="w-full" /> {/* 6 rows: 1 header + 5 data */}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-center font-sans text-sm font-normal w-full max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
      <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-6 pb-4 bg-white dark:bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold pb-0">User Information</CardTitle>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[60vh] overflow-y-auto">
                  <DropdownMenuItem onClick={resetColumns}>Reset to Default</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={visibleColumns.includes(column.key)}
                      onCheckedChange={() => toggleColumn(column.key)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <SheetDemo onAddUser={handleAddUser} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-2">
          <div
            className="w-full flex-grow rounded-md border p-2 mb-2 overflow-x-auto overflow-y-auto max-h-[500px]"
            style={{ minWidth: "800px" }}
          >
            <TableComponent className="min-w-[800px] w-full">
              <TableHeader className="sticky top-0 bg-white dark:bg-gray-900 z-10 shadow-sm">
                <TableRow>
                  {columns.map(
                    (column) =>
                      visibleColumns.includes(column.key) && (
                        <TableHead
                          key={column.key}
                          className={`text-center text-sm font-semibold px-1 h-10 align-middle whitespace-nowrap truncate ${
                            column.hideMobile ? "hidden sm:table-cell" : ""
                          }`}
                          onClick={() =>
                            column.sortable &&
                            sortUsers(column.key as keyof typeof initialUsers[0])
                          }
                        >
                          {column.sortable ? (
                            <Button
                              variant="ghost"
                              className="p-0 flex items-center gap-1 justify-center w-full"
                            >
                              {column.label}
                              {sortConfig.key === column.key &&
                                (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                            </Button>
                          ) : (
                            column.label
                          )}
                        </TableHead>
                      )
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUsers.length ? (
                  sortedUsers.map((user, index) => (
                    <TableRow key={`${user.username}-${index}`}>
                      {columns.map(
                        (column) =>
                          visibleColumns.includes(column.key) && (
                            <TableCell
                              key={column.key}
                              className={`text-center px-1 py-0 text-xs truncate text-ellipsis overflow-hidden ${
                                column.hideMobile ? "hidden sm:table-cell" : ""
                              }`}
                              style={{ minHeight: "24px", lineHeight: "1rem" }}
                              title={
                                column.key !== "actions"
                                  ? column.key === "roles"
                                    ? user.roles.join(", ")
                                    : String(user[column.key as keyof typeof user])
                                  : undefined
                              }
                            >
                              {column.key === "actions" ? (
                                <div className="flex gap-1 justify-center items-center h-full">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title={`View ${user.username}`}
                                        onClick={() => handleViewUser(user)}
                                      >
                                        <Eye size={12} className="text-blue-500" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-2xl text-sm font-normal z-50 bg-white dark:bg-gray-900">
                                      <DialogHeader>
                                        <DialogTitle className="text-2xl font-semibold">
                                          User Details: {user.fullName}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-normal">
                                          View user account details below.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-4 py-4">
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Full Name:</span>
                                          <span>{user.fullName}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Username:</span>
                                          <span>{user.username}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Employee Code:</span>
                                          <span>{user.employeeCode}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Email:</span>
                                          <span>{user.email}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Tier:</span>
                                          <span>{user.tier}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Roles:</span>
                                          <span>{user.roles.join(", ")}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Team:</span>
                                          <span>{user.team}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-start gap-2">
                                          <span className="font-semibold">Trader User Markets:</span>
                                          <div>
                                            <div>PH: {user.traderUserMarkets.PH || "N/A"}</div>
                                            <div>JP: {user.traderUserMarkets.JP || "N/A"}</div>
                                            <div>US: {user.traderUserMarkets.US || "N/A"}</div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 items-start gap-2">
                                          <span className="font-semibold">Market Allocation:</span>
                                          <div>
                                            <div>PH: {user.marketAllocation.PH}</div>
                                            <div>JP: {user.marketAllocation.JP}</div>
                                            <div>US: {user.marketAllocation.US}</div>
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Date Created:</span>
                                          <span>{user.dateCreated}</span>
                                        </div>
                                        <div className="grid grid-cols-2 items-center gap-2">
                                          <span className="font-semibold">Date Modified:</span>
                                          <span>{user.dateModified}</span>
                                        </div>
                                      </div>
                                      <div className="flex justify-end">
                                        <Button
                                          variant="outline"
                                          onClick={() => setIsViewOpen(false)}
                                          className="text-sm font-normal"
                                        >
                                          Close
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        title={`Edit ${user.username}`}
                                        onClick={() => handleEditUser(user)}
                                      >
                                        <Pencil size={12} className="text-green-500" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                      className="max-w-2xl overflow-y-auto max-h-[80vh] font-sans text-sm font-normal z-50 bg-white dark:bg-gray-900"
                                      style={{ width: "650px", maxWidth: "90vw" }}
                                    >
                                      <DialogHeader>
                                        <DialogTitle className="text-2xl font-semibold">
                                          Edit User: {user.fullName}
                                        </DialogTitle>
                                        <DialogDescription className="text-sm font-normal">
                                          Modify user details below.
                                        </DialogDescription>
                                      </DialogHeader>
                                      <div className="grid gap-6 py-4">
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label
                                            htmlFor="edit-fullName"
                                            className="text-right text-sm font-normal"
                                          >
                                            Full Name
                                          </Label>
                                          <Input
                                            id="edit-fullName"
                                            value={editForm.fullName}
                                            onChange={(e) =>
                                              setEditForm((prev) => ({
                                                ...prev,
                                                fullName: e.target.value,
                                              }))
                                            }
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label
                                            htmlFor="edit-username"
                                            className="text-right text-sm font-normal"
                                          >
                                            Username
                                          </Label>
                                          <Input
                                            id="edit-username"
                                            value={editForm.username}
                                            onChange={(e) =>
                                              setEditForm((prev) => ({
                                                ...prev,
                                                username: e.target.value,
                                              }))
                                            }
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label
                                            htmlFor="edit-employeeCode"
                                            className="text-right text-sm font-normal"
                                          >
                                            Employee Code
                                          </Label>
                                          <Input
                                            id="edit-employeeCode"
                                            value={editForm.employeeCode}
                                            onChange={(e) =>
                                              setEditForm((prev) => ({
                                                ...prev,
                                                employeeCode: e.target.value,
                                              }))
                                            }
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label
                                            htmlFor="edit-email"
                                            className="text-right text-sm font-normal"
                                          >
                                            Email
                                          </Label>
                                          <Input
                                            id="edit-email"
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) =>
                                              setEditForm((prev) => ({
                                                ...prev,
                                                email: e.target.value,
                                              }))
                                            }
                                            className="col-span-3 text-sm font-normal"
                                          />
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label
                                            htmlFor="edit-tier"
                                            className="text-right text-sm font-normal"
                                          >
                                            Tier
                                          </Label>
                                          <Select
                                            value={editForm.tier}
                                            onValueChange={(value) =>
                                              setEditForm((prev) => ({ ...prev, tier: value }))
                                            }
                                          >
                                            <SelectTrigger
                                              id="edit-tier"
                                              className="col-span-3 text-sm font-normal"
                                            >
                                              <SelectValue placeholder="Select Tier" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="Senior">Senior</SelectItem>
                                              <SelectItem value="Junior">Junior</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                          <Label className="text-right text-sm font-normal">Roles</Label>
                                          <div className="col-span-3 space-y-2">
                                            {roleOptions.map((role) => (
                                              <div key={role} className="flex items-center gap-2">
                                                <Checkbox
                                                  id={`edit-role-${role}`}
                                                  checked={editForm.roles.includes(role)}
                                                  onCheckedChange={(checked) =>
                                                    handleEditRoleChange(role, checked as boolean)
                                                  }
                                                />
                                                <Label
                                                  htmlFor={`edit-role-${role}`}
                                                  className="text-sm font-normal"
                                                >
                                                  {role}
                                                </Label>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-center gap-4">
                                          <Label
                                            htmlFor="edit-team"
                                            className="text-right text-sm font-normal"
                                          >
                                            Team
                                          </Label>
                                          <Select
                                            value={editForm.team}
                                            onValueChange={(value) =>
                                              setEditForm((prev) => ({ ...prev, team: value }))
                                            }
                                          >
                                            <SelectTrigger
                                              id="edit-team"
                                              className="col-span-3 text-sm font-normal"
                                            >
                                              <SelectValue placeholder="Select Team" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {teamOptions.map((teamName) => (
                                                <SelectItem key={teamName} value={teamName}>
                                                  {teamName}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                          <Label className="text-right text-sm font-normal">
                                            Trader User Markets
                                          </Label>
                                          <div className="col-span-3 space-y-2">
                                            {(["PH", "JP", "US"] as const).map((market) => (
                                              <div key={market} className="flex items-center gap-2">
                                                <Label
                                                  htmlFor={`edit-market-${market}`}
                                                  className="w-10 text-sm font-normal"
                                                >
                                                  {market}
                                                </Label>
                                                <Input
                                                  id={`edit-market-${market}`}
                                                  value={editForm.traderUserMarkets[market]}
                                                  onChange={(e) =>
                                                    handleEditMarketChange(market, e.target.value, "id")
                                                  }
                                                  placeholder={`Account ID for ${market}`}
                                                  className="flex-1 text-sm font-normal"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                        <div className="grid grid-cols-4 items-start gap-4">
                                          <Label className="text-right text-sm font-normal">
                                            Market Allocation
                                          </Label>
                                          <div className="col-span-3 space-y-2">
                                            {(["PH", "JP", "US"] as const).map((market) => (
                                              <div key={market} className="flex items-center gap-2">
                                                <Label
                                                  htmlFor={`edit-allocation-${market}`}
                                                  className="w-10 text-sm font-normal"
                                                >
                                                  {market}
                                                </Label>
                                                <Input
                                                  id={`edit-allocation-${market}`}
                                                  type="number"
                                                  value={editForm.marketAllocation[market]}
                                                  onChange={(e) =>
                                                    handleEditMarketChange(market, e.target.value, "allocation")
                                                  }
                                                  placeholder={`Amount for ${market}`}
                                                  className="flex-1 text-sm font-normal"
                                                />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex justify-end gap-2">
                                        <Button
                                          variant="outline"
                                          onClick={() => setIsEditOpen(false)}
                                          className="text-sm font-normal"
                                        >
                                          Cancel
                                        </Button>
                                        <Button
                                          onClick={handleEditSubmit}
                                          className="text-sm font-normal"
                                        >
                                          Save
                                        </Button>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteUser(user.username)}
                                    title={`Delete ${user.username}`}
                                  >
                                    <Trash2 size={12} className="text-red-500" />
                                  </Button>
                                </div>
                              ) : column.key === "roles" ? (
                                user.roles.join(", ")
                              ) : (
                                String(user[column.key as keyof typeof user])
                              )}
                            </TableCell>
                          )
                      )}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="text-center px-1 py-1 text-xs truncate text-ellipsis overflow-hidden"
                      style={{ minHeight: "24px", lineHeight: "1rem" }}
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableComponent>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}