export type CoursePricingPlanDto = {
  id: number;
  courseId: number;
  courseTitle?: string | null;
  name: string;
  description?: string | null;
  accessDurationDays?: number | null;
  isActive: boolean;
};

export type CoursePricingPlanCreateDto = {
  courseId: number;
  name?: string | null;
  description?: string | null;
  accessDurationDays?: number | null;
};

export type CoursePricingPlanEditDto = {
  id: number;
  courseId: number;
  name?: string | null;
  description?: string | null;
  accessDurationDays?: number | null;
};
