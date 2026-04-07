using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.QuizAttempt
{
    public class QuizAttemptCreateDto
    {
        [JsonPropertyName("quizId")]
        [Required]
        public int QuizId { get; set; }

    }
}
