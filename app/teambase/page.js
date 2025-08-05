"use client";

import { getUser } from "@/services/userService";
import { getTeam } from "@/services/teamService";
import { useAuth } from "@/app/context/authcontext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TeamBasePage() {
  const { currentUser, isLoggedIn, loading } = useAuth();
  return (
    <div>
      <h1 className="flex justify-center text-lg border-4 p-2 ">TEAM BASE</h1>
    </div>
  );
}
