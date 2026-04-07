using System;
using System.Collections.Generic;
using Elearning.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models.Contexts;

public partial class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Announcement> Announcements { get; set; }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<CertificateTemplate> CertificateTemplates { get; set; }

    public virtual DbSet<Course> Courses { get; set; }

    public virtual DbSet<CourseCategory> CourseCategories { get; set; }

    public virtual DbSet<CoursePricingPlan> CoursePricingPlans { get; set; }

    public virtual DbSet<IssuedCertificate> IssuedCertificates { get; set; }

    public virtual DbSet<Lesson> Lessons { get; set; }

    public virtual DbSet<LessonAttachment> LessonAttachments { get; set; }

    public virtual DbSet<LessonContentBlock> LessonContentBlocks { get; set; }

    public virtual DbSet<LessonProgress> LessonProgresses { get; set; }

    public virtual DbSet<MediaFile> MediaFiles { get; set; }

    public virtual DbSet<Module> Modules { get; set; }

    public virtual DbSet<PageContentBlock> PageContentBlocks { get; set; }

    public virtual DbSet<Quiz> Quizzes { get; set; }

    public virtual DbSet<QuizAnswerOption> QuizAnswerOptions { get; set; }

    public virtual DbSet<QuizAttempt> QuizAttempts { get; set; }

    public virtual DbSet<QuizAttemptAnswer> QuizAttemptAnswers { get; set; }

    public virtual DbSet<QuizQuestion> QuizQuestions { get; set; }

    public virtual DbSet<SupportMessage> SupportMessages { get; set; }

    public virtual DbSet<SupportTicket> SupportTickets { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserCourseAccess> UserCourseAccesses { get; set; }

    public virtual DbSet<UserCourseEnrollment> UserCourseEnrollments { get; set; }

    public virtual DbSet<UserNotification> UserNotifications { get; set; }

    public virtual DbSet<UserProfile> UserProfiles { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Announcement>(entity =>
        {
            entity.HasKey(e => e.AnnouncementId).HasName("PK__Announce__9DE445746CD3C3A8");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.CreatedByUser).WithMany(p => p.Announcements)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Announcement_User");
        });

        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditLogId).HasName("PK__AuditLog__EB5F6CBD3CC905CA");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs).HasConstraintName("FK_AuditLog_User");
        });

        modelBuilder.Entity<CertificateTemplate>(entity =>
        {
            entity.HasKey(e => e.CertificateTemplateId).HasName("PK__Certific__E97CFAABF51B323B");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<Course>(entity =>
        {
            entity.HasKey(e => e.CourseId).HasName("PK__Course__C92D71A783A0950D");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Draft");

            entity.HasOne(d => d.CourseCategory).WithMany(p => p.Courses).HasConstraintName("FK_Course_Category");

            entity.HasOne(d => d.ThumbnailMedia).WithMany(p => p.Courses).HasConstraintName("FK_Course_ThumbnailMedia");
        });

        modelBuilder.Entity<CourseCategory>(entity =>
        {
            entity.HasKey(e => e.CourseCategoryId).HasName("PK__CourseCa__4D67EBB612AEF5B0");
        });

        modelBuilder.Entity<CoursePricingPlan>(entity =>
        {
            entity.HasKey(e => e.CoursePricingPlanId).HasName("PK__CoursePr__A67547648FD6B141");

            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Course).WithMany(p => p.CoursePricingPlans)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_CoursePricingPlan_Course");
        });

        modelBuilder.Entity<IssuedCertificate>(entity =>
        {
            entity.HasKey(e => e.IssuedCertificateId).HasName("PK__IssuedCe__FA995DED563281D5");

            entity.Property(e => e.IssuedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.CertificateTemplate).WithMany(p => p.IssuedCertificates)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_IssuedCertificate_Template");

            entity.HasOne(d => d.Course).WithMany(p => p.IssuedCertificates)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_IssuedCertificate_Course");

            entity.HasOne(d => d.User).WithMany(p => p.IssuedCertificates)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_IssuedCertificate_User");
        });

        modelBuilder.Entity<Lesson>(entity =>
        {
            entity.HasKey(e => e.LessonId).HasName("PK__Lesson__B084ACD0F4BA978D");

            entity.Property(e => e.Status).HasDefaultValue("Draft");

            entity.HasOne(d => d.Module).WithMany(p => p.Lessons)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Lesson_Module");
        });

        modelBuilder.Entity<LessonAttachment>(entity =>
        {
            entity.HasKey(e => e.LessonAttachmentId).HasName("PK__LessonAt__19A39367B1F36678");

            entity.HasOne(d => d.Lesson).WithMany(p => p.LessonAttachments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LessonAttachment_Lesson");
        });

        modelBuilder.Entity<LessonContentBlock>(entity =>
        {
            entity.HasKey(e => e.LessonContentBlockId).HasName("PK__LessonCo__68C64C97790CDC0B");

            entity.HasOne(d => d.Lesson).WithMany(p => p.LessonContentBlocks)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LessonContentBlock_Lesson");
        });

        modelBuilder.Entity<LessonProgress>(entity =>
        {
            entity.HasKey(e => e.LessonProgressId).HasName("PK__LessonPr__54391C1C0F05C942");

            entity.Property(e => e.LastViewedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Lesson).WithMany(p => p.LessonProgresses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LessonProgress_Lesson");

            entity.HasOne(d => d.User).WithMany(p => p.LessonProgresses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_LessonProgress_User");
        });

        modelBuilder.Entity<MediaFile>(entity =>
        {
            entity.HasKey(e => e.MediaFileId).HasName("PK__MediaFil__E14CB8DB3BCFDFE6");

            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.UploadedByUser).WithMany(p => p.MediaFiles).HasConstraintName("FK_MediaFile_User");
        });

        modelBuilder.Entity<Module>(entity =>
        {
            entity.HasKey(e => e.ModuleId).HasName("PK__Module__2B7477A740FD95D5");

            entity.HasOne(d => d.Course).WithMany(p => p.Modules)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Module_Course");
        });

        modelBuilder.Entity<PageContentBlock>(entity =>
        {
            entity.HasKey(e => e.PageContentBlockId).HasName("PK__PageCont__E7B6732988AA3720");

            entity.Property(e => e.IsActive).HasDefaultValue(true);
            entity.Property(e => e.UpdatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.MediaFile).WithMany(p => p.PageContentBlocks).HasConstraintName("FK_PageContentBlock_Media");

            entity.HasOne(d => d.UpdatedByUser).WithMany(p => p.PageContentBlocks).HasConstraintName("FK_PageContentBlock_User");
        });

        modelBuilder.Entity<Quiz>(entity =>
        {
            entity.HasKey(e => e.QuizId).HasName("PK__Quiz__8B42AE8EA4FDFAFE");

            entity.Property(e => e.IsActive).HasDefaultValue(true);

            entity.HasOne(d => d.Lesson).WithMany(p => p.Quizzes).HasConstraintName("FK_Quiz_Lesson");

            entity.HasOne(d => d.Module).WithMany(p => p.Quizzes).HasConstraintName("FK_Quiz_Module");
        });

        modelBuilder.Entity<QuizAnswerOption>(entity =>
        {
            entity.HasKey(e => e.QuizAnswerOptionId).HasName("PK__QuizAnsw__6E9E14FFEB46B384");

            entity.HasOne(d => d.QuizQuestion).WithMany(p => p.QuizAnswerOptions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAnswerOption_Question");
        });

        modelBuilder.Entity<QuizAttempt>(entity =>
        {
            entity.HasKey(e => e.QuizAttemptId).HasName("PK__QuizAtte__F39FDCEDC4F0A150");

            entity.Property(e => e.StartedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizAttempts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAttempt_Quiz");

            entity.HasOne(d => d.User).WithMany(p => p.QuizAttempts)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAttempt_User");
        });

        modelBuilder.Entity<QuizAttemptAnswer>(entity =>
        {
            entity.HasKey(e => e.QuizAttemptAnswerId).HasName("PK__QuizAtte__44A66E3075980595");

            entity.HasOne(d => d.QuizAttempt).WithMany(p => p.QuizAttemptAnswers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAttemptAnswer_Attempt");

            entity.HasOne(d => d.QuizQuestion).WithMany(p => p.QuizAttemptAnswers)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizAttemptAnswer_Question");

            entity.HasOne(d => d.SelectedOption).WithMany(p => p.QuizAttemptAnswers).HasConstraintName("FK_QuizAttemptAnswer_Option");
        });

        modelBuilder.Entity<QuizQuestion>(entity =>
        {
            entity.HasKey(e => e.QuizQuestionId).HasName("PK__QuizQues__45E34D3E22D59FF5");

            entity.Property(e => e.Points).HasDefaultValueSql("((1.0))");

            entity.HasOne(d => d.Quiz).WithMany(p => p.QuizQuestions)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_QuizQuestion_Quiz");
        });


        modelBuilder.Entity<SupportMessage>(entity =>
        {
            entity.HasKey(e => e.SupportMessageId).HasName("PK__SupportM__1F467E262914FF1F");

            entity.Property(e => e.SentAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.FromUser).WithMany(p => p.SupportMessages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SupportMessage_User");

            entity.HasOne(d => d.SupportTicket).WithMany(p => p.SupportMessages)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SupportMessage_Ticket");
        });

        modelBuilder.Entity<SupportTicket>(entity =>
        {
            entity.HasKey(e => e.SupportTicketId).HasName("PK__SupportT__E064A5F44B05D050");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Open");

            entity.HasOne(d => d.User).WithMany(p => p.SupportTickets)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SupportTicket_User");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C2D28193D");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.IsActive).HasDefaultValue(true);
        });

        modelBuilder.Entity<UserCourseAccess>(entity =>
        {
            entity.HasKey(e => e.UserCourseAccessId).HasName("PK__UserCour__E0F58962964D0B50");

            entity.Property(e => e.AccessStart).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.Course).WithMany(p => p.UserCourseAccesses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserCourseAccess_Course");

            entity.HasOne(d => d.CoursePricingPlan).WithMany(p => p.UserCourseAccesses).HasConstraintName("FK_UserCourseAccess_Plan");

            entity.HasOne(d => d.User).WithMany(p => p.UserCourseAccesses)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserCourseAccess_User");
        });

        modelBuilder.Entity<UserCourseEnrollment>(entity =>
        {
            entity.HasKey(e => e.UserCourseEnrollmentId).HasName("PK__UserCour__298BB691A9323A7B");

            entity.Property(e => e.EnrolledAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status).HasDefaultValue("Active");

            entity.HasOne(d => d.Course).WithMany(p => p.UserCourseEnrollments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserCourseEnrollment_Course");

            entity.HasOne(d => d.User).WithMany(p => p.UserCourseEnrollments)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserCourseEnrollment_User");
        });

        modelBuilder.Entity<UserNotification>(entity =>
        {
            entity.HasKey(e => e.UserNotificationId).HasName("PK__UserNoti__EB298629EC087EB1");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(d => d.User).WithMany(p => p.UserNotifications)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserNotification_User");

            entity.HasOne(d => d.SupportTicket)
                .WithMany(p => p.UserNotifications)
                .HasForeignKey(d => d.SupportTicketId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_UserNotification_SupportTicket");

            entity.HasOne(d => d.SupportMessage)
                .WithMany(p => p.UserNotifications)
                .HasForeignKey(d => d.SupportMessageId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_UserNotification_SupportMessage");
        });

        modelBuilder.Entity<UserProfile>(entity =>
        {
            entity.HasKey(e => e.UserProfileId).HasName("PK__UserProf__9E267F622214AAFF");

            entity.HasOne(d => d.User).WithOne(p => p.UserProfile)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_UserProfile_User");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
