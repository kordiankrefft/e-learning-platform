export type UserCourseEnrollmentDto = {
  id: number;
  userId: number;
  userName?: string | null;
  courseId: number;
  courseTitle: string;
  status: string;
  enrolledAt: string;
  completedAt?: string | null;
  isActive: boolean;
};

export type UserCourseEnrollmentCreateDto = {
  courseId: number;
  status?: string | null;
};

export type UserCourseEnrollmentEditDto = {
  id: number;
  status?: string | null;
  completedAt?: string | null;
};
