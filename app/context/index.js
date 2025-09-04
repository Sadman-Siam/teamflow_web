"use client";

import {
  useEffect,
  useContext,
  useState,
  createContext,
  useCallback,
} from "react";
import { useAuth } from "@/app/context/authcontext";
import { getUser } from "@/services/userService";

// Create a single Context (singleton)
const UserContext = createContext(null);

// Hook for context
export function useUserData() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserContextProvider");
  }
  return context;
}

// Provider (singleton source of truth)
export function UserContextProvider({ children }) {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  const fetchUserData = useCallback(async () => {
    if (isLoggedIn && currentUser?.email) {
      setUserLoading(true);
      try {
        const result = await getUser({ email: currentUser.email });
        setUserData(result);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setUserLoading(false);
      }
    } else {
      setUserData(null);
    }
  }, [isLoggedIn, currentUser?.email]);

  useEffect(() => {
    if (!loading) {
      fetchUserData();
    }
  }, [loading, fetchUserData]);

  const value = {
    userData,
    userLoading,
    refetchUserData: fetchUserData,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
