using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.SupportMessage;

public class SupportMessageDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("supportTicketId")]
    public int SupportTicketId { get; set; }

    [JsonPropertyName("supportTicketTitle")]
    public string? SupportTicketTitle { get; set; }

    [JsonPropertyName("fromUserId")]
    public int FromUserId { get; set; }

    [JsonPropertyName("fromUserName")]
    public string FromUserName { get; set; } = "";

    [JsonPropertyName("messageBody")]
    public string MessageBody { get; set; } = "";

    [JsonPropertyName("sentAt")]
    public DateTime SentAt { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
}
