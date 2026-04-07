using Data.Dtos.QuizTake;
using System.Text.Json.Serialization;

public class QuizTakeQuestionDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("questionText")]
    public string QuestionText { get; set; } = null!;

    [JsonPropertyName("questionType")]
    public string QuestionType { get; set; } = null!;

    [JsonPropertyName("points")]
    public decimal Points { get; set; }

    [JsonPropertyName("orderIndex")]
    public int OrderIndex { get; set; }

    [JsonPropertyName("options")]
    public List<QuizTakeAnswerOptionDto> Options { get; set; } = new();
}