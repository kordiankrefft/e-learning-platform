using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("UserCourseEnrollment")]
[Index("CourseId", Name = "IX_UserCourseEnrollment_CourseId")]
[Index("UserId", Name = "IX_UserCourseEnrollment_UserId")]
public partial class UserCourseEnrollment
{
    [Key]
    public int UserCourseEnrollmentId { get; set; }

    public int UserId { get; set; }

    public int CourseId { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public bool IsActive { get; set; }

    public DateTime EnrolledAt { get; set; }

    public DateTime? CompletedAt { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("UserCourseEnrollments")]
    public virtual Course Course { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("UserCourseEnrollments")]
    public virtual User User { get; set; } = null!;
}
