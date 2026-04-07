using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.SupportTicket;

public class SupportTicketCreateDto
{
    [JsonPropertyName("courseId")]
    public int? CourseId { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("status")]
    public string Status { get; set; } = "Open";
}
