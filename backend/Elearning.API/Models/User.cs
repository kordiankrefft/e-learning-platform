using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Elearning.API.Models;

[Table("User")]
public partial class User
{
    [Key]
    public int UserId { get; set; }
    
    [Required]
    public string IdentityUserId { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    [ForeignKey(nameof(IdentityUserId))]
    public virtual IdentityUser IdentityUser { get; set; } = null!;

    [InverseProperty("User")]
    public virtual UserProfile? UserProfile { get; set; }

    [InverseProperty("CreatedByUser")]
    public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();

    [InverseProperty("User")]
    public virtual ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();

    [InverseProperty("User")]
    public virtual ICollection<IssuedCertificate> IssuedCertificates { get; set; } = new List<IssuedCertificate>();

    [InverseProperty("User")]
    public virtual ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();

    [InverseProperty("UploadedByUser")]
    public virtual ICollection<MediaFile> MediaFiles { get; set; } = new List<MediaFile>();

    [InverseProperty("UpdatedByUser")]
    public virtual ICollection<PageContentBlock> PageContentBlocks { get; set; } = new List<PageContentBlock>();

    [InverseProperty("User")]
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();

    [InverseProperty("FromUser")]
    public virtual ICollection<SupportMessage> SupportMessages { get; set; } = new List<SupportMessage>();

    [InverseProperty("User")]
    public virtual ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();

    [InverseProperty("User")]
    public virtual ICollection<UserCourseAccess> UserCourseAccesses { get; set; } = new List<UserCourseAccess>();

    [InverseProperty("User")]
    public virtual ICollection<UserCourseEnrollment> UserCourseEnrollments { get; set; } = new List<UserCourseEnrollment>();

    [InverseProperty("User")]
    public virtual ICollection<UserNotification> UserNotifications { get; set; } = new List<UserNotification>();

    [InverseProperty("TutorUser")]
    public virtual ICollection<Course> TutorCourses { get; set; } = new List<Course>();

    [InverseProperty("AssignedTutor")]
    public virtual ICollection<SupportTicket> AssignedTickets { get; set; } = new List<SupportTicket>();

}
