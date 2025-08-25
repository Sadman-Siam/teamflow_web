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
import { useEffect, useState, useCallback } from "react";
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
  const [currentRole, setCurrentRole] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);

  // Move fetchTeamData outside useEffect so it can be reused
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

  const handleMemberSelect = (memberUserName, isChecked) => {
    if (isChecked) {
      setSelectedMembers((prev) => [...prev, memberUserName]);
    } else {
      setSelectedMembers((prev) =>
        prev.filter((name) => name !== memberUserName)
      );
    }
  };

  const handleAssignTask = async () => {
    try {
      if (!taskName || !description || !date || selectedMembers.length === 0) {
        alert("Please fill in all fields and select at least one team member");
        return;
      }

      // Convert selectedMembers array to the format expected by backend
      const assignedToArray = selectedMembers.map((memberUserName) => ({
        userName: memberUserName,
      }));

      await updateTeam(
        { name: teamName },
        {
          $push: {
            teamTasks: {
              taskName: taskName,
              description: description,
              assignedTo: assignedToArray,
              dueDate: date,
            },
          },
        }
      );

      // Clear form after successful assignment
      setTaskName("");
      setDescription("");
      setDate("");
      setSelectedMembers([]);
      fetchTeamData();
      alert(
        `Task "${taskName}" assigned to ${selectedMembers.length} member(s) successfully!`
      );
      // Optionally, you can refetch team data to reflect the new task
    } catch (error) {
      console.error("Error assigning task:", error);
      alert("Error assigning task. Please try again.");
    }
  };
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
    if (teamName && currentUser?.email) {
      fetchTeamData();
    }
  }, [teamName, teamID, currentUser?.email, fetchTeamData]);

  useEffect(() => {
    if (teamData?.members && currentUser?.email) {
      const currentMember = teamData.members.find(
        (member) => member.userEmail === currentUser.email
      );

      if (currentMember && currentMember.role === "admin") {
        setCurrentRole(true);
        console.log("User is an admin of the team");
      } else {
        setCurrentRole(false);
        console.log("User is not an admin of the team");
      }
    }
  }, [teamData, currentUser?.email]);

  return (
    <>
      <div className="flex flex-col items-center justify-center p-2 text-2xl">
        <h1>Welcome to Team: {teamData?.name}</h1>
        <p className="text-sm text-gray-500">Team Owner: {teamData?.owner}</p>
      </div>
      {currentRole ? (
        <div className=" p-4 flex flex-wrap">
          <div className="flex flex-col rounded-2xl border-2 w-1/2 p-2">
            <h1 className="text-lg p-2">Add Members</h1>
            <div className="w-1/3">
              <Label className="p-2">Search by User Name</Label>
              <Input
                id="userName"
                value={userName}
                type="text"
                onChange={(e) => setUserName(e.target.value)}
                requird
                className="p-2"
              ></Input>
            </div>
            <Button className="w-1/3 mt-2" onClick={handelSearch(userName)}>
              Search
            </Button>
          </div>
          {searchedUser !== null ? (
            <div className="flex w-1/2 ">
              <div className=" flex-col rounded-2xl border-2 p-2 w-full">
                <h2 className="text-lg p-2">User Found:</h2>
                <p className="px-2">Name: {searchedUser.username}</p>
                <p className="px-2">Email: {searchedUser.email}</p>
                <Button
                  className="m-2 w-1/3"
                  onClick={async () => {
                    try {
                      await updateUser(
                        { email: searchedUser.email },
                        {
                          $push: {
                            teamRequests: {
                              teamId: teamID,
                              teamName: teamName,
                            },
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
            </div>
          ) : (
            <></>
          )}
          <Card className="w-screen mt-2">
            <CardHeader>
              <CardTitle className="text-2xl">Create a task</CardTitle>
              <CardDescription>
                Enter your task details and assign it to a team member
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex">
                <div className="flex gap-6 w-1/2 p-2">
                  <div>
                    <div className="grid gap-2">
                      <Label className="text-lg">Task Name</Label>
                      <Input
                        id="taskName"
                        type="text"
                        placeholder="Enter task title"
                        value={taskName}
                        onChange={(e) => setTaskName(e.target.value)}
                        required
                        className="w-96"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label className="text-lg">Description</Label>
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
                        <Label className="text-lg">Task Submission Date</Label>
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
                </div>
                <div className="flex-col  w-1/2 p-2">
                  <h1 className="text-lg font-semibold">Assign To</h1>
                  {teamData?.members?.map((member) => (
                    <div key={member.userName} className="flex space-x-2 p-2">
                      <Input
                        type="checkbox"
                        id={`member-${member.userName}`}
                        checked={selectedMembers.includes(member.userName)}
                        onChange={(e) =>
                          handleMemberSelect(member.userName, e.target.checked)
                        }
                        className="w-4 h-4"
                      />
                      <Label
                        htmlFor={`member-${member.userName}`}
                        className="cursor-pointer"
                      >
                        {member.userName} ({member.role})
                      </Label>
                    </div>
                  ))}
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button
                type="button"
                className="w-full"
                onClick={handleAssignTask}
                disabled={
                  !taskName ||
                  !description ||
                  !date ||
                  selectedMembers.length === 0
                }
              >
                Create Task
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <></>
      )}
      <h1 className="text-2xl font-semibold p-2">Current ongoing tasks</h1>
      <div className="border-8 flex-wrap">
        {teamData?.teamTasks?.map((task, index) => (
          <>
            {task.status != "done" ? (
              <div className=" flex-col font-semibold text-lg text-wrap border p-2 m-2 rounded-2xl w-1/3">
                <h2 className="p-1">Task Name: {task.taskName}</h2>
                <p className="p-1">Task Description: {task.description}</p>
                <p className="p-1">Task Status: {task.status}</p>
                <p className="p-1">Due Date: {task.dueDate.slice(0, 10)}</p>
                <p className="p-1">Assigned To: {task.assignedTo.join(", ")}</p>
                <Button
                  className="m-1"
                  onClick={async () => {
                    await updateTeam(
                      { name: teamName, "teamTasks.taskName": task.taskName },
                      {
                        $set: {
                          "teamTasks.$.status": "in-progress",
                        },
                      }
                    );
                    fetchTeamData();
                  }}
                >
                  In-progress
                </Button>
                <Button
                  className=""
                  onClick={async () => {
                    await updateTeam(
                      { name: teamName, "teamTasks.taskName": task.taskName },
                      {
                        $set: {
                          "teamTasks.$.status": "done",
                        },
                      }
                    );
                    fetchTeamData();
                  }}
                >
                  Done
                </Button>
              </div>
            ) : (
              <></>
            )}
          </>
        ))}
      </div>
    </>
  );
}
