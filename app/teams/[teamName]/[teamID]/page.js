"use client";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/app/context/authcontext";
import { useUserData } from "@/app/context";
import { getTeam, updateTeam, deleteTeam } from "@/services/teamService";
import { getUser, updateUser } from "@/services/userService";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function TeamPage({ params }) {
  const { teamName, teamID } = params;
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading, refetchUserData } = useUserData();
  const [userName, setUserName] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [teamData, setTeamData] = useState(null);
  //
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const handelSearch = function async(userName) {
    return async () => {
      try {
        const user = await getUser({ username: userName });
        if (user) {
          console.log("User found:", user);
          setSearchedUser(user);
        }
      } catch (error) {
        console.error("Error searching for user:", error);
        setSearchedUser(null);
      }
    };
  };
  useEffect(() => {
    const fetchTeamData = async () => {
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
    };

    fetchTeamData();
  }, [teamName, teamID]);

  return (
    <>
      <div>
        <h1>Welcome to Team: {teamData?.name}</h1>
        <p>Team Owner: {teamData?.owner}</p>
      </div>
      <div>
        <h1>Add Members</h1>
        <Label>Search by User Name</Label>
        <Input
          id="userName"
          value={userName}
          type="text"
          onChange={(e) => setUserName(e.target.value)}
          requird
        ></Input>
        <Button onClick={handelSearch(userName)}>Search</Button>
      </div>
      {searchedUser !== null ? (
        <div>
          <h2>User Found:</h2>
          <p>Name: {searchedUser.username}</p>
          <p>Email: {searchedUser.email}</p>
          <Button
            onClick={async () => {
              try {
                await updateUser(
                  { email: searchedUser.email },
                  {
                    $push: {
                      teamRequests: { teamId: teamID, teamName: teamName },
                    },
                  }
                );
                window.alert("Team Request sent to User successfully!");
                setSearchedUser(null);
                fetchTeamData();
                refetchUserData();
              } catch (error) {
                console.error("Error updating team:", error);
              }
            }}
          >
            Add to Team
          </Button>
        </div>
      ) : (
        <></>
      )}
      <Card className="w-screen ">
        <CardHeader>
          <CardTitle>Create a task</CardTitle>
          <CardDescription>
            Enter your task details and assign it to a team member
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6 w-1/3">
              <div className="grid gap-2">
                <Label>Task Name</Label>
                <Input
                  id="taskName"
                  type="text"
                  placeholder="Enter task title"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label>Description</Label>
                </div>
                <Input
                  id="description"
                  type="text"
                  placeholder="Enter task description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="h-20"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label>Task Submission Date</Label>
                </div>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <h1>Assign To</h1>
              {teamData?.members?.map((member) => (
                <div key={member.userName}>
                  <h1>{member.userName}</h1>
                  <h1>{member.userId}</h1>
                  <h1>{member.role}</h1>
                  <Label>{member.userName}</Label>
                  {/* <Input
                    type="checkbox"
                    checked={member.assigned}
                    //={() => handleAssignTask(member.userName)}
                  /> */}
                </div>
              ))}
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}
