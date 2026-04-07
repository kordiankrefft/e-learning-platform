using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.QuizTake;

public class QuizTakeQuestionDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("orderIndex")]
    public int OrderIndex { get; set; }

    [JsonPropertyName("questionText")]
    public string QuestionText { get; set; } = "";

    [JsonPropertyName("questionType")]
    public string QuestionType { get; set; } = ""; 

    [JsonPropertyName("points")]
    public decimal Points { get; set; }

    [JsonPropertyName("options")]
    public List<QuizTakeOptionDto> Options { get; set; } = new();
}
