using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAttempt
{
    public class QuizAttemptDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("quizId")]
        public int QuizId { get; set; }

        [JsonPropertyName("quizTitle")]
        public string QuizTitle { get; set; } = null!;

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; } = null!;

        [JsonPropertyName("startedAt")]
        public DateTime StartedAt { get; set; }

        [JsonPropertyName("submittedAt")]
        public DateTime? SubmittedAt { get; set; }

        [JsonPropertyName("scoreTotal")]
        public decimal? ScoreTotal { get; set; }

        [JsonPropertyName("scorePercent")]
        public decimal? ScorePercent { get; set; }

        [JsonPropertyName("passed")]
        public bool? Passed { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
