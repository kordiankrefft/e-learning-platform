using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAnswerOption
{
    public class QuizAnswerOptionEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("quizQuestionId")]
        [Required]
        public int QuizQuestionId { get; set; }

        [JsonPropertyName("answerText")]
        [Required]
        public string? AnswerText { get; set; }

        [JsonPropertyName("isCorrect")]
        public bool IsCorrect { get; set; }

        [JsonPropertyName("orderIndex")]
        [Required]
        public int OrderIndex { get; set; }
    }
}
