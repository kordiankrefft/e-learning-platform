using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.QuizAttempt;

public class QuizAttemptCreateResponseDto
{
    [JsonPropertyName("attemptId")]
    public int AttemptId { get; set; }
}
