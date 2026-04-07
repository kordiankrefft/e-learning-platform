using Elearning.API.Models.Contexts;
using Elearning.API.Services;
using Elearning.API.Services.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using Elearning.API.Middleware;
using System.Linq.Expressions;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

string connectionString = builder.Configuration.GetConnectionString("Default") ?? throw new Exception("Brak connection string \"Default\"");

builder.Services.AddDbContext<IdentityContext>(options =>
{
    options.UseSqlServer(connectionString);
});

builder.Services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);
builder.Services.AddAuthorizationBuilder();
builder.Services.AddIdentityCore<IdentityUser>()
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<IdentityContext>()
.AddApiEndpoints();

builder.Services.AddDbContext<DatabaseContext>(options =>
{
    options.UseSqlServer(connectionString);
});
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IAuditLogService, AuditLogService>();
builder.Services.AddScoped<ICertificateTemplateService, CertificateTemplateService>();
builder.Services.AddScoped<ICourseCategoryService, CourseCategoryService>();
builder.Services.AddScoped<ICoursePricingPlanService, CoursePricingPlanService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IIssuedCertificateService, IssuedCertificateService>();
builder.Services.AddScoped<ILessonAttachmentService, LessonAttachmentService>();
builder.Services.AddScoped<ILessonContentBlockService, LessonContentBlockService>();
builder.Services.AddScoped<ILessonProgressService, LessonProgressService>();
builder.Services.AddScoped<ILessonService, LessonService>();
builder.Services.AddScoped<IMediaFileService, MediaFileService>();
builder.Services.AddScoped<IModuleService, ModuleService>();
builder.Services.AddScoped<IPageContentBlockService, PageContentBlockService>();
builder.Services.AddScoped<IQuizAnswerOptionService, QuizAnswerOptionService>();
builder.Services.AddScoped<IQuizAttemptAnswerService, QuizAttemptAnswerService>();
builder.Services.AddScoped<IQuizAttemptService, QuizAttemptService>();
builder.Services.AddScoped<IQuizQuestionService, QuizQuestionService>();
builder.Services.AddScoped<IQuizService, QuizService>();
builder.Services.AddScoped<ISupportMessageService, SupportMessageService>();
builder.Services.AddScoped<ISupportTicketService, SupportTicketService>();
builder.Services.AddScoped<IUserCourseAccessService, UserCourseAccessService>();
builder.Services.AddScoped<IUserCourseEnrollmentService, UserCourseEnrollmentService>();
builder.Services.AddScoped<IUserNotificationService, UserNotificationService>();
builder.Services.AddScoped<IUserService, UserService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendClient", policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseCors("FrontendClient");

app.UseAuthentication();

app.UseAuthorization();

app.UseMiddleware<AuditLoggingMiddleware>();

app.MapControllers();

app.MapIdentityApi<IdentityUser>();

app.Run();
