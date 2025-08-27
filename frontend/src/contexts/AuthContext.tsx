import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthState } from "../types/user";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Omit<User, "id" | "createdAt">) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const API_BASE_URL = "http://localhost:8000/api"; // Express backend

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("redcap_user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
        });
      } catch {
        localStorage.removeItem("redcap_user");
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  /** 🔑 LOGIN */
  const login = async (email: string, password: string) => {
    try {
      console.log("🔑 Logging in with:", { email, password });

      const res = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("📥 Login response:", data);

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid email or password");
      }

      // Save token + user in localStorage
      localStorage.setItem("redcap_token", data.token);
      localStorage.setItem("redcap_user", JSON.stringify(data.user));

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        loading: false,
      });
    } catch (err: any) {
      console.error("❌ Login failed:", err);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 📝 REGISTER */
  const register = async (
    userData: Omit<User, "id" | "createdAt">
  ): Promise<void> => {
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }

      // Save token + user
      localStorage.setItem("redcap_token", data.token);
      localStorage.setItem("redcap_user", JSON.stringify(data.user));

      setAuthState({ isAuthenticated: true, user: data.user, loading: false });
    } catch (err) {
      console.error("Register error:", err);
      setAuthState((prev) => ({ ...prev, loading: false }));
      throw err;
    }
  };

  /** 🚪 LOGOUT */
  const logout = (): void => {
    localStorage.removeItem("redcap_user");
    localStorage.removeItem("redcap_token");
    setAuthState({ isAuthenticated: false, user: null, loading: false });
  };

  /** 👤 UPDATE PROFILE */
  const updateProfile = async (userData: Partial<User>): Promise<void> => {
    if (!authState.user) return;
    setAuthState((prev) => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("redcap_token");
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      if (!res.ok) throw new Error("Update failed");
      const updatedUser = await res.json();

      localStorage.setItem("redcap_user", JSON.stringify(updatedUser));
      setAuthState({
        isAuthenticated: true,
        user: updatedUser,
        loading: false,
      });
    } catch (err) {
      console.error("Update profile error:", err);
      setAuthState((prev) => ({ ...prev, loading: false }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
