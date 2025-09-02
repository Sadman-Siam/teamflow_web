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
import { uploadFile, getFile, deleteFile } from "@/services/fileService";
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
  const [upload, setUpload] = useState(false);
  const [activityLog, setActivityLog] = useState(false);
  const [comment, setComment] = useState("");
  const [discussionData, setDiscussionData] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [teamFiles, setTeamFiles] = useState([]);
  //
  const [fileName, setFileName] = useState("");
  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [currentRole, setCurrentRole] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [reportLoading, setReportLoading] = useState(false);

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

  const fetchTeamFiles = useCallback(async () => {
    try {
      const files = await getFile({ teamId: teamID });
      if (files) {
        console.log("Files fetched:", files);
        setTeamFiles(files);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  }, [teamID]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file to upload");
      return;
    }

    setUploadLoading(true);

    try {
      const uploadedFile = await uploadFile({
        file: selectedFile,
        userName: userData?.username,
        teamName: teamName,
      });

      console.log("File uploaded successfully:", uploadedFile);
      alert("File uploaded successfully!");

      // Reset form
      setSelectedFile(null);
      setFileName("");

      // Refresh files list
      fetchTeamFiles();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };
  const handleReportGeneration = async () => {
    try {
      if (!teamData) {
        alert("No team data available to generate report");
        return;
      }

      setReportLoading(true);

      // Simple data preparation
      const tasks = teamData.teamTasks || [];
      const members = teamData.members || [];
      const completedTasks = tasks.filter(
        (task) => task.status === "done"
      ).length;
      const pendingTasks = tasks.filter(
        (task) => !task.status || task.status === "pending"
      ).length;
      const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
      ).length;

      // Create prompt for Gemini
      const prompt = `Generate a team performance report for:

Team: ${teamData.name}
Owner: ${teamData.owner}
Members: ${members.length}

Tasks Overview:
- Total: ${tasks.length}
- Completed: ${completedTasks}
- In Progress: ${inProgressTasks}
- Pending: ${pendingTasks}

Team Members:
${members.map((member) => `${member.userName} (${member.role})`).join("\n")}

Recent Tasks:
${tasks
  .slice(0, 10)
  .map(
    (task) =>
      `${task.taskName} - ${task.status || "pending"} - Due: ${task.dueDate}`
  )
  .join("\n")}

Please provide a professional report with analysis.`;

      // Call Gemini API
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.NEXT_PUBLIC_GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { maxOutputTokens: 2048 },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const report = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!report) {
        throw new Error("No report generated");
      }

      // Open report in new window
      const reportWindow = window.open("", "_blank");
      reportWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Team Report - ${teamData.name}</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { border-bottom: 2px solid #007bff; padding-bottom: 10px; margin-bottom: 20px; }
            .report-content { white-space: pre-wrap; }
            .print-btn { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Team Performance Report</h1>
            <p><strong>Team:</strong> ${teamData.name}</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <button class="print-btn" onclick="window.print()">Print Report</button>
          <div class="report-content">${report}</div>
        </body>
        </html>
      `);
      reportWindow.document.close();

      alert("Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setReportLoading(false);
    }
  };
  const handleFileDelete = async (fileId, fileName) => {
    if (window.confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        await deleteFile(fileId);
        alert("File deleted successfully!");
        fetchTeamFiles();
      } catch (error) {
        console.error("Error deleting file:", error);
        alert("Error deleting file. Please try again.");
      }
    }
  };

  const handleChat = async () => {
    try {
      if (chat && comment != "") {
        const newChat = await createDiscussion({
          teamName: teamName,
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
            teamLog: {
              userName: userData.username,
              action: "assigned task",
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
            <Button onClick={handleReportGeneration} disabled={reportLoading}>
              {reportLoading ? "Generating..." : "Generate Report"}
            </Button>
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
            <Button
              onClick={() => {
                upload ? setUpload(false) : setUpload(true);
                if (!upload) fetchTeamFiles();
              }}
            >
              Upload
            </Button>
            <Button
              onClick={() => {
                activityLog ? setActivityLog(false) : setActivityLog(true),
                  fetchTeamData();
              }}
            >
              Activity Log
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
            <Button
              onClick={() => {
                upload ? setUpload(false) : setUpload(true);
                if (!upload) fetchTeamFiles();
              }}
            >
              Upload
            </Button>
            <Button
              onClick={() => {
                activityLog ? setActivityLog(false) : setActivityLog(true),
                  fetchTeamData();
              }}
            >
              Activity Log
            </Button>
          </div>
        )}
      </div>
      {upload ? (
        <div className="border rounded-2xl m-2 p-4">
          <h1 className="text-2xl font-semibold mb-4">Upload File</h1>
          <form onSubmit={handleFileUpload} className="space-y-4">
            <div>
              <Label htmlFor="fileInput">Select File</Label>
              <Input
                id="fileInput"
                type="file"
                onChange={handleFileSelect}
                className="mt-2"
                accept=".txt,.doc,.docx,.pdf,.jpg,.jpeg,.png,.gif,.webp"
                required
              />
            </div>

            <div>
              <Label htmlFor="fileName">
                File Name (Must have a file Name)
              </Label>
              <Input
                id="fileName"
                value={fileName}
                type="text"
                onChange={(e) => setFileName(e.target.value)}
                placeholder="Enter custom file name or keep original"
                className="mt-2"
              />
            </div>

            {selectedFile && (
              <div className="p-3 bg-gray-50 rounded border">
                <p className="text-sm font-medium">Selected File:</p>
                <p className="text-sm text-gray-600">{selectedFile.name}</p>
                <p className="text-sm text-gray-600">
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={!selectedFile || uploadLoading}
              className="w-full"
            >
              {uploadLoading ? "Uploading..." : "Upload File"}
            </Button>
          </form>
        </div>
      ) : (
        <></>
      )}
      {chat ? (
        <div className="border rounded-2xl m-2">
          <h1 className="text-2xl font-semibold px-4 py-2">
            Chat With Other Team Members
          </h1>
          <div className="px-4 py-2 overflow-auto max-h-48">
            {discussionData
              ?.filter((discuss) => discuss.teamName == teamName)
              .map((discuss, index) => (
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
      {activityLog ? (
        <div className="border rounded-2xl m-2">
          <h1 className="text-2xl font-semibold px-4 py-2">Activity Log</h1>
          <div className="px-4 py-2 overflow-auto max-h-48">
            {teamData.teamLog?.map((log, index) => (
              <div
                key={index}
                className=" flex border-b p-2 justify-between items-center"
              >
                <div className="flex space-x-2">
                  <p className="font-semibold text-chart-1 ">{log.userName}</p>
                  <p className=" ">{log.action}</p>
                </div>
                <p className="text-sm text-gray-500">{log.timestamp}</p>
              </div>
            ))}
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
                      await updateTeam(
                        { name: teamName },
                        {
                          $push: {
                            teamLog: {
                              userName: userData.username,
                              action: "Sent team Request",
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
                              await updateTeam(
                                { name: teamName },
                                {
                                  $push: {
                                    teamLog: {
                                      userName: userData.username,
                                      action: "Task Progress Updated",
                                    },
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
                              await updateTeam(
                                { name: teamName },
                                {
                                  $push: {
                                    teamLog: {
                                      userName: userData.username,
                                      action: "Task Completed",
                                    },
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
