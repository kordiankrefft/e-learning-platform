using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.AuditLog
{
    public class AuditLogDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("userId")]
        public int? UserId { get; set; }

        [JsonPropertyName("userName")]
        public string UserName { get; set; } = null!;

        [JsonPropertyName("actionType")]
        public string ActionType { get; set; } = null!;

        [JsonPropertyName("entityName")]
        public string EntityName { get; set; } = null!;

        [JsonPropertyName("entityId")]
        public string EntityId { get; set; } = null!;

        [JsonPropertyName("details")]
        public string? Details { get; set; }

        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; }

        [JsonPropertyName("isActive")]
        public bool IsActive { get; set; }
    }
}
