"use client";

import { useState, useEffect } from "react";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar"; // Use Shadcn/UI Avatar
import { Separator } from "@/components/ui/separator"; // Use Shadcn/UI Separator
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs"; // Use Shadcn/UI Tabs
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // Use Shadcn/UI Select
import { toast, Toaster } from "sonner";
import React from "react";

export default function ProfileClient() {
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [user, setUser] = useState({
    firstName: "Alex",
    lastName: "Quinn",
    username: "alexq",
    email: "alex.quinn@example.com",
    employeeNumber: "EMP-67890",
    authorization: ["Trader"],
    avatar: "https://github.com/shadcn.png",
  });
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [preferredDashboard, setPreferredDashboard] = useState("default");

  const allRoles = ["Admin", "Analyst", "Risk Admin", "Trader"];

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const savedDashboard = localStorage.getItem("preferredDashboard") || "default";
      setPreferredDashboard(savedDashboard);
    }
  }, []);

  const handleSave = () => {
    if (password && password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setSaving(true);
    setTimeout(() => {
      setUser((prev) => ({ ...prev, username: user.username }));
      if (password) {
        console.log("Password updated to:", password);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("preferredDashboard", preferredDashboard);
      }
      toast.success("Changes saved successfully!");
      setSaving(false);
      setPassword("");
      setConfirmPassword("");
    }, 1000);
  };

  if (!mounted) return null;

  return (
    <div className="flex justify-center min-h-screen px-4 sm:px-6 lg:px-8 py-4 space-y-4 no-scrollbar">
      <Toaster richColors position="top-center" />
      <div className="w-full max-w-2xl">
        <div className="grid grid-rows-2 gap-0">
          <div className="flex justify-center mb-1">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-gray-300 text-black text-sm">
                {user.firstName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <div className="space-y-0.5">
              <h4 className="text-lg font-medium leading-none">{user.firstName} {user.lastName}</h4>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Separator className="my-3" />
            <div className="flex h-5 items-center text-sm space-x-3 justify-center">
              {allRoles.map((role, index) => (
                <React.Fragment key={role}>
                  <span
                    className={`truncate ${user.authorization.includes(role) ? "text-green-500 font-bold" : "text-gray-600"}`}
                  >
                    {role}
                  </span>
                  {index < allRoles.length - 1 && <Separator orientation="vertical" className="h-4" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="mt-6 w-full isolate">
          <TabsList className="grid w-full sm:w-[512px] grid-cols-3 mx-auto">
            <TabsTrigger value="profile" className="w-full">Profile</TabsTrigger>
            <TabsTrigger value="display" className="w-full">Display</TabsTrigger>
            <TabsTrigger value="activity" className="w-full">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
          <Card className="w-full sm:w-[512px] mx-auto">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your profile information here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>First Name</Label>
                  <Input defaultValue={user.firstName} readOnly className="bg-gray-100 text-gray-500 border-none cursor-default truncate" />
                </div>
                <div className="space-y-1">
                  <Label>Last Name</Label>
                  <Input defaultValue={user.lastName} readOnly className="bg-gray-100 text-gray-500 border-none cursor-default truncate" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label>Email</Label>
                  <Input defaultValue={user.email} readOnly className="bg-gray-100 text-gray-500 border-none cursor-default truncate" />
                </div>
                <div className="col-span-1 space-y-1">
                  <Label>Employee No.</Label>
                  <Input defaultValue={user.employeeNumber} readOnly className="bg-gray-100 text-gray-500 border-none cursor-default truncate" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Username</Label>
                <Input
                  value={user.username}
                  onChange={(e) => setUser((prev) => ({ ...prev, username: e.target.value }))}
                  className="truncate"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="truncate"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Confirm Password</Label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="truncate"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
          </TabsContent>

          <TabsContent value="display">
            <Card className="w-full sm:w-[512px] mx-auto">
              <CardHeader>
                <CardTitle>Display</CardTitle>
                <CardDescription>Adjust your display settings here.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Preferred Dashboard</Label>
                  <Select value={preferredDashboard} onValueChange={setPreferredDashboard}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a dashboard" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default Dashboard</SelectItem>
                      <SelectItem value="trading">Trading Dashboard</SelectItem>
                      <SelectItem value="analytics">Analytics Dashboard</SelectItem>
                      <SelectItem value="risk">Risk Management Dashboard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card className="w-full sm:w-[512px] mx-auto">
              <CardHeader>
                <CardTitle>Activity</CardTitle>
                <CardDescription>View your recent login activity.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label>Last Logged In</Label>
                  <Input
                    defaultValue="March 10, 2025, 3:45 PM"
                    readOnly
                    className="bg-gray-100 text-gray-500 border-none cursor-default truncate"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Last Logged In Device</Label>
                  <Input
                    defaultValue="MacBook Pro - Safari"
                    readOnly
                    className="bg-gray-100 text-gray-500 border-none cursor-default truncate"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}