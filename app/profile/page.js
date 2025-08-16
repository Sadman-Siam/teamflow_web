"use client";

import { useUserData } from "@/app/context";
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading } = useUserData();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex-col py-4">
      <Card className="w-screen">
        <CardHeader>
          <CardTitle className="text-2xl">Profile Details</CardTitle>
        </CardHeader>
        <CardContent>
          {userLoading ? (
            <p>Loading user data...</p>
          ) : userData ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User Name
                </p>
                <p className="text-lg">
                  {userData?.data?.username ||
                    userData?.username ||
                    "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Email Address
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData?.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Account Created
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.metadata?.creationTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Your Teams
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData?.teams?.length || 0} teams
                </p>
              </div>
            </div>
          ) : (
            <p>No user data found</p>
          )}
        </CardContent>
      </Card>
      <div className="mt-4">
        <h1 className="text-2xl font-bold mb-4">Team Requests</h1>
        {userData?.teamRequests && userData.teamRequests.length > 0 ? (
          <div className="space-y-2">
            {userData.teamRequests.map((request, index) => (
              <div
                key={request.teamId || request.teamName || index}
                className="p-4 border rounded-lg bg-gray-50"
              >
                <p>
                  <strong>Team Name:</strong> {request.teamName}
                </p>
                <p>
                  <strong>Team ID:</strong> {request.teamId}
                </p>
                <div className="mt-2 space-x-2">
                  <Button>Accept</Button>
                  <Button>Decline</Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No team requests at the moment</p>
        )}
      </div>
    </div>
  );
}
