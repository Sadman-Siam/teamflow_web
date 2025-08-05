"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/authcontext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUser, updateUser } from "@/services/userService";
import { createTeam } from "@/services/teamService";
import { useEffect, useState } from "react";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const { currentUser, isLoggedIn, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [teamData, setTeamData] = useState(null);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser?.email) {
        try {
          const response = await getUser({ email: currentUser.email });
          setUserData(response);
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUserError(error.message);
        }
      }
    };
    if (isLoggedIn && currentUser?.email) {
      fetchUserData();
    }
  }, [currentUser?.email, isLoggedIn]);

  const handleCreateTeam = async (event) => {
    event.preventDefault();
    setTeamData({
      name: teamName,
      owner: userData.data.username,
      ownerEmail: currentUser.email,
    });
    try {
      const tempData = await createTeam(teamData);
      setTeamData(tempData);
      await updateUser(
        { email: currentUser.email },
        {
          team: {
            $push: { teamID: teamData._id },
            $push: { teamName: teamName },
          },
        }
      );
      setTeamName("");
      router.push("/teambase");
    } catch (error) {
      console.error("Error creating team:", error);
    }
  };

  return (
    <div className="mt-6 p-2 ">
      <h1 className="flex justify-center text-2xl">
        Welcome back,
        <p className="text-chart-1 font-bold"> {userData?.data.username}</p>
      </h1>
      <p className="flex justify-center text-gray-600 text-xl">
        You&#39;re logged in with email {currentUser.email}
      </p>
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
          ></Input>
        </div>
        <Button className="w-1/5 m-4" onClick={handleCreateTeam}>
          Create Team
        </Button>
      </div>
    </div>
  );
}
