"use client";

import { useState } from "react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import { DatePickerWithRange } from "../trade-analytics/burger-menu/date-picker";

interface SheetDemoProps {
  onAddUser: (user: {
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
  }) => void;
}

export function SheetDemo({ onAddUser }: SheetDemoProps) {
  const today = new Date();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState("");
  const [roles, setRoles] = useState<string[]>([]);
  const [team, setTeam] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [traderUserMarkets, setTraderUserMarkets] = useState({ PH: "", JP: "", US: "" });
  const [marketAllocation, setMarketAllocation] = useState({ PH: "", JP: "", US: "" });
  const [dateCreated, setDateCreated] = useState<Date | undefined>(today);
  const [dateModified, setDateModified] = useState<Date | undefined>(today);
  const [isDateCreatedValid, setIsDateCreatedValid] = useState(true);
  const [isDateModifiedValid, setIsDateModifiedValid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleOptions = ["Admin", "Trader", "Risk Manager", "Researcher"];
  const teamOptions = ["Alpha Team", "Beta Team", "Gamma Team", "Delta Team"];

  const handleRoleChange = (role: string, checked: boolean) => {
    setRoles((prev) => (checked ? [...prev, role] : prev.filter((r) => r !== role)));
  };

  const handleMarketChange = (market: "PH" | "JP" | "US", value: string, type: "id" | "allocation") => {
    if (type === "id") {
      setTraderUserMarkets((prev) => ({ ...prev, [market]: value }));
    } else {
      setMarketAllocation((prev) => ({ ...prev, [market]: value }));
    }
  };

  const resetForm = () => {
    setFullName("");
    setUsername("");
    setEmployeeCode("");
    setEmail("");
    setTier("");
    setRoles([]);
    setTeam("");
    setPassword("");
    setConfirmPassword("");
    setTraderUserMarkets({ PH: "", JP: "", US: "" });
    setMarketAllocation({ PH: "", JP: "", US: "" });
    setDateCreated(today);
    setDateModified(today);
    setError(null);
  };

  const validateForm = () => {
    if (!fullName.trim()) return "Full Name is required";
    if (!username.trim()) return "Username is required";
    if (!employeeCode.trim()) return "Employee Code is required";
    if (!email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email format";
    if (!tier) return "Tier is required";
    if (!roles.length) return "At least one role is required";
    if (!team) return "Team is required";
    if (!password) return "Password is required";
    if (password !== confirmPassword) return "Passwords do not match";
    if (!dateCreated || isNaN(dateCreated.getTime())) return "Valid Created Date is required";
    if (!dateModified || isNaN(dateModified.getTime())) return "Valid Modified Date is required";
    if (dateCreated > today) return "Created Date cannot be in the future";
    if (dateModified > today) return "Modified Date cannot be in the future";
    if (dateModified < dateCreated) return "Modified Date cannot be before Created Date";
    for (const market of ["PH", "JP", "US"] as const) {
      const allocation = marketAllocation[market];
      if (allocation && (isNaN(Number(allocation)) || Number(allocation) < 0)) {
        return `Invalid allocation for ${market}`;
      }
    }
    return null;
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      alert(validationError);
      return;
    }

    const newUser = {
      fullName,
      username,
      employeeCode,
      email,
      tier,
      roles,
      team,
      traderUserMarkets,
      marketAllocation: {
        PH: marketAllocation.PH === "" ? 0 : Number(marketAllocation.PH),
        JP: marketAllocation.JP === "" ? 0 : Number(marketAllocation.JP),
        US: marketAllocation.US === "" ? 0 : Number(marketAllocation.US),
      },
      dateCreated: dateCreated!.toISOString().split("T")[0],
      dateModified: dateModified!.toISOString().split("T")[0],
    };

    onAddUser(newUser);
    resetForm();
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="text-sm font-normal">
          <Plus className="w-6 h-6" />
        </Button>
      </SheetTrigger>
      <SheetContent
        className="overflow-y-auto font-sans text-sm font-normal bg-white dark:bg-gray-900 px-6"
        style={{ width: "650px", maxWidth: "90vw" }}
      >
        <SheetHeader className="pt-4 pl-0 pr-0 pb-0">
          <SheetTitle className="text-2xl font-semibold">Add User</SheetTitle>
          <SheetDescription className="text-sm font-normal text-left">
            Enter the details below to add a new user.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-2">
          {/* Full Name */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="fullName" className="text-right text-sm font-normal">
              Full Name
            </Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="col-span-3 text-sm font-normal"
            />
          </div>

          {/* Username */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-sm font-normal">
              Username
            </Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="col-span-3 text-sm font-normal"
            />
          </div>

          {/* Employee Code */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="employeeCode" className="text-right text-sm font-normal">
              Employee Code
            </Label>
            <Input
              id="employeeCode"
              value={employeeCode}
              onChange={(e) => setEmployeeCode(e.target.value)}
              className="col-span-3 text-sm font-normal"
            />
          </div>

          {/* Email */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right text-sm font-normal">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3 text-sm font-normal"
            />
          </div>

          {/* Tier */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tier" className="text-right text-sm font-normal">
              Tier
            </Label>
            <Select value={tier} onValueChange={setTier}>
              <SelectTrigger id="tier" className="col-span-3 text-sm font-normal">
                <SelectValue placeholder="Select Tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Senior">Senior</SelectItem>
                <SelectItem value="Junior">Junior</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Roles */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-sm font-normal">Roles</Label>
            <div className="col-span-3 flex flex-row flex-wrap gap-4">
              {roleOptions.map((role) => (
                <div key={role} className="flex items-center gap-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={roles.includes(role)}
                    onCheckedChange={(checked) => handleRoleChange(role, checked as boolean)}
                    className="border-gray-300 dark:border-gray-600"
                  />
                  <Label htmlFor={`role-${role}`} className="text-sm font-normal">
                    {role}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Team */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="team" className="text-right text-sm font-normal">
              Team
            </Label>
            <Select value={team} onValueChange={setTeam}>
              <SelectTrigger id="team" className="col-span-3 text-sm font-normal">
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

          {/* Password */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right text-sm font-normal">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3 text-sm font-normal"
            />
          </div>

          {/* Confirm Password */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confirm-password" className="text-right text-sm font-normal">
              Confirm Password
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="col-span-3 text-sm font-normal"
            />
          </div>

          {/* Created Date */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="date-created" className="text-right text-sm font-normal">
              Created Date
            </Label>
            <div className="col-span-3">
              <DatePickerWithRange
                date={dateCreated}
                setDate={setDateCreated}
                mode="from"
                setError={setError}
                setIsValid={setIsDateCreatedValid}
              />
            </div>
          </div>

          {/* Modified Date */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="date-modified" className="text-right text-sm font-normal">
              Modified Date
            </Label>
            <div className="col-span-3">
              <DatePickerWithRange
                date={dateModified}
                setDate={setDateModified}
                mode="to"
                setError={setError}
                setIsValid={setIsDateModifiedValid}
              />
            </div>
          </div>

          {/* Trader User Markets */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-sm font-normal">Trader User Markets</Label>
            <div className="col-span-3 flex flex-row gap-4">
              {(["PH", "JP", "US"] as const).map((market) => (
                <div key={market} className="flex flex-col items-center gap-1">
                  <Label htmlFor={`market-${market}`} className="text-center text-sm font-normal">
                    {market}
                  </Label>
                  <Input
                    id={`market-${market}`}
                    value={traderUserMarkets[market]}
                    onChange={(e) => handleMarketChange(market, e.target.value, "id")}
                    placeholder={`${market} ID`}
                    className="w-20 text-sm font-normal"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Market Allocation */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right text-sm font-normal">Market Allocation</Label>
            <div className="col-span-3 flex flex-row gap-4">
              {(["PH", "JP", "US"] as const).map((market) => (
                <div key={market} className="flex flex-col items-center gap-1">
                  <Label htmlFor={`allocation-${market}`} className="text-center text-sm font-normal">
                    {market}
                  </Label>
                  <Input
                    id={`allocation-${market}`}
                    type="number"
                    value={marketAllocation[market]}
                    onChange={(e) => handleMarketChange(market, e.target.value, "allocation")}
                    placeholder={`${market} Amt`}
                    className="w-20 text-sm font-normal"
                    min="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 col-span-4 text-center">{error}</p>
          )}
        </div>
        <SheetFooter className="mt-4">
          <SheetClose asChild>
            <Button
              type="submit"
              onClick={handleSubmit}
              className="text-sm font-normal"
              disabled={!isDateCreatedValid || !isDateModifiedValid}
            >
              Add
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="text-sm font-normal"
            >
              Cancel
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}