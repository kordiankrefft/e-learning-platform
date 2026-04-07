  namespace Data
{
    public class Urls
    {
        public const string USERS = "users";
        public const string USERS_ID = "users/{id}";
        public const string USERS_ME = "users/me";

        public const string IDENTITY_CREATE_ROLE = "/identity/add-role";
        public const string IDENTITY_ADD_USER_TO_ROLE = "/identity/add-user-to-role";

        public const string ANNOUNCEMENTS = "announcements";
        public const string ANNOUNCEMENTS_ID = "announcements/{id}";

        public const string AUDIT_LOGS = "audit-logs";
        public const string AUDIT_LOGS_ID = "audit-logs/{id}";

        public const string CERTIFICATE_TEMPLATES = "certificate-templates";
        public const string CERTIFICATE_TEMPLATES_ID = "certificate-templates/{id}";

        public const string COURSES = "courses";
        public const string COURSES_ID = "courses/{id}";
        public const string COURSES_MY_TUTOR = "courses/my-tutor";

        public const string COURSE_CATEGORIES = "course-categories";
        public const string COURSE_CATEGORIES_ID = "course-categories/{id}";

        public const string COURSE_PRICING_PLANS = "course-pricing-plans";
        public const string COURSE_PRICING_PLANS_ID = "course-pricing-plans/{id}";

        public const string ISSUED_CERTIFICATES = "issued-certificates";
        public const string ISSUED_CERTIFICATES_ID = "issued-certificates/{id}";
        public const string COURSE_CERTIFICATE_DOWNLOAD = "courses/{courseId}/certificate/download";

        public const string LESSONS = "lessons";
        public const string LESSONS_ID = "lessons/{id}";
        public const string MODULE_LESSONS = "modules/{moduleId}/lessons";

        public const string LESSON_ATTACHMENTS = "lesson-attachments";
        public const string LESSON_ATTACHMENTS_ID = "lesson-attachments/{id}";
        public const string LESSON_ATTACHMENTS_FOR_LESSON = "lessons/{lessonId}/attachments";


        public const string LESSON_CONTENT_BLOCKS = "lesson-content-blocks";
        public const string LESSON_CONTENT_BLOCKS_ID = "lesson-content-blocks/{id}";
        public const string LESSON_CONTENT_BLOCKS_FOR_LESSON = "lessons/{lessonId}/content-blocks";

        public const string LESSON_PROGRESS = "lesson-progress";
        public const string LESSON_PROGRESS_ID = "lesson-progress/{id}";

        public const string MEDIA_FILES = "media-files";
        public const string MEDIA_FILES_ID = "media-files/{id}";

        public const string MODULES = "modules";
        public const string MODULES_ID = "modules/{id}";
        public const string COURSE_MODULES = "courses/{courseId}/modules";

        public const string PAGE_CONTENT_BLOCKS = "page-content-blocks";
        public const string PAGE_CONTENT_BLOCKS_ID = "page-content-blocks/{id}";
        public const string PAGE_CONTENT_BLOCKS_PAGE = "page-content-blocks/page/{pageKey}";

        public const string QUIZZES = "quizzes";
        public const string QUIZZES_ID = "quizzes/{id}";
        public const string MODULE_QUIZ = "modules/{moduleId}/quiz";

        public const string QUIZ_TAKE = "quizzes/{quizId}/take";

        public const string QUIZ_ANSWER_OPTIONS = "quiz-answer-options";
        public const string QUIZ_ANSWER_OPTIONS_ID = "quiz-answer-options/{id}";

        public const string QUIZ_ATTEMPTS = "quiz-attempts";
        public const string QUIZ_ATTEMPTS_ID = "quiz-attempts/{id}";

        public const string QUIZ_ATTEMPT_ANSWERS = "quiz-attempt-answers";
        public const string QUIZ_ATTEMPT_ANSWERS_ID = "quiz-attempt-answers/{id}";
        public const string QUIZ_ATTEMPT_ANSWERS_FOR_ATTEMPT = "quiz-attempts/{attemptId}/answers";

        public const string QUIZ_QUESTIONS = "quiz-questions";
        public const string QUIZ_QUESTIONS_ID = "quiz-questions/{id}";

        public const string SUPPORT_MESSAGES = "support-messages";
        public const string SUPPORT_MESSAGES_ID = "support-messages/{id}";
        public const string SUPPORT_TICKET_MESSAGES = "support-tickets/{ticketId}/messages";

        public const string SUPPORT_TICKETS = "support-tickets";
        public const string SUPPORT_TICKETS_ID = "support-tickets/{id}";
        public const string MY_SUPPORT_TICKETS = "my-support-tickets";
        public const string MY_ASSIGNED_TICKETS = "my-assigned-tickets";

        public const string USER_COURSE_ACCESSES = "user-course-accesses";
        public const string USER_COURSE_ACCESSES_ID = "user-course-accesses/{id}";
        public const string USER_COURSE_ACCESSES_MY = "user-course-accesses/my";

        public const string USER_COURSE_ENROLLMENTS = "user-course-enrollments";
        public const string USER_COURSE_ENROLLMENTS_ID = "user-course-enrollments/{id}";
        public const string USER_COURSE_ENROLLMENTS_MY = "user-course-enrollments/my";
        public const string USER_COURSE_ENROLLMENTS_COMPLETE = "user-course-enrollments/{id}/complete";

        public const string USER_NOTIFICATIONS = "user-notifications";
        public const string USER_NOTIFICATIONS_ID = "user-notifications/{id}";
        public const string USER_NOTIFICATIONS_MY = "user-notifications/my";

        public const string MY_ROLES = "my-roles";
    }
}
