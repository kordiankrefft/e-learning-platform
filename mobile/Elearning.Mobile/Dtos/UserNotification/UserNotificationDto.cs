using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.UserNotification;

public class UserNotificationDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("isRead")]
    public bool IsRead { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("supportTicketId")]
    public int? SupportTicketId { get; set; }

    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
}
