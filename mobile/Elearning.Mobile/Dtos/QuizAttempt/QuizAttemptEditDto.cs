using System;
using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.QuizAttempt;

public class QuizAttemptEditDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("submittedAt")]
    public string? SubmittedAt { get; set; }
}
