using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("CourseCategory")]
public partial class CourseCategory
{
    [Key]
    public int CourseCategoryId { get; set; }

    [StringLength(200)]
    public string Name { get; set; } = null!;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }

    [InverseProperty("CourseCategory")]
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}
