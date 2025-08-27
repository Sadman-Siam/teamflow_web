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
import {
  getDiscussions,
  createDiscussion,
  updateDiscussion,
  deleteDiscussion,
} from "@/services/discussionService";
import { useEffect, useState, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function TeamPage({ params }) {
  const { teamName, teamID } = params;
  const { currentUser, isLoggedIn, loading } = useAuth();
  const { userData, userLoading, refetchUserData } = useUserData();
  const [userName, setUserName] = useState("");
  const [searchedUser, setSearchedUser] = useState(null);
  const [teamData, setTeamData] = useState(null);
  const [searchOn, setSearchOn] = useState(false);
  const [addTask, setAddTask] = useState(false);
  const [chat, setChat] = useState(false);
  const [comment, setComment] = useState("");
  const [discussionData, setDiscussionData] = useState([]);
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

  const fetchDiscussionData = useCallback(async () => {
    try {
      const discussions = await getDiscussions();
      if (discussions) {
        console.log("Discussions fetched:", discussions);
        setDiscussionData(discussions);
      } else {
        console.error("No discussions found for the given team ID");
      }
    } catch (error) {
      console.error("Error fetching discussions:", error);
    }
  }, []);

  const handleChat = async () => {
    try {
      if (chat && comment != "") {
        const newChat = await createDiscussion({
          userName: userData.username,
          message: comment,
        });
        if (newChat) {
          console.log("Chat created:", newChat);
          fetchDiscussionData();
          setComment("");
        }
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

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
    <div className="">
      <div className="flex items-center justify-between px-4 py-2 text-2xl">
        <div>
          <h1>Welcome to Team: {teamData?.name}</h1>
          <p className="text-sm text-gray-500">Team Owner: {teamData?.owner}</p>
        </div>
        {currentRole ? (
          <div className="space-x-2">
            <Link className="pt-2 " href={`/admin/${teamName}/${teamID}`}>
              <Button className="bg-chart-1">Admin Panel</Button>
            </Link>
            <Button
              onClick={() => {
                searchOn ? setSearchOn(false) : setSearchOn(true);
              }}
            >
              Search
            </Button>
            <Button
              onClick={() => {
                addTask ? setAddTask(false) : setAddTask(true);
              }}
            >
              Add Task
            </Button>
            <Button
              onClick={() => {
                chat ? setChat(false) : setChat(true), fetchDiscussionData();
              }}
            >
              Chat
            </Button>
          </div>
        ) : (
          <div className="space-x-2">
            <Button
              onClick={() => {
                chat ? setChat(false) : setChat(true), fetchDiscussionData();
              }}
            >
              Chat
            </Button>
          </div>
        )}
      </div>
      {chat ? (
        <div className="border rounded-2xl m-2">
          <h1 className="text-2xl font-semibold px-4 py-2">
            Chat With Other Team Members
          </h1>
          <div className="px-4 py-2 overflow-auto max-h-48">
            {discussionData?.map((discuss, index) => (
              <div
                key={index}
                className=" flex border-b p-2 justify-between items-center"
              >
                <div className="flex space-x-2">
                  <p className="font-semibold text-chart-1 ">
                    {discuss.userName}
                  </p>
                  <p className=" ">{discuss.message}</p>
                </div>
                <p className="text-sm text-gray-500">{discuss.createdAt}</p>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 ">
            <div className="flex justify-between items-center rounded-2xl border-2 p-2">
              <Label className="">Comment</Label>
              <Input
                id="comment"
                value={comment}
                type="text"
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-5/6"
              ></Input>
              <Button className="" type="submit" onClick={handleChat}>
                Chat
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      {searchOn ? (
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
        </div>
      ) : (
        <></>
      )}
      {addTask ? (
        <div className="p-4 ">
          <Card className="max-w mt-2">
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
      <div>
        <div className="flex">
          <div className=" w-10/12">
            <h1 className="text-2xl font-semibold px-4 py-2">
              Current ongoing tasks
            </h1>
            <div className="px-4 py-2">
              <div className="flex flex-wrap">
                {teamData?.teamTasks
                  .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                  .map((task, index) => (
                    <>
                      {task.status != "done" ? (
                        <div className=" flex-col font-semibold text-wrap border p-4 m-1 rounded-2xl min-w-96">
                          <h2 className="">Task Name: {task.taskName}</h2>
                          <p className="">
                            Task Description: {task.description}
                          </p>
                          <p className="">Task Status: {task.status}</p>
                          <p className="">
                            Due Date: {task.dueDate.slice(0, 10)}
                          </p>
                          <div className="flex space-x-2">
                            Assigned To:&nbsp;
                            {task.assignedTo?.map((user, index) => (
                              <div className="flex space-x-2" key={index}>
                                <p className=" flex space-x-2">
                                  {" " + user.userName},
                                </p>
                              </div>
                            ))}
                          </div>
                          <Button
                            className="mr-2"
                            onClick={async () => {
                              await updateTeam(
                                {
                                  name: teamName,
                                  "teamTasks.taskName": task.taskName,
                                },
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
                            className="bg-chart-1"
                            onClick={async () => {
                              await updateTeam(
                                {
                                  name: teamName,
                                  "teamTasks.taskName": task.taskName,
                                },
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
            </div>
          </div>
          <div>
            <p className="text-lg font-semibold text-chart-1">
              Upcomming Due Date
            </p>
            {teamData?.teamTasks
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((task, index) => (
                <>
                  {task.status != "done" ? (
                    <div
                      key={index}
                      className="border-b-2 border-l-2 mb-2 p-2 rounded-2xl border-chart-1"
                    >
                      <p>Task Name: {task.taskName}</p>
                      <p>
                        Remain Time:{" "}
                        {Math.max(
                          0,
                          Math.floor(
                            (new Date(task.dueDate) - new Date()) /
                              (1000 * 60 * 60 * 24)
                          )
                        )}{" "}
                        days
                      </p>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              ))}
          </div>
        </div>
        <div className="px-4 py-2 flex-col">
          <h1 className="text-2xl font-semibold py-2">Completed Tasks</h1>
          <div className="flex flex-wrap">
            {teamData?.teamTasks
              .filter((task) => task.status === "done")
              .map((task, index) => (
                <div
                  key={index}
                  className=" flex font-semibold text-wrap border p-4 m-1 rounded-2xl w-1/4"
                >
                  <h2 className="">Task Name: {task.taskName}</h2>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
