using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.QuizAttemptAnswer;

public class QuizAttemptAnswerCreateDto
{
    [JsonPropertyName("quizQuestionId")]
    public int QuizQuestionId { get; set; }

    [JsonPropertyName("selectedOptionId")]
    public int? SelectedOptionId { get; set; }

    [JsonPropertyName("openAnswerText")]
    public string? OpenAnswerText { get; set; }
}
