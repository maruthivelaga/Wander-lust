import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);

  // Create state object that matches what Dashboard expects
  const state = {
    user: currentUser ? { 
      firstName: currentUser.username || 'User',
      username: currentUser.username 
    } : null,
    isAuthenticated: !!currentUser,
    loading: false
  };

  const register = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      return await res.json();
    } catch (err) {
      console.error("Register error:", err);
      return { success: false, message: "Server error" };
    }
  };

  const login = async (username, password) => {
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (data.success) {
        setCurrentUser({ username }); // store user in context
      }

      return data;
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Server error" };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ register, login, logout, currentUser, state }}>
      {children}
    </AuthContext.Provider>
  );
}
