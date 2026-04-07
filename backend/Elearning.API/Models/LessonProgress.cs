using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("LessonProgress")]
[Index("LessonId", Name = "IX_LessonProgress_LessonId")]
[Index("UserId", Name = "IX_LessonProgress_UserId")]
public partial class LessonProgress
{
    [Key]
    public int LessonProgressId { get; set; }

    public int UserId { get; set; }

    public int LessonId { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal ProgressPercent { get; set; }

    public bool IsActive { get; set; }

    public DateTime LastViewedAt { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("LessonProgresses")]
    public virtual Lesson Lesson { get; set; } = null!;

    [ForeignKey("UserId")]
    [InverseProperty("LessonProgresses")]
    public virtual User User { get; set; } = null!;
}
