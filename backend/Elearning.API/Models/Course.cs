using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("Course")]
[Index("CourseCategoryId", Name = "IX_Course_CategoryId")]
[Index("Status", Name = "IX_Course_Status")]
public partial class Course
{
    [Key]
    public int CourseId { get; set; }

    public int? CourseCategoryId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(500)]
    public string? ShortDescription { get; set; }

    public string? LongDescription { get; set; }

    [StringLength(50)]
    public string? DifficultyLevel { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public int? ThumbnailMediaId { get; set; }

    public bool IsActive { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public int TutorUserId { get; set; } 

    [ForeignKey("TutorUserId")]
    [InverseProperty("TutorCourses")]
    public virtual User TutorUser { get; set; } = null!;

    [ForeignKey("CourseCategoryId")]
    [InverseProperty("Courses")]
    public virtual CourseCategory? CourseCategory { get; set; }

    [ForeignKey("ThumbnailMediaId")]
    [InverseProperty("Courses")]
    public virtual MediaFile? ThumbnailMedia { get; set; }

    [InverseProperty("Course")]
    public virtual ICollection<CoursePricingPlan> CoursePricingPlans { get; set; } = new List<CoursePricingPlan>();

    [InverseProperty("Course")]
    public virtual ICollection<IssuedCertificate> IssuedCertificates { get; set; } = new List<IssuedCertificate>();

    [InverseProperty("Course")]
    public virtual ICollection<Module> Modules { get; set; } = new List<Module>();

    [InverseProperty("Course")]
    public virtual ICollection<UserCourseAccess> UserCourseAccesses { get; set; } = new List<UserCourseAccess>();

    [InverseProperty("Course")]
    public virtual ICollection<UserCourseEnrollment> UserCourseEnrollments { get; set; } = new List<UserCourseEnrollment>();

    [InverseProperty("Course")]
    public virtual ICollection<SupportTicket> SupportTickets { get; set; } = new List<SupportTicket>();
}
