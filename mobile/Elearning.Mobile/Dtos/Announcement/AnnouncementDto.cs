using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.Announcement;

public class AnnouncementDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("title")]
    public string Title { get; set; } = "";

    [JsonPropertyName("body")]
    public string Body { get; set; } = "";

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("createdAt")]
    public string? CreatedAt { get; set; }
}
