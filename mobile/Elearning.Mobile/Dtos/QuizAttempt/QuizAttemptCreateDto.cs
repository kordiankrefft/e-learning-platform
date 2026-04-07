using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.QuizAttempt;

public class QuizAttemptCreateDto
{
    [JsonPropertyName("quizId")]
    public int QuizId { get; set; }
}
