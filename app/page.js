"use client";

import { useAuth } from "@/app/context/authcontext";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { currentUser, isLoggedIn, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-chart-1">Welcome to TeamFlow</h1>

        {isLoggedIn ? (
          <div className="space-y-4">
            <p className="text-xl">Hello, {currentUser?.email}!</p>
            <p className="text-muted-foreground">
              You&apos;re successfully logged in to TeamFlow.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/profile">
                <Button className="bg-chart-1">View Profile</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xl text-muted-foreground">
              A powerful team collaboration platform
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/signup">
                <Button className="bg-chart-1">Get Started</Button>
              </Link>
              <Link href="/login">
                <Button variant="outline">Login</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
