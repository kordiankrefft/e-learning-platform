using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.User;

public class UserCreateDto
{
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }

    [JsonPropertyName("preferredLanguage")]
    public string? PreferredLanguage { get; set; }

    [JsonPropertyName("bio")]
    public string? Bio { get; set; }
}
