import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import CourseCategoriesPage from "./pages/CourseCategoriesPage";
import CoursesPage from "./pages/CoursesPage";
import CoursePricingPlansPage from "./pages/CoursePricingPlansPage";
import MyCoursesPage from "./pages/MyCoursesPage";
import ModulesPage from "./pages/ModulesPage";
import LessonsPage from "./pages/LessonsPage";
import LessonPage from "./pages/LessonPage";
import QuizPage from "./pages/QuizPage";
import SupportTicketsPage from "./pages/SupportTicketsPage";
import SupportTicketDetailPage from "./pages/SupportTicketDetailPage";

import TutorDashboardPage from "./pages/tutor/TutorDashboardPage";
import TutorCoursesPage from "./pages/tutor/course/CoursesPage";
import TutorCourseEditPage from "./pages/tutor/course/CourseEditPage";
import TutorCourseCreatePage from "./pages/tutor/course/CourseCreatePage";
import TutorModulesPage from "./pages/tutor/module/ModulesPage";
import TutorModuleCreatePage from "./pages/tutor/module/ModuleCreatePage";
import TutorModuleEditPage from "./pages/tutor/module/ModuleEditPage";
import TutorLessonsPage from "./pages/tutor/lesson/LessonsPage";
import TutorLessonCreatePage from "./pages/tutor/lesson/LessonCreatePage";
import TutorLessonEditPage from "./pages/tutor/lesson/LessonEditPage";
import TutorQuizzesPage from "./pages/tutor/quiz/QuizzesPage";
import TutorQuizCreatePage from "./pages/tutor/quiz/QuizCreatePage";
import TutorQuizEditPage from "./pages/tutor/quiz/QuizEditPage";
import TutorLessonContentBlocksPage from "./pages/tutor/lessonContentBlock/LessonContentBlocksPage";
import TutorLessonContentBlockCreatePage from "./pages/tutor/lessonContentBlock/LessonContentBlockCreatePage";
import TutorLessonContentBlockEditPage from "./pages/tutor/lessonContentBlock/LessonContentBlockEditPage";
import TutorLessonAttachmentsPage from "./pages/tutor/lessonAttachment/LessonAttachmentsPage";
import TutorLessonAttachmentCreatePage from "./pages/tutor/lessonAttachment/LessonAttachmentCreatePage";
import TutorLessonAttachmentEditPage from "./pages/tutor/lessonAttachment/LessonAttachmentEditPage";
import TutorQuizQuestionsPage from "./pages/tutor/quizQuestion/QuizQuestionsPage";
import TutorQuizQuestionCreatePage from "./pages/tutor/quizQuestion/QuizQuestionCreatePage";
import TutorQuizQuestionEditPage from "./pages/tutor/quizQuestion/QuizQuestionEditPage";
import TutorQuizAnswerOptionsPage from "./pages/tutor/quizAnswerOption/QuizAnswerOptionsPage";
import TutorQuizAnswerOptionCreatePage from "./pages/tutor/quizAnswerOption/QuizAnswerOptionCreatePage";
import TutorQuizAnswerOptionEditPage from "./pages/tutor/quizAnswerOption/QuizAnswerOptionEditPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AuditLogsPage from "./pages/admin/auditLog/AuditLogsPage";
import AuditLogDetailsPage from "./pages/admin/auditLog/AuditLogDetailsPage";
import UsersPage from "./pages/admin/user/UsersPage";
import UserDetailsPage from "./pages/admin/user/UserEditPage";
import AnnouncementsPage from "./pages/admin/announcement/AnnouncementsPage";
import AnnouncementCreatePage from "./pages/admin/announcement/AnnouncementCreatePage";
import AnnouncementEditPage from "./pages/admin/announcement/AnnouncementEditPage";
import CertificateTemplatesPage from "./pages/admin/certificateTemplate/CertificateTemplatesPage";
import CertificateTemplateCreatePage from "./pages/admin/certificateTemplate/CertificateTemplateCreatePage";
import CertificateTemplateEditPage from "./pages/admin/certificateTemplate/CertificateTemplateEditPage";
import CoursesAdminPage from "./pages/admin/course/CoursesPage";
import CourseCreatePage from "./pages/admin/course/CourseCreatePage";
import CourseEditPage from "./pages/admin/course/CourseEditPage";
import CourseCategoriesAdminPage from "./pages/admin/courseCategory/CourseCategoriesPage";
import CourseCategoryCreatePage from "./pages/admin/courseCategory/CourseCategoryCreatePage";
import CourseCategoryEditPage from "./pages/admin/courseCategory/CourseCategoryEditPage";
import CoursePricingPlansAdminPage from "./pages/admin/coursePricingPlan/CoursePricingPlansPage";
import CoursePricingPlanCreatePage from "./pages/admin/coursePricingPlan/CoursePricingPlanCreatePage";
import CoursePricingPlanEditPage from "./pages/admin/coursePricingPlan/CoursePricingPlanEditPage";
import IssuedCertificatesPage from "./pages/admin/issuedCertificate/IssuedCertificatesPage";
import IssuedCertificateDetailsPage from "./pages/admin/issuedCertificate/IssuedCertificateDetailsPage";
import LessonsAdminPage from "./pages/admin/lesson/LessonsPage";
import LessonCreatePage from "./pages/admin/lesson/LessonCreatePage";
import LessonEditPage from "./pages/admin/lesson/LessonEditPage";
import LessonAttachmentsPage from "./pages/admin/lessonAttachment/LessonAttachmentsPage";
import LessonAttachmentCreatePage from "./pages/admin/lessonAttachment/LessonAttachmentCreatePage";
import LessonAttachmentEditPage from "./pages/admin/lessonAttachment/LessonAttachmentEditPage";
import LessonContentBlocksPage from "./pages/admin/lessonContentBlock/LessonContentBlocksPage";
import LessonContentBlockCreatePage from "./pages/admin/lessonContentBlock/LessonContentBlockCreatePage";
import LessonContentBlockEditPage from "./pages/admin/lessonContentBlock/LessonContentBlockEditPage";
import LessonProgressesPage from "./pages/admin/lessonProgress/LessonProgressesPage";
import LessonProgressDetailsPage from "./pages/admin/lessonProgress/LessonProgressDetailsPage";
import MediaFilesPage from "./pages/admin/mediaFile/MediaFilesPage";
import MediaFileCreatePage from "./pages/admin/mediaFile/MediaFileCreatePage";
import MediaFileEditPage from "./pages/admin/mediaFile/MediaFileEditPage";
import ModulesAdminPage from "./pages/admin/module/ModulesPage";
import ModuleCreatePage from "./pages/admin/module/ModuleCreatePage";
import ModuleEditPage from "./pages/admin/module/ModuleEditPage";
import PageContentBlocksPage from "./pages/admin/pageContentBlock/PageContentBlocksPage";
import PageContentBlockCreatePage from "./pages/admin/pageContentBlock/PageContentBlockCreatePage";
import PageContentBlockEditPage from "./pages/admin/pageContentBlock/PageContentBlockEditPage";
import QuizzesPage from "./pages/admin/quiz/QuizzesPage";
import QuizCreatePage from "./pages/admin/quiz/QuizCreatePage";
import QuizEditPage from "./pages/admin/quiz/QuizEditPage";
import QuizAnswerOptionsPage from "./pages/admin/quizAnswerOption/QuizAnswerOptionsPage";
import QuizAnswerOptionCreatePage from "./pages/admin/quizAnswerOption/QuizAnswerOptionCreatePage";
import QuizAnswerOptionEditPage from "./pages/admin/quizAnswerOption/QuizAnswerOptionEditPage";
import QuizAttemptsPage from "./pages/admin/quizAttempt/QuizAttemptsPage";
import QuizAttemptEditPage from "./pages/admin/quizAttempt/QuizAttemptEditPage";
import QuizAttemptAnswersPage from "./pages/admin/quizAttemptAnswer/QuizAttemptAnswersPage";
import QuizAttemptAnswerDetailsPage from "./pages/admin/quizAttemptAnswer/QuizAttemptAnswerDetailsPage";
import QuizQuestionsPage from "./pages/admin/quizQuestion/QuizQuestionsPage";
import QuizQuestionCreatePage from "./pages/admin/quizQuestion/QuizQuestionCreatePage";
import QuizQuestionEditPage from "./pages/admin/quizQuestion/QuizQuestionEditPage";
import SupportTicketsAdminPage from "./pages/admin/supportTicket/SupportTicketsPage";
import SupportTicketEditPage from "./pages/admin/supportTicket/SupportTicketEditPage";
import SupportMessagesPage from "./pages/admin/supportMessage/SupportMessagesPage";
import SupportMessageDetailsPage from "./pages/admin/supportMessage/SupportMessageDetailsPage";
import UserCourseAccessesPage from "./pages/admin/userCourseAccess/UserCourseAccessesPage";
import UserCourseAccessEditPage from "./pages/admin/userCourseAccess/UserCourseAccessEditPage";
import UserCourseEnrollmentsPage from "./pages/admin/userCourseEnrollment/UserCourseEnrollmentsPage";
import UserCourseEnrollmentDetailsPage from "./pages/admin/userCourseEnrollment/UserCourseEnrollmentDetailsPage";
import UserNotificationsPage from "./pages/admin/userNotification/UserNotificationsPage";
import UserNotificationDetailsPage from "./pages/admin/userNotification/UserNotificationDetailsPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/categories" element={<CourseCategoriesPage />} />
          <Route
            path="/categories/:categoryId/courses"
            element={<CoursesPage />}
          />
          <Route
            path="/courses/:courseId/pricing"
            element={<CoursePricingPlansPage />}
          />
          <Route path="/my-courses" element={<MyCoursesPage />} />
          <Route path="/courses/:courseId/modules" element={<ModulesPage />} />
          <Route path="/modules/:moduleId/lessons" element={<LessonsPage />} />
          <Route path="/lessons/:lessonId" element={<LessonPage />} />
          <Route path="/modules/:moduleId/quiz" element={<QuizPage />} />
          <Route path="/support/tickets" element={<SupportTicketsPage />} />
          <Route
            path="/support/tickets/:ticketId"
            element={<SupportTicketDetailPage />}
          />

          <Route path="/tutor">
            <Route index element={<Navigate to="/tutor/dashboard" replace />} />

            <Route path="dashboard" element={<TutorDashboardPage />} />

            <Route path="courses" element={<TutorCoursesPage />} />
            <Route path="courses/new" element={<TutorCourseCreatePage />} />
            <Route path="courses/:id" element={<TutorCourseEditPage />} />

            <Route path="modules" element={<TutorModulesPage />} />
            <Route path="modules/new" element={<TutorModuleCreatePage />} />
            <Route path="modules/:id" element={<TutorModuleEditPage />} />

            <Route path="lessons" element={<TutorLessonsPage />} />
            <Route path="lessons/new" element={<TutorLessonCreatePage />} />
            <Route path="lessons/:id" element={<TutorLessonEditPage />} />

            <Route path="quizzes" element={<TutorQuizzesPage />} />
            <Route path="quizzes/new" element={<TutorQuizCreatePage />} />
            <Route path="quizzes/:id" element={<TutorQuizEditPage />} />

            <Route
              path="lesson-content-blocks"
              element={<TutorLessonContentBlocksPage />}
            />
            <Route
              path="lesson-content-blocks/new"
              element={<TutorLessonContentBlockCreatePage />}
            />
            <Route
              path="lesson-content-blocks/:id"
              element={<TutorLessonContentBlockEditPage />}
            />

            <Route
              path="lesson-attachments"
              element={<TutorLessonAttachmentsPage />}
            />
            <Route
              path="lesson-attachments/new"
              element={<TutorLessonAttachmentCreatePage />}
            />
            <Route
              path="lesson-attachments/:id"
              element={<TutorLessonAttachmentEditPage />}
            />

            <Route path="quiz-questions" element={<TutorQuizQuestionsPage />} />
            <Route
              path="quiz-questions/new"
              element={<TutorQuizQuestionCreatePage />}
            />
            <Route
              path="quiz-questions/:id"
              element={<TutorQuizQuestionEditPage />}
            />

            <Route
              path="quiz-answer-options"
              element={<TutorQuizAnswerOptionsPage />}
            />
            <Route
              path="quiz-answer-options/new"
              element={<TutorQuizAnswerOptionCreatePage />}
            />
            <Route
              path="quiz-answer-options/:id"
              element={<TutorQuizAnswerOptionEditPage />}
            />
          </Route>

          <Route path="/admin">
            <Route index element={<Navigate to="/admin/dashboard" replace />} />

            <Route path="dashboard" element={<AdminDashboardPage />} />

            <Route path="users" element={<UsersPage />} />
            <Route path="users/:id" element={<UserDetailsPage />} />

            <Route path="audit-logs" element={<AuditLogsPage />} />
            <Route path="audit-logs/:id" element={<AuditLogDetailsPage />} />

            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route
              path="announcements/new"
              element={<AnnouncementCreatePage />}
            />
            <Route
              path="announcements/:id"
              element={<AnnouncementEditPage />}
            />
            <Route
              path="certificate-templates"
              element={<CertificateTemplatesPage />}
            />
            <Route
              path="certificate-templates/new"
              element={<CertificateTemplateCreatePage />}
            />
            <Route
              path="certificate-templates/:id"
              element={<CertificateTemplateEditPage />}
            />
            <Route path="courses" element={<CoursesAdminPage />} />
            <Route path="courses/new" element={<CourseCreatePage />} />
            <Route path="courses/:id" element={<CourseEditPage />} />

            <Route
              path="course-categories"
              element={<CourseCategoriesAdminPage />}
            />
            <Route
              path="course-categories/new"
              element={<CourseCategoryCreatePage />}
            />
            <Route
              path="course-categories/:id"
              element={<CourseCategoryEditPage />}
            />

            <Route
              path="course-pricing-plans"
              element={<CoursePricingPlansAdminPage />}
            />
            <Route
              path="course-pricing-plans/new"
              element={<CoursePricingPlanCreatePage />}
            />
            <Route
              path="course-pricing-plans/:id"
              element={<CoursePricingPlanEditPage />}
            />

            <Route
              path="issued-certificates"
              element={<IssuedCertificatesPage />}
            />

            <Route
              path="issued-certificates/:id"
              element={<IssuedCertificateDetailsPage />}
            />

            <Route path="lessons" element={<LessonsAdminPage />} />
            <Route path="lessons/new" element={<LessonCreatePage />} />
            <Route path="lessons/:id" element={<LessonEditPage />} />
            <Route
              path="lesson-attachments"
              element={<LessonAttachmentsPage />}
            />
            <Route
              path="lesson-attachments/new"
              element={<LessonAttachmentCreatePage />}
            />
            <Route
              path="lesson-attachments/:id"
              element={<LessonAttachmentEditPage />}
            />

            <Route
              path="lesson-content-blocks"
              element={<LessonContentBlocksPage />}
            />
            <Route
              path="lesson-content-blocks/new"
              element={<LessonContentBlockCreatePage />}
            />
            <Route
              path="lesson-content-blocks/:id"
              element={<LessonContentBlockEditPage />}
            />

            <Route path="lesson-progress" element={<LessonProgressesPage />} />
            <Route
              path="lesson-progress/:id"
              element={<LessonProgressDetailsPage />}
            />

            <Route path="media-files" element={<MediaFilesPage />} />
            <Route path="media-files/new" element={<MediaFileCreatePage />} />
            <Route path="media-files/:id" element={<MediaFileEditPage />} />

            <Route path="modules" element={<ModulesAdminPage />} />
            <Route path="modules/new" element={<ModuleCreatePage />} />
            <Route path="modules/:id" element={<ModuleEditPage />} />

            <Route
              path="page-content-blocks"
              element={<PageContentBlocksPage />}
            />
            <Route
              path="page-content-blocks/new"
              element={<PageContentBlockCreatePage />}
            />
            <Route
              path="page-content-blocks/:id"
              element={<PageContentBlockEditPage />}
            />
            <Route path="quizzes" element={<QuizzesPage />} />
            <Route path="quizzes/new" element={<QuizCreatePage />} />
            <Route path="quizzes/:id" element={<QuizEditPage />} />

            <Route
              path="quiz-answer-options"
              element={<QuizAnswerOptionsPage />}
            />
            <Route
              path="quiz-answer-options/new"
              element={<QuizAnswerOptionCreatePage />}
            />
            <Route
              path="quiz-answer-options/:id"
              element={<QuizAnswerOptionEditPage />}
            />

            <Route path="quiz-attempts" element={<QuizAttemptsPage />} />
            <Route path="quiz-attempts/:id" element={<QuizAttemptEditPage />} />

            <Route
              path="quiz-attempt-answers"
              element={<QuizAttemptAnswersPage />}
            />
            <Route
              path="quiz-attempt-answers/:id"
              element={<QuizAttemptAnswerDetailsPage />}
            />
            <Route path="quiz-questions" element={<QuizQuestionsPage />} />
            <Route
              path="quiz-questions/new"
              element={<QuizQuestionCreatePage />}
            />
            <Route
              path="quiz-questions/:id"
              element={<QuizQuestionEditPage />}
            />

            <Route
              path="support-tickets"
              element={<SupportTicketsAdminPage />}
            />
            <Route
              path="support-tickets/:id"
              element={<SupportTicketEditPage />}
            />

            <Route path="support-messages" element={<SupportMessagesPage />} />
            <Route
              path="support-messages/:id"
              element={<SupportMessageDetailsPage />}
            />

            <Route
              path="user-course-accesses"
              element={<UserCourseAccessesPage />}
            />
            <Route
              path="user-course-accesses/:id"
              element={<UserCourseAccessEditPage />}
            />

            <Route
              path="user-course-enrollments"
              element={<UserCourseEnrollmentsPage />}
            />
            <Route
              path="user-course-enrollments/:id"
              element={<UserCourseEnrollmentDetailsPage />}
            />

            <Route
              path="user-notifications"
              element={<UserNotificationsPage />}
            />
            <Route
              path="user-notifications/:id"
              element={<UserNotificationDetailsPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
