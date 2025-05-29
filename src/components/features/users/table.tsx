"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table as TableComponent, TableCaption, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronUp, ChevronDown, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SheetDemo } from "./addUser";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "@/components/ui/pagination";

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

export function UsersTable() {
  const [users, setUsers] = useState(initialUsers);
  const [sortConfig, setSortConfig] = useState<{ key: keyof typeof initialUsers[0] | null; direction: "asc" | "desc" }>({
    key: null,
    direction: "asc",
  });
  const [selectedUser, setSelectedUser] = useState<typeof initialUsers[0] | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  const sortUsers = (key: keyof typeof initialUsers[0]) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }

    const sorted = [...users].sort((a, b) => {
      const aValue = key === "roles" ? a[key].join(", ") : a[key];
      const bValue = key === "roles" ? b[key].join(", ") : b[key];
      if (aValue < bValue) return direction === "asc" ? -1 : 1;
      if (aValue > bValue) return direction === "asc" ? 1 : -1;
      return 0;
    });

    setSortConfig({ key, direction });
    setUsers(sorted);
    setCurrentPage(1);
  };

  const handleAddUser = (newUser: {
    fullName: string;
    username: string;
    employeeCode: string;
    email: string;
    tier: string;
    roles: string[];
    team: string;
    traderUserMarkets: { PH: string; JP: string; US: string };
    marketAllocation: { PH: number; JP: number; US: number };
    dateCreated: string;
    dateModified: string;
  }) => {
    const updatedUsers = [...users, newUser];
    if (sortConfig.key) {
      const sorted = [...updatedUsers].sort((a, b) => {
        const key = sortConfig.key as keyof typeof initialUsers[0];
        const aValue = key === "roles" ? a[key].join(", ") : a[key];
        const bValue = key === "roles" ? b[key].join(", ") : b[key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
      setUsers(sorted);
    } else {
      setUsers(updatedUsers);
    }
    console.log("Added user:", newUser);
  };

  const handleDeleteUser = (username: string) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      const updatedUsers = users.filter((user) => user.username !== username);
      setUsers(updatedUsers);
      const totalPages = Math.ceil(updatedUsers.length / itemsPerPage);
      if (currentPage > totalPages) setCurrentPage(totalPages || 1);
    }
  };

  const handleViewUser = (user: typeof initialUsers[0]) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleEditUser = (user: typeof initialUsers[0]) => {
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
  };

  const handleEditSubmit = () => {
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

    const updatedUsers = users.map((user) =>
      user.username === selectedUser.username ? updatedUser : user
    );
    if (sortConfig.key) {
      const sorted = [...updatedUsers].sort((a, b) => {
        const key = sortConfig.key as keyof typeof initialUsers[0];
        const aValue = key === "roles" ? a[key].join(", ") : a[key];
        const bValue = key === "roles" ? b[key].join(", ") : b[key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
      setUsers(sorted);
    } else {
      setUsers(updatedUsers);
    }

    setIsEditOpen(false);
    console.log("Edited user:", updatedUser);
  };

  const handleEditMarketChange = (market: "PH" | "JP" | "US", value: string, type: "id" | "allocation") => {
    if (type === "id") {
      setEditForm((prev) => ({
        ...prev,
        traderUserMarkets: { ...prev.traderUserMarkets, [market]: value },
      }));
    } else {
      setEditForm((prev) => ({
        ...prev,
        marketAllocation: { ...prev.marketAllocation, [market]: value },
      }));
    }
  };

  const handleEditRoleChange = (role: string, checked: boolean) => {
    setEditForm((prev) => ({
      ...prev,
      roles: checked ? [...prev.roles, role] : prev.roles.filter((r) => r !== role),
    }));
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const paginatedData = users.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  console.log("Rendering UsersTable with users:", users);

  return (
    <div className="flex items-start justify-center font-sans text-sm font-normal w-full ml-12 max-w-[calc(100%-16rem)] sm:max-w-[1280px]">
      <Card className="sm:max-w-6xl max-w-full w-full mx-2 overflow-hidden pt-4 pb-6 bg-white dark:bg-gray-900">
        <div className="grid grid-cols-3">
          <div className="col-span-2">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold">User Information</CardTitle>
              <CardDescription className="pb-0 text-sm font-normal">
                User account creation and modification dates
              </CardDescription>
            </CardHeader>
          </div>
          <div className="col-span-1 flex justify-end pt-5 pr-6">
            <SheetDemo onAddUser={handleAddUser} />
          </div>
        </div>

        <CardContent>
          <div className="w-full flex-grow rounded-md border p-1">
            <TableComponent className="min-w-0 w-full">
              <TableCaption className="text-sm font-normal">A list of registered users.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("fullName")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Full Name
                      {sortConfig.key === "fullName" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("username")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Username
                      {sortConfig.key === "username" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("email")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Email
                      {sortConfig.key === "email" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("tier")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Tier
                      {sortConfig.key === "tier" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("roles")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Roles
                      {sortConfig.key === "roles" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("team")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Team
                      {sortConfig.key === "team" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("dateCreated")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Date Created
                      {sortConfig.key === "dateCreated" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer select-none text-sm font-semibold px-1 text-center"
                    onClick={() => sortUsers("dateModified")}
                  >
                    <span className="flex items-center gap-1 justify-center">
                      Date Modified
                      {sortConfig.key === "dateModified" ? (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )
                      ) : null}
                    </span>
                  </TableHead>
                  <TableHead className="text-sm font-semibold px-1 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.map((user, index) => (
                  <TableRow key={`${user.username}-${index}`}>
                    <TableCell className="py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.fullName}</TableCell>
                    <TableCell className="py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.username}</TableCell>
                    <TableCell className="py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.email}</TableCell>
                    <TableCell className="py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.tier}</TableCell>
                    <TableCell className="py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.roles.join(", ")}</TableCell>
                    <TableCell className="py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.team}</TableCell>
                    <TableCell className="text-right py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.dateCreated}</TableCell>
                    <TableCell className="text-right py-1 px-1 text-sm font-normal truncate text-ellipsis">{user.dateModified}</TableCell>
                    <TableCell className="text-right py-1 px-1 flex gap-0.5 justify-end">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={`View ${user.username}`}
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
                              <Label htmlFor="edit-fullName" className="text-right text-sm font-normal">
                                Full Name
                              </Label>
                              <Input
                                id="edit-fullName"
                                value={editForm.fullName}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
                                className="col-span-3 text-sm font-normal"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-username" className="text-right text-sm font-normal">
                                Username
                              </Label>
                              <Input
                                id="edit-username"
                                value={editForm.username}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, username: e.target.value }))}
                                className="col-span-3 text-sm font-normal"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-employeeCode" className="text-right text-sm font-normal">
                                Employee Code
                              </Label>
                              <Input
                                id="edit-employeeCode"
                                value={editForm.employeeCode}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, employeeCode: e.target.value }))}
                                className="col-span-3 text-sm font-normal"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-email" className="text-right text-sm font-normal">
                                Email
                              </Label>
                              <Input
                                id="edit-email"
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="col-span-3 text-sm font-normal"
                              />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-tier" className="text-right text-sm font-normal">
                                Tier
                              </Label>
                              <Select
                                value={editForm.tier}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, tier: value }))}
                              >
                                <SelectTrigger id="edit-tier" className="col-span-3 text-sm font-normal">
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
                                      onCheckedChange={(checked) => handleEditRoleChange(role, checked as boolean)}
                                    />
                                    <Label htmlFor={`edit-role-${role}`} className="text-sm font-normal">
                                      {role}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <Label htmlFor="edit-team" className="text-right text-sm font-normal">
                                Team
                              </Label>
                              <Select
                                value={editForm.team}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, team: value }))}
                              >
                                <SelectTrigger id="edit-team" className="col-span-3 text-sm font-normal">
                                  <SelectValue placeholder="Select Team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teamOptions.map((teamName) => (
                                    <SelectItem key={teamName} value={teamName}>{teamName}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label className="text-right text-sm font-normal">Trader User Markets</Label>
                              <div className="col-span-3 space-y-2">
                                {(["PH", "JP", "US"] as const).map((market) => (
                                  <div key={market} className="flex items-center gap-2">
                                    <Label htmlFor={`edit-market-${market}`} className="w-10 text-sm font-normal">
                                      {market}
                                    </Label>
                                    <Input
                                      id={`edit-market-${market}`}
                                      value={editForm.traderUserMarkets[market]}
                                      onChange={(e) => handleEditMarketChange(market, e.target.value, "id")}
                                      placeholder={`Account ID for ${market}`}
                                      className="flex-1 text-sm font-normal"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-4 items-start gap-4">
                              <Label className="text-right text-sm font-normal">Market Allocation</Label>
                              <div className="col-span-3 space-y-2">
                                {(["PH", "JP", "US"] as const).map((market) => (
                                  <div key={market} className="flex items-center gap-2">
                                    <Label htmlFor={`edit-allocation-${market}`} className="w-10 text-sm font-normal">
                                      {market}
                                    </Label>
                                    <Input
                                      id={`edit-allocation-${market}`}
                                      type="number"
                                      value={editForm.marketAllocation[market]}
                                      onChange={(e) => handleEditMarketChange(market, e.target.value, "allocation")}
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
                            <Button onClick={handleEditSubmit} className="text-sm font-normal">Save</Button>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableComponent>
            {totalPages > 1 && (
              <div className="mt-2 mb-2">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage > 1) handlePageClick(currentPage - 1);
                        }}
                      />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === index + 1}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageClick(index + 1);
                          }}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          if (currentPage < totalPages) handlePageClick(currentPage + 1);
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}