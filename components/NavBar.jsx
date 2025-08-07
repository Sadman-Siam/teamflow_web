"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/app/context/authcontext";
import { doSignOut } from "@/app/firebase/auth";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

export default function NavBar() {
  const { currentUser, isLoggedIn } = useAuth();
  const router = useRouter();
  const navbarTitleRef = useRef(null);
  const navbarRef = useRef(null);

  useEffect(() => {
    // Ensure the element is mounted before animating

    if (navbarRef.current) {
      gsap.fromTo(
        navbarRef.current,
        {
          y: -100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power2.out",
        }
      );
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleSignOut = async () => {
    try {
      await doSignOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div
      ref={navbarRef}
      className="flex items-center justify-between p-4 text-white border-b-4 border-chart-1 rounded-2xl"
    >
      <Link href="/">
        <h1 ref={navbarTitleRef} className="text-chart-1 font-bold text-xl">
          Team Flow
        </h1>
      </Link>
      <div className="flex space-x-2">
        {isLoggedIn ? (
          // Show when user is logged in
          <>
            <Link href="/profile">
              <Button className="">Profile</Button>
            </Link>
            <Button onClick={handleSignOut}>Sign Out</Button>
          </>
        ) : (
          // Show when user is not logged in
          <>
            <Link href="/login">
              <Button>Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
