using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.UserNotification
{
    public class UserNotificationDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("userId")]
        public int UserId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; } = null!;

        [JsonPropertyName("title")]
        public string Title { get; set; } = null!;

        [JsonPropertyName("body")]
        public string Body { get; set; } = null!;

        [JsonPropertyName("isRead")]
        public bool IsRead { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }

        [JsonPropertyName("supportTicketId")]
        public int? SupportTicketId { get; set; }

        [JsonPropertyName("supportTicketTitle")]
        public string SupportTicketTitle { get; set; } = null!;

        [JsonPropertyName("supportMessageId")]
        public int? SupportMessageId { get; set; }

        [JsonPropertyName("supportMessageBody")]
        public string SupportMessageBody { get; set; } = null!;
    }
}
