using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("QuizQuestion")]
[Index("QuizId", Name = "IX_QuizQuestion_QuizId")]
public partial class QuizQuestion
{
    [Key]
    public int QuizQuestionId { get; set; }

    public int QuizId { get; set; }

    public string QuestionText { get; set; } = null!;

    [StringLength(50)]
    public string QuestionType { get; set; } = null!;

    [Column(TypeName = "decimal(5, 2)")]
    public decimal Points { get; set; }

    public bool IsActive { get; set; }

    public int OrderIndex { get; set; }

    [ForeignKey("QuizId")]
    [InverseProperty("QuizQuestions")]
    public virtual Quiz Quiz { get; set; } = null!;

    [InverseProperty("QuizQuestion")]
    public virtual ICollection<QuizAnswerOption> QuizAnswerOptions { get; set; } = new List<QuizAnswerOption>();

    [InverseProperty("QuizQuestion")]
    public virtual ICollection<QuizAttemptAnswer> QuizAttemptAnswers { get; set; } = new List<QuizAttemptAnswer>();
}
