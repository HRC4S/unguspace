"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "./api";

type User = {
  id_user: string;
  nama_lengkap: string;
  email_amikom: string;
  prodi: string;
  bio: string | null;
  avatar_url: string | null;
} | null;

const AuthContext = createContext<{
  user: User;
  loading: boolean;
  unreadCount: number;
  refresh: () => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
}>({
  user: null,
  loading: true,
  unreadCount: 0,
  refresh: async () => {},
  refreshUnreadCount: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = async () => {
    try {
      const data = await apiFetch("/api/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUnreadCount = async () => {
    try {
      const data = await apiFetch("/api/notifications");
      setUnreadCount(data.filter((n: any) => !n.is_read).length);
    } catch {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (user) {
      refreshUnreadCount();
      const interval = setInterval(refreshUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{ user, loading, unreadCount, refresh, refreshUnreadCount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);