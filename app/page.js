"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";
import { useUserData } from "@/app/context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUser } from "@/services/userService";
import { createTeam, updateTeam } from "@/services/teamService";
import { useEffect, useState, useRef } from "react";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import { gsap } from "gsap";

export default function Home() {
  const router = useRouter();
  const [userLoaded, setUserLoaded] = useState(false);
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading, refetchUserData } = useUserData();
  const [teamName, setTeamName] = useState("");
  const landingRef = useRef(null);

  useEffect(() => {
    try {
      if (!userLoaded) {
        refetchUserData();
        setUserLoaded(true);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserLoaded(false);
    }
  }, [userLoaded, refetchUserData]);

  const handleCreateTeam = async (event) => {
    event.preventDefault();

    if (!userData) {
      console.error("User data not loaded yet");
      return;
    }

    const newTeamData = {
      name: teamName,
      owner: userData.username,
      ownerEmail: currentUser.email,
    };

    try {
      const createdTeam = await createTeam(newTeamData);
      console.log("Created team:", createdTeam);

      await updateUser(
        { email: currentUser.email },
        {
          $push: {
            team: {
              teamID: createdTeam._id,
              teamName: teamName,
            },
          },
        }
      );
      await updateTeam(
        { name: teamName },
        {
          $push: {
            members: {
              userName: userData.username,
              userEmail: currentUser.email,
              role: "admin",
            },
          },
        }
      );

      setTeamName("");
      refetchUserData();
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
            <div>
              <div className="flex flex-col border-2 rounded-2xl mt-6 border-chart-1">
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
              <h1 className="p-2 text-2xl">All your active teams</h1>
              <div className="flex flex-wrap">
                {userData?.team?.map(
                  (team) => (
                    console.log("Rendering team:", team),
                    (
                      <div
                        key={team.teamName}
                        className="mx-1 p-2 flex flex-col border-2 rounded-2xl mt-3 border-chart-1 w-1/5 h-30"
                      >
                        <h2 className="font-semibold  ">
                          Name :{team.teamName}
                        </h2>
                        <Link
                          className="pt-6"
                          href={`/teams/${team.teamName}/${team._id}`}
                        >
                          <Button>View Team</Button>
                        </Link>
                      </div>
                    )
                  )
                )}
              </div>
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
