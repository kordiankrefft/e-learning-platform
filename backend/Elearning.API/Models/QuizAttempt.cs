using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace Elearning.API.Models;

[Table("QuizAttempt")]
[Index("QuizId", Name = "IX_QuizAttempt_QuizId")]
[Index("UserId", Name = "IX_QuizAttempt_UserId")]
public partial class QuizAttempt
{
    [Key]
    public int QuizAttemptId { get; set; }

    public int QuizId { get; set; }

    public int UserId { get; set; }

    public bool IsActive { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime? SubmittedAt { get; set; }

    [Column(TypeName = "decimal(10, 2)")]
    public decimal? ScoreTotal { get; set; }

    [Column(TypeName = "decimal(5, 2)")]
    public decimal? ScorePercent { get; set; }

    public bool? Passed { get; set; }

    [ForeignKey("QuizId")]
    [InverseProperty("QuizAttempts")]
    public virtual Quiz Quiz { get; set; } = null!;

    [InverseProperty("QuizAttempt")]
    public virtual ICollection<QuizAttemptAnswer> QuizAttemptAnswers { get; set; } = new List<QuizAttemptAnswer>();

    [ForeignKey("UserId")]
    [InverseProperty("QuizAttempts")]
    public virtual User User { get; set; } = null!;
}
