"use client";

import { getUser } from "@/services/userService";
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.email) {
        setUserLoading(true);
        setUserError(null);
        try {
          const response = await getUser({ email: currentUser.email });
          console.log("User data fetched:", response);
          setUserData(response);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserError(error.message);
        } finally {
          setUserLoading(false);
        }
      }
    };

    if (isLoggedIn && currentUser?.email) {
      fetchUserData();
    }
  }, [currentUser?.email, isLoggedIn]);

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
          ) : userError ? (
            <div className="text-red-500">
              <p>Error loading user data: {userError}</p>
            </div>
          ) : userData ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  User Name
                </p>
                <p className="text-lg">
                  {userData.data.username || "Not provided"}
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
                  {userData.data.teams?.length || 0} teams
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
