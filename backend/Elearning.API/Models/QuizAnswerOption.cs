using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("QuizAnswerOption")]
[Index("QuizQuestionId", Name = "IX_QuizAnswerOption_QuestionId")]
public partial class QuizAnswerOption
{
    [Key]
    public int QuizAnswerOptionId { get; set; }

    public int QuizQuestionId { get; set; }

    public string AnswerText { get; set; } = null!;

    public bool IsCorrect { get; set; }

    public bool IsActive { get; set; }

    public int OrderIndex { get; set; }

    [InverseProperty("SelectedOption")]
    public virtual ICollection<QuizAttemptAnswer> QuizAttemptAnswers { get; set; } = new List<QuizAttemptAnswer>();

    [ForeignKey("QuizQuestionId")]
    [InverseProperty("QuizAnswerOptions")]
    public virtual QuizQuestion QuizQuestion { get; set; } = null!;
}
