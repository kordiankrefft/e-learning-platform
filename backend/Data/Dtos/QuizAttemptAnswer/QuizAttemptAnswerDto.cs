using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAttemptAnswer
{
    public class QuizAttemptAnswerDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("quizAttemptId")]
        public int QuizAttemptId { get; set; }

        [JsonPropertyName("quizQuestionId")]
        public int QuizQuestionId { get; set; }

        [JsonPropertyName("quizQuestionText")]
        public string? QuizQuestionText { get; set; }

        [JsonPropertyName("selectedOptionId")]
        public int? SelectedOptionId { get; set; }

        [JsonPropertyName("selectedOptionText")]
        public string? SelectedOptionText { get; set; }

        [JsonPropertyName("openAnswerText")]
        public string? OpenAnswerText { get; set; }

        [JsonPropertyName("isMarkedCorrect")]
        public bool? IsMarkedCorrect { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
