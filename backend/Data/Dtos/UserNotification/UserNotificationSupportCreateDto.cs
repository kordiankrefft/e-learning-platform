using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.UserNotification
{
    public class UserNotificationSupportCreateDto
    {
        [JsonPropertyName("userId")]
        [Required]
        public int UserId { get; set; }

        [JsonPropertyName("title")]
        [Required, StringLength(200)]
        public string? Title { get; set; }

        [JsonPropertyName("body")]
        [Required]
        public string? Body { get; set; }

        [JsonPropertyName("supportTicketId")]
        [Required]
        public int SupportTicketId { get; set; }

        [JsonPropertyName("supportMessageId")]
        public int? SupportMessageId { get; set; }
    }
}
