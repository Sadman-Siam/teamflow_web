"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";
import { useUserData } from "@/app/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/services/userService";
import { createTeam } from "@/services/teamService";
import { useEffect, useState, useRef } from "react";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { gsap } from "gsap";

export default function Home() {
  const router = useRouter();
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading, refetchUserData } = useUserData();
  const [teamName, setTeamName] = useState("");
  const landingRef = useRef(null);

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    // Check if userData is loaded before proceeding
    if (!userData) {
      console.error("User data not loaded yet");
      return;
    }

    const newTeamData = {
      name: teamName,
      owner: userData?.data?.username || userData?.username || "Unknown",
      ownerEmail: currentUser.email,
    };

    try {
      const createdTeam = await createTeam(newTeamData);
      console.log("Created team:", createdTeam);
      // Update user data to include the new team
      const teamID = createdTeam._id;
      await updateUser(
        { email: currentUser.email },
        { $push: { team: { teamID: createdTeam._id, teamName: teamName } } }
      );

      // Refetch user data to get updated teams
      refetchUserData();

      setTeamName("");
      router.push(`/teambase?teamID=${teamID}`);
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };
  useEffect(() => {
    if (landingRef.current && !isLoggedIn) {
      gsap.fromTo(
        landingRef.current,
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1, delay: 0.5, ease: "power2.out" }
      );
    }
  }, [isLoggedIn]);
  return (
    <>
      {isLoggedIn ? (
        <div className="mt-6 p-2 ">
          <h1 className="flex justify-center text-2xl">
            Welcome back,
            <p className="text-chart-1 font-bold">
              {userData?.data?.username || userData?.username || "User"}
            </p>
          </h1>
          <p className="flex justify-center text-gray-600 text-xl">
            You&#39;re logged in with email {currentUser?.email}
          </p>

          {userData && !userLoading ? (
            <div className="flex flex-col border-4 rounded-2xl mt-6 border-chart-1">
              <h1 className="text-xl p-4">
                Create a team and start collaborating with your team members
              </h1>
              <div>
                <Label className="text-lg mx-4" htmlFor="teamName">
                  Team Name
                </Label>
                <Input
                  className="w-1/5 mx-4"
                  id="teamName"
                  type="text"
                  placeholder="Enter your team name"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  required
                />
              </div>
              <Button
                className="w-1/5 m-4"
                onClick={handleCreateTeam}
                disabled={!teamName.trim()}
              >
                Create Team
              </Button>
            </div>
          ) : (
            <div className="flex justify-center mt-6">
              <p>Loading user data...</p>
            </div>
          )}
        </div>
      ) : (
        <div ref={landingRef} className="flex flex-col items-center p-4 mt-20">
          <h1 className="text-6xl text-chart-1">Welcome to TeamFlow</h1>
          <p className="text-gray-600">
            Its a all in one team collaboration tool
          </p>
          <p className="text-gray-600">Let&#39;s get started</p>
          <div className="flex justify-center">
            <Link href="/login">
              <Button
                className="mt-4 hover:underline text-chart-1"
                variant="link"
              >
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="mt-4 text-chart-1" variant="link">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
