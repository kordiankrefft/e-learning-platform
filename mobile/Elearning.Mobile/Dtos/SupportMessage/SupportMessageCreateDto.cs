using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.SupportMessage;

public class SupportMessageCreateDto
{
    [JsonPropertyName("supportTicketId")]
    public int SupportTicketId { get; set; }

    [JsonPropertyName("messageBody")]
    public string MessageBody { get; set; } = "";
}
