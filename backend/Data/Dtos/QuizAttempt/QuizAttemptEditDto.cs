using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAttempt
{
    public class QuizAttemptEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("submittedAt")]
        public DateTime? SubmittedAt { get; set; }

        [JsonPropertyName("scoreTotal")]
        public decimal? ScoreTotal { get; set; }

        [JsonPropertyName("scorePercent")]
        public decimal? ScorePercent { get; set; }

        [JsonPropertyName("passed")]
        public bool? Passed { get; set; }
    }
}
