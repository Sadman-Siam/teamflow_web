"use client";
import { useAuth } from "@/app/context/authcontext";
import { useUserData } from "@/app/context";
import { getTeam, updateTeam, deleteTeam } from "@/services/teamService";
import { getUser, updateUser } from "@/services/userService";
import { useEffect, useState, useCallback, use } from "react";
import { Button } from "@/components/ui/button";
export default function AdminPage({ params }) {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading, refetchUserData } = useUserData();
  const { teamName, teamID } = params;
  const [teamData, setTeamData] = useState(null);

  const fetchTeamData = useCallback(async () => {
    try {
      const teamData = await getTeam({ name: teamName });
      if (teamData) {
        console.log("Team data fetched:", teamData);
        setTeamData(teamData);
      } else {
        console.error("No team data found for the given name or ID");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
    }
  }, [teamName]);

  useEffect(() => {
    if (teamName && currentUser?.email) {
      fetchTeamData();
    }
  }, [teamName, teamID, currentUser?.email, fetchTeamData]);

  return (
    <div>
      <h1 className="text-2xl p-2">Admin Panel for Team: {teamName}</h1>
      {teamData?.members?.map((member, index) => (
        <div
          key={index}
          className="flex justify-between items-center p-2 border-2 rounded-2xl m-2"
        >
          <div className="flex gap-4 font-semibold text-lg">
            <p>Name: {member.userName}</p>
            <p>Email: {member.userEmail}</p>
            <p>Current Role: {member.role}</p>
          </div>
          <div className="flex gap-2">
            <Button
              className="hover:bg-chart-1"
              onClick={async () => {
                await updateTeam(
                  {
                    name: teamName,
                    "members.userName": member.userName,
                  },
                  {
                    $set: {
                      "members.$.role": "admin",
                    },
                  }
                );
                fetchTeamData();
              }}
            >
              Make Admin
            </Button>
            <Button
              className="hover:bg-chart-1"
              onClick={async () => {
                try {
                  await updateTeam(
                    { name: teamName },
                    {
                      $pull: {
                        members: {
                          userName: member.userName,
                        },
                      },
                    }
                  );

                  await updateUser(
                    { username: member.userName },
                    {
                      $pull: {
                        team: {
                          teamName: teamName,
                        },
                      },
                    }
                  );

                  fetchTeamData();
                  alert(`${member.userName} has been removed from the team`);
                } catch (error) {
                  console.error("Error removing user:", error);
                  alert("Error removing user. Please try again.");
                }
              }}
            >
              Remove User
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
