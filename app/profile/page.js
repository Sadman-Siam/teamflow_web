"use client";

import { useAuth } from "@/app/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { currentUser, isLoggedIn, loading } = useAuth();
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg">{currentUser?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                User ID
              </p>
              <p className="text-sm text-muted-foreground">
                {currentUser?.uid}
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
