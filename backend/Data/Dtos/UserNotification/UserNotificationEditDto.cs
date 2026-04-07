using System.Text.Json.Serialization;

namespace Data.Dtos.UserNotification
{
    public class UserNotificationEditDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("isRead")]
        public bool IsRead { get; set; }
    }
}
