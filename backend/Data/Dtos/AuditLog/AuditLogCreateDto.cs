using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.AuditLog
{
    public class AuditLogCreateDto
    {
        [JsonPropertyName("userId")]
        public int? UserId { get; set; }

        [JsonPropertyName("actionType")]
        [Required, StringLength(100)]
        public string ActionType { get; set; } = null!;

        [JsonPropertyName("entityName")]
        [Required, StringLength(100)]
        public string EntityName { get; set; } = null!;

        [JsonPropertyName("entityId")]
        [Required, StringLength(100)]
        public string EntityId { get; set; } = null!;

        [JsonPropertyName("details")]
        public string? Details { get; set; }
    }
}
