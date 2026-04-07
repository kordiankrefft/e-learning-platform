import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authApi } from "../api/authApi";
import { userApi } from "../api/userApi";
import type { UserDto } from "../types/user";

interface AuthContextValue {
  isAuthenticated: boolean;
  accessToken: string | null;
  roles: string[];
  currentUser: UserDto | null;
  login: (token: string) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<UserDto | null>(null);

  // Pobranie profilu z backendu
  const loadUserProfile = async () => {
    try {
      const me = await userApi.getMe();
      setCurrentUser(me.data);
    } catch {
      setCurrentUser(null);
    }
  };

  // Przy starcie: token, role + profil
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");

    if (storedToken) {
      setAccessToken(storedToken);

      (async () => {
        try {
          const res = await authApi.getMyRoles();
          setRoles(res.data);
        } catch {
          setRoles([]);
        }

        await loadUserProfile();
      })();
    }
  }, []);

  const login = async (token: string) => {
    localStorage.setItem("authToken", token);
    setAccessToken(token);

    try {
      const res = await authApi.getMyRoles();
      setRoles(res.data);
    } catch {
      setRoles([]);
    }

    await loadUserProfile();
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setAccessToken(null);
    setRoles([]);
    setCurrentUser(null);
  };

  const hasRole = (role: string) => roles.includes(role);

  const value: AuthContextValue = {
    isAuthenticated: !!accessToken,
    accessToken,
    roles,
    currentUser,
    login,
    logout,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
