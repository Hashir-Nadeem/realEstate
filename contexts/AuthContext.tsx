"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

interface User {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  signup: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: string; // ✅ ADD THIS
  }) => Promise<{ success: boolean; message: string }>;
login: (
  email: string,
  password: string,
  rememberMe: boolean
) => Promise<{
  success: boolean;
  message?: string;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}>;

  forgotPassword: (
    email: string
  ) => Promise<{ success: boolean; message: string }>;

  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

 useEffect(() => {
  const storedUser = localStorage.getItem("user");

  if (storedUser && storedUser !== "undefined") {
    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Invalid user in localStorage. Clearing...");
      localStorage.removeItem("user");
    }
  }

  setLoading(false);
}, []);

  // ==========================
  // REGISTER
  // ==========================
 const signup = async (data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: string; // 👈 add this
}) => {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: data.name,
        email: data.email,
        phoneNumber: data.phone,
        password: data.password,
        role: data.role, // 👈 pass role
        rememberMe: false,
      }),
    });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Registration failed",
        };
      }

      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("refreshToken", result.refreshToken);
      localStorage.setItem("user", JSON.stringify(result.user));

      setUser(result.user);
      setIsAuthenticated(true);

      return { success: true, message: "Account created successfully" };
    } catch {
      return { success: false, message: "Server connection failed" };
    }
  };

  // ==========================
// LOGIN
// ==========================
const login = async (
  emailOrPhone: string,
  password: string,
  rememberMe: boolean
) => {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        emailOrPhone,
        password,
        rememberMe,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data?.message || "Login failed",
      };
    }

    // ✅ Normalize user (fix User vs user issue HERE)
    const user = data.user || data.User;

    // ✅ Save properly
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    }

    // (optional but recommended)
    if (data.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
    }

    return {
      success: true,
      user: user, // ✅ always lowercase now
    };

  } catch (error) {
    return {
      success: false,
      message: "Something went wrong. Please try again.",
    };
  }
};

  // ==========================
  // FORGOT PASSWORD
  // ==========================
  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: result.message || "Something went wrong",
        };
      }

      return {
        success: true,
        message: result.message,
      };
    } catch {
      return {
        success: false,
        message: "Server error",
      };
    }
  };

  // ==========================
  // LOGOUT
  // ==========================
  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        signup,
        login,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
