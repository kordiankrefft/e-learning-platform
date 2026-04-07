using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAnswerOption
{
    public class QuizAnswerOptionDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("quizQuestionId")]
        public int QuizQuestionId { get; set; }

        [JsonPropertyName("quizQuestionText")]
        public string? QuizQuestionText { get; set; }

        [JsonPropertyName("answerText")]
        public string AnswerText { get; set; } = null!;

        [JsonPropertyName("isCorrect")]
        public bool IsCorrect { get; set; }

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
