import axiosClient from "./axiosClient";
import type { UserDto, UserCreateDto, UserEditDto } from "../types/user";

export const userApi = {
  //profil zalogowanego usera
  getMe: () => axiosClient.get<UserDto>("/users/me"),
  createMe: (dto: UserCreateDto) => axiosClient.post("/users/me", dto),
  editMe: (dto: UserEditDto) => axiosClient.put(`/users/me`, dto),
};
