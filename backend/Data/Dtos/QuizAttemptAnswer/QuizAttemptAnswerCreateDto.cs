using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAttemptAnswer
{
    public class QuizAttemptAnswerCreateDto
    {
        [JsonPropertyName("quizQuestionId")]
        [Required]
        public int QuizQuestionId { get; set; }

        [JsonPropertyName("selectedOptionId")]
        public int? SelectedOptionId { get; set; }

        [JsonPropertyName("openAnswerText")]
        public string? OpenAnswerText { get; set; }
    }
}
