using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("Module")]
[Index("CourseId", Name = "IX_Module_CourseId")]
public partial class Module
{
    [Key]
    public int ModuleId { get; set; }

    public int CourseId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(1000)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }

    public int OrderIndex { get; set; }

    [ForeignKey("CourseId")]
    [InverseProperty("Modules")]
    public virtual Course Course { get; set; } = null!;

    [InverseProperty("Module")]
    public virtual ICollection<Lesson> Lessons { get; set; } = new List<Lesson>();

    [InverseProperty("Module")]
    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
