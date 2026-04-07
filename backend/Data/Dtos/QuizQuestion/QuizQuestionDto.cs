using System.Text.Json.Serialization;

namespace Data.Dtos.QuizQuestion
{
    public class QuizQuestionDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("quizId")]
        public int QuizId { get; set; }

        [JsonPropertyName("quizTitle")]
        public string QuizTitle { get; set; } = null!;

        [JsonPropertyName("questionText")]
        public string QuestionText { get; set; } = null!;

        [JsonPropertyName("questionType")]
        public string QuestionType { get; set; } = null!;

        [JsonPropertyName("points")]
        public decimal Points { get; set; }

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
