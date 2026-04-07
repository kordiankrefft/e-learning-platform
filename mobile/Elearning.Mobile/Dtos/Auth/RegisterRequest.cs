using System.Text.Json.Serialization;

namespace Elearning.Mobile.Dtos.Auth;

public class RegisterRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = "";

    [JsonPropertyName("password")]
    public string Password { get; set; } = "";
}
