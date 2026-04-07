using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("QuizAttemptAnswer")]
[Index("QuizAttemptId", Name = "IX_QuizAttemptAnswer_AttemptId")]
[Index("QuizQuestionId", Name = "IX_QuizAttemptAnswer_QuestionId")]
public partial class QuizAttemptAnswer
{
    [Key]
    public int QuizAttemptAnswerId { get; set; }

    public int QuizAttemptId { get; set; }

    public int QuizQuestionId { get; set; }

    public int? SelectedOptionId { get; set; }

    public bool IsActive { get; set; }

    public string? OpenAnswerText { get; set; }

    public bool? IsMarkedCorrect { get; set; }

    [ForeignKey("QuizAttemptId")]
    [InverseProperty("QuizAttemptAnswers")]
    public virtual QuizAttempt QuizAttempt { get; set; } = null!;

    [ForeignKey("QuizQuestionId")]
    [InverseProperty("QuizAttemptAnswers")]
    public virtual QuizQuestion QuizQuestion { get; set; } = null!;

    [ForeignKey("SelectedOptionId")]
    [InverseProperty("QuizAttemptAnswers")]
    public virtual QuizAnswerOption? SelectedOption { get; set; }
}
