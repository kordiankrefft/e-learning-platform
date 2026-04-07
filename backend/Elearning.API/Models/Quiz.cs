using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("Quiz")]
[Index("LessonId", Name = "IX_Quiz_LessonId")]
[Index("ModuleId", Name = "IX_Quiz_ModuleId")]
public partial class Quiz
{
    [Key]
    public int QuizId { get; set; }

    public int? LessonId { get; set; }

    public int? ModuleId { get; set; }

    [StringLength(200)]
    public string Title { get; set; } = null!;

    [StringLength(1000)]
    public string? Description { get; set; }

    public int? TimeLimitSeconds { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? PassThresholdPct { get; set; }

    public int? MaxAttempts { get; set; }

    public bool IsActive { get; set; }

    [ForeignKey("LessonId")]
    [InverseProperty("Quizzes")]
    public virtual Lesson? Lesson { get; set; }

    [ForeignKey("ModuleId")]
    [InverseProperty("Quizzes")]
    public virtual Module? Module { get; set; }

    [InverseProperty("Quiz")]
    public virtual ICollection<QuizAttempt> QuizAttempts { get; set; } = new List<QuizAttempt>();

    [InverseProperty("Quiz")]
    public virtual ICollection<QuizQuestion> QuizQuestions { get; set; } = new List<QuizQuestion>();
}
