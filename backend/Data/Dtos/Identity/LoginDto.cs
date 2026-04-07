using System.Text.Json.Serialization;

namespace Data.Dtos.Identity
{
    public class LoginDto
    {
        [JsonPropertyName("email")]   
        required public string Email { get; set; }

        [JsonPropertyName("password")]
        required public string Password { get; set; }
    }
}
