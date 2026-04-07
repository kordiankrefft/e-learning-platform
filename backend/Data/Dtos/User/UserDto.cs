using System;
using System.Text.Json.Serialization;

namespace Data.Dtos.User
{
    public class UserDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("displayName")]
        public string? DisplayName { get; set; }

        [JsonPropertyName("preferredLanguage")]
        public string? PreferredLanguage { get; set; }

        [JsonPropertyName("bio")]
        public string? Bio { get; set; }


    }
}
