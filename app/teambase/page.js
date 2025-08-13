"use client";

import { getUser } from "@/services/userService";
import { getTeam, updateTeam, deleteTeam } from "@/services/teamService";
import { useAuth } from "@/app/context/authcontext";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserData } from "@/app/context";

export default function TeamBasePage() {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading } = useUserData();
  const [teamData, setTeamData] = useState(null);
  const [teamLoading, setTeamLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const teamID = searchParams.get("teamID");
  useEffect(() => {
    const fetchTeamData = async () => {
      const teamID = searchParams.get("teamID");
      if (!teamID) {
        console.log(teamID);
        setError("No team ID provided");
        setTeamLoading(false);
        return;
      }

      try {
        setTeamLoading(true);
        console.log("Fetching team data for ID:", teamID);
        const data = await getTeam({ _id: teamID });
        console.log("Team data received:", data);
        setTeamData(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching team data:", err);
        setError("Failed to load team data");
      } finally {
        setTeamLoading(false);
      }
    };

    fetchTeamData();
  }, [teamID, searchParams]);

  if (loading || teamLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading team data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>No team data found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="flex justify-center text-2xl border-4 p-4 rounded-lg border-chart-1 bg-gray-50">
        Welcome to Team: {teamData?.name || "Unknown"}
      </h1>

      <div className="mt-6 space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Team Information</h2>
          <p>
            <strong>Team ID:</strong> {teamID}
          </p>
          <p>
            <strong>Team Name:</strong> {teamData?.name}
          </p>
          <p>
            <strong>Owner:</strong> {teamData?.owner}
          </p>
          <p>
            <strong>Owner Email:</strong> {teamData?.ownerEmail}
          </p>
          <p>
            <strong>Created:</strong>{" "}
            {teamData?.createdAt
              ? new Date(teamData.createdAt).toLocaleDateString()
              : "Unknown"}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Team Members</h2>
          {teamData?.members && teamData.members.length > 0 ? (
            <ul className="list-disc list-inside">
              {teamData.members.map((member, index) => (
                <li key={index}>{member.name || member.email || member}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No members yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
