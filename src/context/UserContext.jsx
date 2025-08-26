import React, { createContext, useContext, useState, useEffect } from "react";
import { API_BASE_URL } from "../config";

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading

  useEffect(() => { 
    async function fetchUser() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          credentials: "include" // Important for cookies!
        });
        const data = await res.json();
        if (data.success && data.user) {
          console.log("Response from /me:", data.user);
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        setUser(null);
        console.error("Error fetching user:", error);
        console.error("Error fetching user:", error.message);
        console.log("API_BASE_URL:", API_BASE_URL);
      }
    }
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}