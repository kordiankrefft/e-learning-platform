import axiosClient from "./axiosClient";
import type {
  CoursePricingPlanDto,
  CoursePricingPlanCreateDto,
  CoursePricingPlanEditDto,
} from "../types/coursePricingPlan";

export const coursePricingPlansApi = {
  getCoursePricingPlans: () =>
    axiosClient.get<CoursePricingPlanDto[]>("/course-pricing-plans"),
  getCoursePricingPlan: (id: number) =>
    axiosClient.get<CoursePricingPlanDto>(`/course-pricing-plans/${id}`),
  createCoursePricingPlan: (dto: CoursePricingPlanCreateDto) =>
    axiosClient.post("/course-pricing-plans", dto),
  editCoursePricingPlan: (id: number, dto: CoursePricingPlanEditDto) =>
    axiosClient.put(`/course-pricing-plans/${id}`, dto),
  deleteCoursePricingPlan: (id: number) =>
    axiosClient.delete(`/course-pricing-plans/${id}`),
};
