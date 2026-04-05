"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  dob?: string | null;
  gender?: string | null;
  city?: string | null;
  state?: string | null;
  qualification?: string | null;
  designation?: string | null;
  institution?: string | null;
  bio?: string | null;
}

interface HealthDetails {
  energyLevel?: number | null;
  sleepQuality?: number | null;
  wellbeing?: number | null;
  painFrequency?: number | null;
  digestiveHealth?: number | null;
}

interface CounsellorInfo {
  id: string;
  rating: number;
  totalRatings: number;
  experience: number;
  level: string;
  isVerified: boolean;
  isAvailable: boolean;
  consultationFee: number;
  expertise: string[];
  bio?: string | null;
  tagline?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: "USER" | "COUNSELLOR" | "SUPERVISOR" | "ADMIN";
  avatar?: string | null;
  profile?: UserProfile | null;
  healthDetails?: HealthDetails | null;
  counsellor?: CounsellorInfo | null;
  _count?: {
    appointmentsAsUser: number;
    reflections: number;
    assessmentAnswers: number;
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refresh: () => void;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refresh: () => {},
  signOut: async () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const signOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
  };

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider value={{ user, loading, refresh: fetchUser, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
