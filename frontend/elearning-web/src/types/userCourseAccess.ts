export type UserCourseAccessDto = {
  id: number;
  userId: number;
  userName?: string | null;
  courseId: number;
  courseTitle?: string | null;
  coursePricingPlanId?: number | null;
  coursePricingPlanName?: string | null;
  accessStart: string;
  accessEnd?: string | null;
  isRevoked: boolean;
  isActive: boolean;
};

export type UserCourseAccessCreateDto = {
  courseId: number;
  coursePricingPlanId?: number | null;
};

export type UserCourseAccessEditDto = {
  id: number;
  coursePricingPlanId?: number | null;
  accessEnd?: string | null;
  isRevoked: boolean;
};
