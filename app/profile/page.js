"use client";

import { useUserData } from "@/app/context";
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="flex p-4">
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
                  {currentUser?.email}
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
    </div>
  );
}
