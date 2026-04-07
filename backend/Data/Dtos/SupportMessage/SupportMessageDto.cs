using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.SupportMessage
{
    public class SupportMessageDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("supportTicketId")]
        public int SupportTicketId { get; set; }

        [JsonPropertyName("supportTicketTitle")]
        public string SupportTicketTitle { get; set; } = null!;

        [JsonPropertyName("fromUserId")]
        public int FromUserId { get; set; }

        [JsonPropertyName("fromUserName")]
        public string FromUserName { get; set; } = null!;

        [JsonPropertyName("messageBody")]
        public string MessageBody { get; set; } = null!;

        [JsonPropertyName("sentAt")]
        public DateTime SentAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
