"use client";

import { useEffect, useContext, useState, createContext } from "react";
import { useAuth } from "@/app/context/authcontext";
import { getUser } from "@/services/userService";

const UserContext = createContext();

// Custom hook to use the UserContext
export function useUserData() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserData must be used within a UserContextProvider");
  }
  return context;
}

export function UserContextProvider({ children }) {
  const { currentUser, isLoggedIn, loading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
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
    };

    if (!loading) {
      fetchUserData();
    }
  }, [currentUser?.email, isLoggedIn, loading]);

  const value = {
    userData,
    userLoading,
    refetchUserData: () => {
      if (isLoggedIn && currentUser?.email) {
        const fetchData = async () => {
          setUserLoading(true);
          try {
            const result = await getUser({ email: currentUser.email });
            setUserData(result);
          } catch (error) {
            console.error("Error refetching user data:", error);
          } finally {
            setUserLoading(false);
          }
        };
        fetchData();
      }
    },
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
