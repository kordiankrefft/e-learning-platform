using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("UserCourseAccess")]
[Index("CourseId", Name = "IX_UserCourseAccess_CourseId")]
[Index("UserId", Name = "IX_UserCourseAccess_UserId")]
public partial class UserCourseAccess
{
    [Key]
    public int UserCourseAccessId { get; set; }

    public int UserId { get; set; }

    public int CourseId { get; set; }

    public int? CoursePricingPlanId { get; set; }

    public DateTime AccessStart { get; set; }

    public DateTime? AccessEnd { get; set; }

    public bool IsActive { get; set; }

    public bool IsRevoked { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("UserCourseAccesses")]
    public virtual Course Course { get; set; } = null!;

    [ForeignKey("CoursePricingPlanId")]
    [InverseProperty("UserCourseAccesses")]
    public virtual CoursePricingPlan? CoursePricingPlan { get; set; }

    [ForeignKey("UserId")]
    [InverseProperty("UserCourseAccesses")]
    public virtual User User { get; set; } = null!;
}
