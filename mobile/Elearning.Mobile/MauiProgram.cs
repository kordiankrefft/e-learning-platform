using Elearning.Mobile.Services;
using Elearning.Mobile.Services.Auth;
using Elearning.Mobile.ViewModels;
using Elearning.Mobile.ViewModels.LessonDetails;
using Elearning.Mobile.ViewModels.MyCourses;
using Elearning.Mobile.ViewModels.Quizzes;
using Elearning.Mobile.Views;
using Microsoft.Extensions.Logging;

namespace Elearning.Mobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
                fonts.AddFont("fa-solid-900.ttf", "FASolid");
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        // Services
        builder.Services.AddSingleton<TokenService>();
        builder.Services.AddSingleton<ApiClient>();
        builder.Services.AddSingleton<AuthService>();
        builder.Services.AddSingleton<AuthState>();
        builder.Services.AddSingleton<PageContentBlockService>();
        builder.Services.AddSingleton<AnnouncementService>();
        builder.Services.AddTransient<UserService>();
        builder.Services.AddTransient<CourseCategoryService>();
        builder.Services.AddTransient<CourseService>();
        builder.Services.AddTransient<CoursePricingPlanService>();
        builder.Services.AddTransient<UserCourseEnrollmentService>();
        builder.Services.AddTransient<UserCourseAccessService>();
        builder.Services.AddSingleton<ModuleService>();
        builder.Services.AddSingleton<QuizService>();
        builder.Services.AddSingleton<LessonService>();
        builder.Services.AddSingleton<LessonProgressService>();
        builder.Services.AddTransient<SupportTicketService>();
        builder.Services.AddTransient<SupportMessageService>();
        builder.Services.AddSingleton<UserNotificationService>();
        builder.Services.AddSingleton<NotificationsPollingService>();
        builder.Services.AddSingleton<LessonContentBlockService>();
        builder.Services.AddSingleton<LessonAttachmentService>();
        builder.Services.AddSingleton<QuizTakeService>();
        builder.Services.AddSingleton<QuizAttemptService>();
        builder.Services.AddSingleton<QuizAttemptAnswerService>();
        builder.Services.AddSingleton<IssuedCertificateService>();

        // ViewModels
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<HomeViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();
        builder.Services.AddTransient<CourseCategoryViewModel>();
        builder.Services.AddTransient<CourseViewModel>();
        builder.Services.AddTransient<CoursePricingPlanViewModel>();
        builder.Services.AddTransient<MyCourseViewModel>();
        builder.Services.AddTransient<ModuleViewModel>();
        builder.Services.AddTransient<LessonViewModel>();
        builder.Services.AddTransient<LessonDetailViewModel>();
        builder.Services.AddTransient<SupportTicketViewModel>();
        builder.Services.AddTransient<SupportTicketDetailViewModel>();
        builder.Services.AddTransient<NewSupportTicketViewModel>();
        builder.Services.AddTransient<QuizViewModel>();

        // Views
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<HomePage>();
        builder.Services.AddTransient<ProfilePage>();
        builder.Services.AddTransient<CourseCategoriesPage>();
        builder.Services.AddTransient<CoursesPage>();
        builder.Services.AddTransient<CoursePricingPlansPage>();
        builder.Services.AddTransient<MyCoursesPage>();
        builder.Services.AddTransient<ModulesPage>();
        builder.Services.AddTransient<LessonsPage>();
        builder.Services.AddTransient<LessonPage>();
        builder.Services.AddTransient<SupportTicketsPage>();
        builder.Services.AddTransient<SupportTicketDetailsPage>();
        builder.Services.AddTransient<NewSupportTicketPage>();
        builder.Services.AddTransient<QuizPage>();

        builder.Services.AddSingleton<AppShell>();

        return builder.Build();
    }
}
