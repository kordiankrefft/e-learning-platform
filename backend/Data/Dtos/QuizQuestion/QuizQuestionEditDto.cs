using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.QuizQuestion
{
    public class QuizQuestionEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("quizId")]
        [Required]
        public int QuizId { get; set; }

        [JsonPropertyName("questionText")]
        [Required]
        public string? QuestionText { get; set; }

        [JsonPropertyName("questionType")]
        [Required, StringLength(50)]
        public string? QuestionType { get; set; }

        [JsonPropertyName("points")]
        [Required]
        public decimal Points { get; set; }

        [JsonPropertyName("orderIndex")]
        [Required]
        public int OrderIndex { get; set; }
    }
}
