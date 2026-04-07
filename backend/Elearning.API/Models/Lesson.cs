using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("Lesson")]
[Index("ModuleId", Name = "IX_Lesson_ModuleId")]
[Index("Status", Name = "IX_Lesson_Status")]
public partial class Lesson
{
    [Key]
    public int LessonId { get; set; }

    public int ModuleId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(1000)]
    public string? Summary { get; set; }

    [StringLength(50)]
    public string Status { get; set; } = null!;

    public int OrderIndex { get; set; }

    public bool IsActive { get; set; }

    public int? EstimatedMinutes { get; set; }

    [InverseProperty("Lesson")]
    public virtual ICollection<LessonAttachment> LessonAttachments { get; set; } = new List<LessonAttachment>();

    [InverseProperty("Lesson")]
    public virtual ICollection<LessonContentBlock> LessonContentBlocks { get; set; } = new List<LessonContentBlock>();

    [InverseProperty("Lesson")]
    public virtual ICollection<LessonProgress> LessonProgresses { get; set; } = new List<LessonProgress>();

    [ForeignKey("ModuleId")]
    [InverseProperty("Lessons")]
    public virtual Module Module { get; set; } = null!;

    [InverseProperty("Lesson")]
    public virtual ICollection<Quiz> Quizzes { get; set; } = new List<Quiz>();
}
