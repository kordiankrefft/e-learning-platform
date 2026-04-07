export interface UserDto {
  id: number;
  displayName: string | null;
  preferredLanguage: string | null;
  bio: string | null;
}

export interface UserCreateDto {
  displayName: string | null;
  preferredLanguage: string | null;
  bio: string | null;
}

export interface UserEditDto {
  id: number;
  displayName: string | null;
  preferredLanguage: string | null;
  bio: string | null;
}

export interface UserAdminDto {
  id: number;
  identityUserId: string;
  email: string;
  roles: string[];
  displayName: string | null;
  preferredLanguage: string | null;
  bio: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}
