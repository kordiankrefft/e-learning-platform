using System.Text.Json.Serialization;

namespace Data.Dtos.QuizTake
{
    public class QuizTakeAnswerOptionDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("answerText")]
        public string AnswerText { get; set; } = null!;

        [JsonPropertyName("orderIndex")]
        public int OrderIndex { get; set; }
    }
}
