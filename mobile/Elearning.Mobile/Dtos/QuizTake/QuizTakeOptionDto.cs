using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.QuizTake;

public class QuizTakeOptionDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("orderIndex")]
    public int OrderIndex { get; set; }

    [JsonPropertyName("answerText")]
    public string AnswerText { get; set; } = "";
}
