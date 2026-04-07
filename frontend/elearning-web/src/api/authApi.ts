import axiosClient from "./axiosClient";
import type { LoginResponse } from "../types/auth";

export const authApi = {
  login: (email: string, password: string) =>
    axiosClient.post<LoginResponse>("/login", {
      email,
      password,
    }),
  register: (email: string, password: string) =>
    axiosClient.post("/register", {
      email,
      password,
    }),

  getMyRoles: () => axiosClient.get<string[]>("/my-roles"),
};
