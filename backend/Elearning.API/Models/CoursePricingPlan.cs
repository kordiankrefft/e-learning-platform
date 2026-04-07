using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("CoursePricingPlan")]
[Index("CourseId", Name = "IX_CoursePricingPlan_CourseId")]
public partial class CoursePricingPlan
{
    [Key]
    public int CoursePricingPlanId { get; set; }

    public int CourseId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = null!;

    [StringLength(500)]
    public string? Description { get; set; }

    public int? AccessDurationDays { get; set; }

    public bool IsActive { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("CoursePricingPlans")]
    public virtual Course Course { get; set; } = null!;

    [InverseProperty("CoursePricingPlan")]
    public virtual ICollection<UserCourseAccess> UserCourseAccesses { get; set; } = new List<UserCourseAccess>();
}
