using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace Data.Dtos.User
{
    public class UserCreateDto
    {
        [JsonPropertyName("displayName")]
        [Required,StringLength(200)]
        public string? DisplayName { get; set; }

        [JsonPropertyName("preferredLanguage")]
        [StringLength(50)]
        public string? PreferredLanguage { get; set; }

        [JsonPropertyName("bio")]
        [StringLength(1000)]
        public string? Bio { get; set; }
    }
}
