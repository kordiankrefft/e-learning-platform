using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.User;

public class UserEditDto
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
